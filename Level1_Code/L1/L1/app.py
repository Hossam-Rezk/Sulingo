import os
import sys
import asyncio
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import pickle
import concurrent.futures
import multiprocessing

# ==========================================
# 0. THE ULTIMATE ISOLATION MAGIC
# ==========================================
# Uvicorn on Windows crashes if MediaPipe C++ threads load in the main server.
# We ONLY import MediaPipe when our isolated background worker boots up!
is_worker = multiprocessing.current_process().name != 'MainProcess'

if is_worker:
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
    os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
    import cv2
    import mediapipe as mp
    mp_hands = mp.solutions.hands

# ==========================================
# 1. INITIALIZATION
# ==========================================
app = FastAPI(title="Sign Language Geometry API", version="1.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_FILE = "geometry_model.pkl"
LABEL_ENCODER_FILE = "label_encoder.pkl"

if not is_worker:
    print("Loading Geometry Model...")

try:
    if os.path.exists(MODEL_FILE) and os.path.exists(LABEL_ENCODER_FILE):
        with open(MODEL_FILE, 'rb') as f:
            model = pickle.load(f)
        with open(LABEL_ENCODER_FILE, 'rb') as f:
            lb = pickle.load(f)
        classes = lb.classes_
        if not is_worker:
            print("✅ Model loaded successfully. API is ready.")
    else:
        model, lb, classes = None, None, None
        if not is_worker:
            print("❌ ERROR: .pkl files not found! API will fail.")
except Exception as e:
    model, lb, classes = None, None, None
    if not is_worker:
        print(f"\n❌ CRASH PREVENTED: Failed to load model.\nDetails: {e}\n")

# Initialize a singleton ProcessPoolExecutor for the main server
executor = None

@app.on_event("startup")
def startup_event():
    global executor
    # max_workers=1 ensures only one heavy MediaPipe process runs at a time
    executor = concurrent.futures.ProcessPoolExecutor(max_workers=1)

@app.on_event("shutdown")
def shutdown_event():
    if executor:
        executor.shutdown(wait=True)

# ==========================================
# 2. DATA MODELS & HELPERS
# ==========================================
class LandmarkRequest(BaseModel):
    # Expects exactly 42 floats [x0, y0, x1, y1 ... x20, y20]
    landmarks: list[float]

def perform_prediction(points):
    """Helper function to perform the math and prediction"""
    wrist_x = points[0]
    wrist_y = points[1]

    normal_points = []
    flipped_points = []

    # Apply double inference math (normal + flipped)
    for i in range(0, 42, 2):
        x = points[i] - wrist_x
        y = points[i + 1] - wrist_y

        normal_points.extend([x, y])
        flipped_points.extend([-x, y])

    input_batch = np.array([normal_points, flipped_points])
    all_probs = model.predict_proba(input_batch)

    # Normal
    prob1 = all_probs[0]
    idx1 = np.argmax(prob1)
    conf1 = float(prob1[idx1])

    # Flipped
    prob2 = all_probs[1]
    idx2 = np.argmax(prob2)
    conf2 = float(prob2[idx2])

    if conf1 > conf2:
        return str(classes[idx1]), conf1
    else:
        return str(classes[idx2]), conf2

# ==========================================
# 3. ISOLATED WORKER FUNCTION
# ==========================================
def extract_landmarks(img_path):
    """Runs natively inside the secure ProcessPool Worker."""
    try:
        global mp_hands, cv2

        # Read image
        img = cv2.imread(img_path)
        if img is None:
            return {"error": "Invalid image file."}

        # =============================
        # Preprocessing for better detection
        # =============================
        img = cv2.resize(img, (640, 480))  # standard resolution
        alpha = 1.5  # contrast
        beta = 30    # brightness
        img = cv2.convertScaleAbs(img, alpha=alpha, beta=beta)

        # Process with MediaPipe
        with mp_hands.Hands(
            static_image_mode=True,
            max_num_hands=1,
            model_complexity=1,
            min_detection_confidence=0.3
        ) as hands:

            results = hands.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

            if not results.multi_hand_landmarks:
                return {"error": "No hand detected in the uploaded image. Please try a clearer picture."}

            points = []
            for lm in results.multi_hand_landmarks[0].landmark:
                points.extend([lm.x, lm.y])
            return {"points": points}

    except Exception as e:
        import traceback
        return {"error": f"Worker crashed!\n{traceback.format_exc()}"}

# ==========================================
# 4. API ENDPOINTS
# ==========================================
@app.get("/")
def health_check():
    return {"status": "Active", "model_loaded": model is not None}

@app.post("/predict")
async def predict_sign(request: LandmarkRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="AI Model not loaded.")
    points = request.landmarks
    if len(points) != 42:
        raise HTTPException(status_code=400, detail="Expected exactly 42 coordinates (21 x,y pairs).")
    try:
        final_label, final_conf = perform_prediction(points)
        return {"prediction": final_label, "confidence": final_conf}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict-image")
async def predict_image(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="AI Model not loaded.")
    if executor is None:
        raise HTTPException(status_code=500, detail="Process Pool not ready.")

    img_path = os.path.join(os.getcwd(), "_temp_upload.jpg")

    try:
        contents = await file.read()
        with open(img_path, "wb") as f:
            f.write(contents)

        loop = asyncio.get_running_loop()
        data = await loop.run_in_executor(executor, extract_landmarks, img_path)

        if "error" in data:
            raise HTTPException(status_code=400, detail=data["error"])

        points = data["points"]
        final_label, final_conf = perform_prediction(points)

        return {"prediction": final_label, "confidence": final_conf}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing error: {str(e)}")
    finally:
        if os.path.exists(img_path):
            try:
                os.remove(img_path)
            except:
                pass

# ==========================================
# 5. SERVER LAUNCHER
# ==========================================
if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*50)
    print("STARTING SERVER (NATIVE PROCESS ISOLATION ENABLED)")
    print("="*50 + "\n")
    uvicorn.run(app, host="127.0.0.1", port=8000)
