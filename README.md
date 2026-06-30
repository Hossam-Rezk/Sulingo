# Sulingo: ASL Learning App

Sulingo is an interactive American Sign Language (ASL) learning application built with a React frontend and a FastAPI backend. It features live webcam inference using MediaPipe and Custom Random Forest models to track hand landmarks and verify signs in real-time, plus Gemini integration for robust sign verification.

## Project Structure
- `frontend/`: React + Vite web application.
- `Level1_Code/`, `Level2_Code/`, `Level3_Code/`: Python backends for different difficulty levels.
- `requirements.txt`: Python dependencies for the backend.
- `.env`: Environment variables (API keys).

---

## Prerequisites

- **Node.js** (v18+ recommended)
- **Python** (v3.10+ recommended)
- **Conda** or **venv** for managing Python environments.

---

## 1. Setting up the Backend (Python)

1. **Create and activate a virtual environment**
   It's highly recommended to use Conda or venv to avoid conflicts.

   **Option A: Using Python venv (Recommended for most users)**
   ```bash
   python -m venv sulingo_env
   # On Windows:
   sulingo_env\Scripts\activate
   # On Mac/Linux:
   source sulingo_env/bin/activate
   ```

   **Option B: Using Conda**
   ```bash
   conda create -n sulingo_api python=3.10
   conda activate sulingo_api
   ```

2. **Install Python dependencies**
   Install all required packages including FastAPI, Uvicorn, WebSockets, and MediaPipe.
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory (`Source Code/`) and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the API Server**
   Navigate to the level you want to test (e.g., `Level3_Code`) and start Uvicorn.
   *Note: Using `python -m` ensures Windows uses the correct virtual environment.*
   ```bash
   cd Level3_Code
   python -m uvicorn API:app --host 127.0.0.1 --port 8001
   ```
   *The server is now running and ready to accept WebSocket connections from the frontend on `ws://localhost:8001`.*

---

## 2. Setting up the Frontend (React / Vite)

1. **Open a new terminal window** (keep the backend server running in the other).
2. **Navigate to the frontend folder**
   ```bash
   cd frontend
   ```
3. **Install Node dependencies**
   ```bash
   npm install
   ```
4. **Start the Development Server**
   ```bash
   npm run dev
   ```
5. **Open the App**
   Open your browser and navigate to `http://localhost:5173`. 
   
## Troubleshooting

- **404 Not Found / WebSocket Closed Immediately**: This means your backend is running a version of `uvicorn` that does not have the `websockets` library installed. Ensure you run `python -m uvicorn ...` while inside your activated conda environment.
- **Model Load Failed**: Ensure that the `.pkl` files (e.g., `sign_language_rf_augmented.pkl` and `word_mapping.pkl`) are located in the same directory as the `API.py` file you are running (e.g., inside `Level3_Code/`).
- **No Predictions Appearing**: The camera test requires exactly 30 valid frames (about 3 seconds) to fill its buffer before making the first prediction. Keep your hand clearly visible to the camera for a few seconds.
