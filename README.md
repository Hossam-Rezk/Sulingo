# Sulingo — ASL Learning App

An interactive American Sign Language (ASL) learning web app with real-time hand-sign detection via webcam.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | FastAPI + Uvicorn |
| AI / CV | MediaPipe, scikit-learn (Random Forest) |
| Verification | Google Gemini API |

---

## Project Structure

```
Source Code/
├── frontend/          # React web app
├── Level1_Code/       # Letter recognition backend
├── Level2_Code/       # Word recognition backend
├── Level3_Code/       # Sentence practice backend (API.py)
├── requirements.txt   # Python dependencies
├── .env               # API keys (not committed)
└── README.md
```

---

## Setup

### Prerequisites
- **Node.js** v18+
- **Python** 3.10+

---

### 1 — Backend

**Create a virtual environment** (choose one):

```bash
# Option A: venv
python -m venv sulingo_env

# Activate — Windows
sulingo_env\Scripts\activate

# Activate — Mac / Linux
source sulingo_env/bin/activate
```

```bash
# Option B: Conda
conda create -n sulingo_api python=3.10
conda activate sulingo_api
```

**Install dependencies:**

```bash
pip install -r requirements.txt
```

**Add your API key** — create a `.env` file in the root folder:

```env
GEMINI_API_KEY=your_key_here
```

**Place the model files** inside `Level3_Code/`:
- `sign_language_rf_augmented.pkl`
- `word_mapping.pkl`
- `hand_landmarker.task`

**Start the backend:**

```bash
cd Level3_Code
python -m uvicorn API:app --host 127.0.0.1 --port 8001
```

> ✅ API is now running at `http://localhost:8001`

---

### 2 — Frontend

Open a **new terminal**, then:

```bash
cd frontend
npm install
npm run dev
```

> ✅ App is now running at `http://localhost:5173`

---

## Usage

| Level | Description |
|-------|-------------|
| Level 1 | Learn and practice the ASL alphabet with camera detection |
| Level 2 | Learn and practice individual words with real-time prediction |
| Level 3 | Practice full sentences using only the 8 core vocabulary words |

**Core vocabulary (Level 3):** `Hello` · `Yes` · `No` · `Please` · `Want` · `Sorry` · `Help` · `Good`

---

## Notes

- The backend must be running **before** you open the camera test in the browser.
- The camera test needs ~3 seconds of hand visibility before making its first prediction (30-frame buffer).
- Videos and model `.pkl` files are **not** included in the repo — place them manually as described above.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| WebSocket closes immediately (404) | Make sure you run `python -m uvicorn ...` inside your activated virtual environment |
| `Model loaded: None` | Ensure `.pkl` files are inside `Level3_Code/`, not the root folder |
| No predictions appearing | Keep your hand visible for at least 3 seconds to fill the 30-frame buffer |
| Push fails with large file error | Run `git rm -r --cached frontend/public/videos/` then commit and push again |
