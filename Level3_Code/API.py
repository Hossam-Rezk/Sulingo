# api.py
import os
import sys
import time
import pickle
import asyncio
import urllib.request
import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import cv2
import mediapipe as mp
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision as mp_vision

# ==========================================
# 1. INITIALIZATION
# ==========================================
app = FastAPI(title="Sign Language Sentences API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Your classifier weights
_BASE_DIR    = r"E:\Sulingo\Source Code"
MODEL_PATH   = r"E:\Sulingo\Source Code\Level3_Code\sign_language_rf_augmented.pkl"
MAPPING_PATH = r"E:\Sulingo\Source Code\Level3_Code\word_mapping.pkl"

# MediaPipe hand detection model — auto-downloaded once if missing
HAND_TASK_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hand_landmarker.task")
HAND_TASK_URL  = (
    "https://storage.googleapis.com/mediapipe-models/"
    "hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task"
)

def _ensure_hand_task():
    if not os.path.exists(HAND_TASK_PATH):
        print(f"[mediapipe] hand_landmarker.task not found — downloading once to:")
        print(f"            {HAND_TASK_PATH}")
        try:
            urllib.request.urlretrieve(HAND_TASK_URL, HAND_TASK_PATH)
            print("[mediapipe] Download complete.")
        except Exception as e:
            raise RuntimeError(
                f"Failed to download hand_landmarker.task: {e}\n"
                f"Download it manually from:\n  {HAND_TASK_URL}\n"
                f"and place it at:\n  {HAND_TASK_PATH}"
            )

_ensure_hand_task()

# ==========================================
# 2. LOAD CLASSIFIER WEIGHTS
# ==========================================
print(f"Loading model from: {_BASE_DIR}")
try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(MAPPING_PATH, "rb") as f:
        word_to_idx = pickle.load(f)
    idx_to_word = {v: k for k, v in word_to_idx.items()}
    print(f"[OK] Model loaded! Words: {list(word_to_idx.keys())}")
except Exception as e:
    model, word_to_idx, idx_to_word = None, None, None
    print(f"[ERROR] Model load failed: {e}")

# ==========================================
# 3. MEDIAPIPE HAND DETECTOR
# ==========================================
def _make_detector(num_hands: int = 1) -> mp_vision.HandLandmarker:
    base_options = mp_tasks.BaseOptions(model_asset_path=HAND_TASK_PATH)
    options = mp_vision.HandLandmarkerOptions(
        base_options=base_options,
        num_hands=num_hands,
        min_hand_detection_confidence=0.3,
        min_hand_presence_confidence=0.3,
        min_tracking_confidence=0.3,
    )
    return mp_vision.HandLandmarker.create_from_options(options)

# ==========================================
# 4. LANDMARK EXTRACTION & PREDICTION
# ==========================================
def extract_landmark_from_frame(frame, detector: mp_vision.HandLandmarker):
    """Extract wrist-relative, palm-scale normalized landmarks → (63,)"""
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    result = detector.detect(mp_image)

    if not result.hand_landmarks:
        return None

    hand = result.hand_landmarks[0]
    coords = np.array([[lm.x, lm.y, lm.z] for lm in hand]).reshape(21, 3)

    coords -= coords[0]                                           # wrist-relative
    palm_size = np.linalg.norm(coords[9] - coords[0]) + 1e-6
    coords /= palm_size                                           # scale-normalize

    return coords.flatten()  # (63,)

def predict_from_landmarks_sequence(landmarks_sequence):
    """Run classifier on a 30-frame window → (word, confidence)"""
    if model is None:
        return None, 0.0

    features = np.array(landmarks_sequence).reshape(1, -1)  # (1, 1890)
    prediction    = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]

    word       = idx_to_word[prediction]
    confidence = float(probabilities[prediction])

    return word, confidence

# ==========================================
# 5. GEMINI — STRICT TOKEN VERIFIER
# ==========================================
def verify_token_with_llm(predicted: str, expected: str, confidence: float) -> bool:
    """
    Borderline-confidence secondary check.
    Gemini must reply ONLY 'MATCH' or 'NO_MATCH' — never rephrase or substitute.
    """
    if not GEMINI_API_KEY:
        print("[Gemini] No API key — skipping")
        return False
    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)
        prompt = (
            "You are a strict ASL sign-language token verifier.\n"
            "You must ONLY output 'MATCH' or 'NO_MATCH'. Nothing else.\n\n"
            f"Expected ASL token: {expected}\n"
            f"Model predicted token: {predicted}\n"
            f"Model confidence: {confidence:.1%}\n\n"
            "Does the predicted token correctly represent the expected ASL sign?\n"
            "Respond with exactly one word: MATCH or NO_MATCH"
        )
        response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
        result   = response.text.strip().upper()
        print(f"[Gemini] predicted={predicted!r} expected={expected!r} → {result}")
        return result == "MATCH"
    except Exception as e:
        print(f"[Gemini error] {e}")
        return False

# ==========================================
# 6. WEBSOCKET — Level 3 Sentence Practice
# ==========================================
CONFIDENCE_HIGH = 0.50
CONFIDENCE_LOW  = 0.30
COOLDOWN_SEC    = 1.5

@app.websocket("/ws/sentence-practice")
async def websocket_sentence_practice(websocket: WebSocket):
    """
    Protocol (frontend → backend):
      Binary               : JPEG video frame
      Text "EXPECT:word"   : set expected token for this word attempt

    Protocol (backend → frontend):
      {"status": "collecting"}
      {"status": "correct",  "prediction": ..., "confidence": ...}
      {"status": "wrong",    "expected": ..., "prediction": ..., "confidence": ...}
    """
    await websocket.accept()
    print("[L3] Client connected")

    NUM_FRAMES = 30
    STRIDE     = 15

    landmarks_buffer: list = []
    stride_counter         = 0
    expected_word          = None
    last_accept_time       = 0.0

    detector = _make_detector(num_hands=1)

    try:
        while True:
            message = await websocket.receive()

            # ── Text: set expected word ───────────────────────────────────
            if "text" in message:
                text = message["text"].strip()
                if text.startswith("EXPECT:"):
                    new_word = text[7:].strip().lower()
                    if new_word != expected_word:
                        expected_word    = new_word
                        landmarks_buffer = []
                        stride_counter   = 0
                        last_accept_time = 0.0
                        print(f"[L3] Expecting: {expected_word!r}")
                continue

            # ── Binary: video frame ───────────────────────────────────────
            if "bytes" not in message:
                continue

            np_arr = np.frombuffer(message["bytes"], np.uint8)
            frame  = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if frame is None:
                continue

            landmarks = extract_landmark_from_frame(frame, detector)

            if landmarks is None:
                await websocket.send_json({"status": "collecting"})
                continue

            landmarks_buffer.append(landmarks)
            stride_counter += 1

            if len(landmarks_buffer) < NUM_FRAMES or stride_counter < STRIDE:
                await websocket.send_json({"status": "collecting"})
                continue

            # ── Inference ─────────────────────────────────────────────────
            stride_counter = 0
            word, confidence = predict_from_landmarks_sequence(
                landmarks_buffer[-NUM_FRAMES:]
            )
            print(f"[L3] pred={word!r}({confidence:.1%}) expected={expected_word!r}")

            if confidence < CONFIDENCE_LOW or expected_word is None:
                await websocket.send_json({"status": "collecting"})
                continue

            now = time.time()
            if (now - last_accept_time) < COOLDOWN_SEC:
                await websocket.send_json({"status": "collecting"})
                continue

            predicted_lower = word.lower()
            expected_lower  = expected_word.lower()

            # ── High confidence: trust model ──────────────────────────────
            if confidence >= CONFIDENCE_HIGH:
                if predicted_lower == expected_lower:
                    last_accept_time = now
                    await websocket.send_json({
                        "status": "correct",
                        "prediction": word,
                        "confidence": round(confidence, 3)
                    })
                else:
                    await websocket.send_json({
                        "status": "wrong",
                        "expected": expected_word,
                        "prediction": word,
                        "confidence": round(confidence, 3)
                    })
                continue

            # ── Borderline: ask Gemini ────────────────────────────────────
            is_match = await asyncio.to_thread(
                verify_token_with_llm, word, expected_word, confidence
            )
            if is_match:
                last_accept_time = now
                await websocket.send_json({
                    "status": "correct",
                    "prediction": word,
                    "confidence": round(confidence, 3)
                })
            else:
                await websocket.send_json({
                    "status": "wrong",
                    "expected": expected_word,
                    "prediction": word,
                    "confidence": round(confidence, 3)
                })

    except WebSocketDisconnect:
        print("[L3] Client disconnected")
    except Exception as e:
        print(f"[L3] ERROR: {e}")
    finally:
        detector.close()

