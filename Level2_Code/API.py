# api.py
import os
import pickle
import asyncio
import tempfile
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import cv2
import mediapipe as mp

# ==========================================
# 1. INITIALIZATION
# ==========================================
app = FastAPI(title="Sign Language Words API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your model
print("Loading Words Model...")
try:
    with open("sign_language_rf_augmented.pkl", "rb") as f:
        model = pickle.load(f)
    with open("word_mapping.pkl", "rb") as f:
        word_to_idx = pickle.load(f)
    idx_to_word = {v: k for k, v in word_to_idx.items()}
    print(f"✅ Model loaded! Words: {list(word_to_idx.keys())}")
except Exception as e:
    model, word_to_idx, idx_to_word = None, None, None
    print(f"❌ Model load failed: {e}")

# MediaPipe
mp_hands = mp.solutions.hands

# ==========================================
# 2. LANDMARK EXTRACTION
# ==========================================
def extract_landmark_from_frame(frame, hands_detector):
    """Extract normalized landmarks from one frame"""
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands_detector.process(rgb)

    if not result.multi_hand_landmarks:
        return None

    hand = result.multi_hand_landmarks[0]
    coords = np.array([[lm.x, lm.y, lm.z] for lm in hand.landmark]).reshape(21, 3)

    # Signer normalization
    wrist = coords[0]
    coords = coords - wrist
    palm_size = np.linalg.norm(coords[9] - coords[0]) + 1e-6
    coords = coords / palm_size

    return coords.flatten()  # (63,)

def predict_from_landmarks_sequence(landmarks_sequence):
    """Predict word from list of landmarks"""
    if model is None:
        return None, 0.0

    num_frames = 30

    # Pad or trim
    while len(landmarks_sequence) < num_frames:
        landmarks_sequence.append(landmarks_sequence[-1])
    landmarks_sequence = landmarks_sequence[:num_frames]

    features = np.array(landmarks_sequence).reshape(1, -1)  # (1, 1890)
    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]

    word = idx_to_word[prediction]
    confidence = float(probabilities[prediction])

    return word, confidence

# ==========================================
# 3. WEBSOCKET ENDPOINT (real-time camera)
# ==========================================
@app.websocket("/ws/predict-words")
async def websocket_predict(websocket: WebSocket):
    """
    Real-time word prediction via WebSocket
    
    Frontend sends: raw JPEG frame bytes
    Backend sends: JSON { prediction, confidence, frames_collected }
    """
    await websocket.accept()
    print("🔌 WebSocket connected")

    landmarks_buffer = []  # store landmarks from each frame
    NUM_FRAMES = 30

    with mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.3,
        min_tracking_confidence=0.3
    ) as hands:

        try:
            while True:
                # Receive frame from frontend
                frame_bytes = await websocket.receive_bytes()

                # Decode frame
                np_arr = np.frombuffer(frame_bytes, np.uint8)
                frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

                if frame is None:
                    continue

                # Extract landmarks
                landmarks = extract_landmark_from_frame(frame, hands)

                if landmarks is not None:
                    landmarks_buffer.append(landmarks)

                frames_collected = len(landmarks_buffer)

                # When we have enough frames → predict
                if frames_collected >= NUM_FRAMES:
                    word, confidence = predict_from_landmarks_sequence(
                        landmarks_buffer[-NUM_FRAMES:]
                    )

                    await websocket.send_json({
                        "status": "prediction",
                        "prediction": word,
                        "confidence": round(confidence, 3),
                        "frames_collected": frames_collected
                    })

                    # Reset buffer for next word
                    landmarks_buffer = []

                else:
                    # Still collecting frames
                    await websocket.send_json({
                        "status": "collecting",
                        "prediction": None,
                        "confidence": 0,
                        "frames_collected": frames_collected
                    })

        except WebSocketDisconnect:
            print("🔌 WebSocket disconnected")

# ==========================================
# 4. REST ENDPOINT (optional - for testing)
# ==========================================
class LandmarksRequest(BaseModel):
    # List of frames, each frame is 63 floats
    frames: list[list[float]]

@app.post("/predict-words")
def predict_words(request: LandmarksRequest):
    """
    REST endpoint for testing
    Send 30 frames of landmarks manually
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    if len(request.frames) < 15:
        raise HTTPException(status_code=400, detail="Need at least 15 frames")

    word, confidence = predict_from_landmarks_sequence(request.frames)

    return {
        "prediction": word,
        "confidence": round(confidence, 3)
    }

@app.get("/")
def health():
    return {
        "status": "active",
        "model_loaded": model is not None,
        "words": list(word_to_idx.keys()) if word_to_idx else []
    }

# ==========================================
# 5. RUN
# ==========================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)  # port 8001 عشان ميتعارضش مع ليفي