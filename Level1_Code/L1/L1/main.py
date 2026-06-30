import os
import sys

# ==========================================
# --- PROTOBUF & MEDIAPIPE COMPATIBILITY PATCH ---
# ==========================================
# Forces Python to use the compatible pure-python Protobuf implementation.
# This must be declared BEFORE importing mediapipe to prevent:
# AttributeError: 'SymbolDatabase' object has no attribute 'GetPrototype'
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# --- DYNAMIC MONKEYPATCH FOR MODERN PROTOBUF (v4.x & v5.x) ---
# Direct fix for the 'SymbolDatabase' and 'MessageFactory' missing GetPrototype attributes.
try:
    import google.protobuf.symbol_database as symbol_database
    from google.protobuf import message_factory

    # Patch the active SymbolDatabase instance
    sym_db = symbol_database.Default()
    if not hasattr(sym_db, 'GetPrototype'):
        sym_db.GetPrototype = message_factory.GetMessageClass

    # Patch the base MessageFactory class structure
    if hasattr(message_factory, 'MessageFactory'):
        if not hasattr(message_factory.MessageFactory, 'GetPrototype'):
            message_factory.MessageFactory.GetPrototype = lambda self, descriptor: message_factory.GetMessageClass(descriptor)
except Exception:
    pass

try:
    import cv2
    import numpy as np
    import pickle
    import os
    from collections import deque, Counter
except ImportError as e:
    print(f"Error importing baseline libraries: {e}")
    sys.exit(1)

try:
    import mediapipe as mp
except ImportError:
    print("\nError: MediaPipe not installed. Run: pip install mediapipe")
    sys.exit(1)

MODEL_FILE = "geometry_model.pkl"
LABEL_ENCODER_FILE = "label_encoder.pkl"


def run():
    if not os.path.exists(MODEL_FILE) or not os.path.exists(LABEL_ENCODER_FILE):
        print("Model files not found. Run train_geometry.py first.")
        return

    print("Loading Geometry Model...")
    with open(MODEL_FILE, 'rb') as f:
        model = pickle.load(f)

    with open(LABEL_ENCODER_FILE, 'rb') as f:
        lb = pickle.load(f)

    classes = lb.classes_

    cap = cv2.VideoCapture(0)

    mp_hands = mp.solutions.hands
    mp_draw = mp.solutions.drawing_utils
    hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.5)

    # Custom styles to make hand landmarks highly visible in your screenshots/presentation
    landmark_style = mp_draw.DrawingSpec(color=(0, 0, 255), thickness=2, circle_radius=3)   # Red circles for nodes
    connection_style = mp_draw.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2) # Green lines for skeleton

    history = deque(maxlen=10)

    # --- TYPING VARIABLES ---
    typed_text = ""
    last_sign = None
    hold_frames = 0
    REQUIRED_FRAMES = 35
    has_added = False

    print("Live Test Started.")
    print("- Automatic Dual-Hand Support (Double Inference).")
    print("- Landmark Node Overlay Enabled (0-20 mapping).")
    print("- Press 'q' to quit.")

    while True:
        ret, frame = cap.read()
        if not ret: break

        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        current_frame_sign = None

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # Draw standard customized skeletal links
                mp_draw.draw_landmarks(
                    frame,
                    hand_landmarks,
                    mp_hands.HAND_CONNECTIONS,
                    landmark_style,
                    connection_style
                )

                # --- SKELETAL LANDMARK INDICES OVERLAY (0-20) ---
                # This overlays numbers 0 to 20 next to each key joint so you can capture
                # the perfect visual representation for Figure 4.2/Figure 2.2 in your thesis!
                for idx, lm in enumerate(hand_landmarks.landmark):
                    cx, cy = int(lm.x * w), int(lm.y * h)
                    # Small black shadow offset for contrast
                    cv2.putText(frame, str(idx), (cx + 5, cy + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 0), 2)
                    # White foreground text
                    cv2.putText(frame, str(idx), (cx + 5, cy + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)

                # 1. Extract Points
                points = []
                for lm in hand_landmarks.landmark:
                    points.extend([lm.x, lm.y])

                # 2. Normalize (Relative to Wrist)
                wrist_x = points[0]
                wrist_y = points[1]

                normal_points = []
                flipped_points = []

                # Create two versions of the hand: Normal and Horizontally Flipped
                for i in range(0, 42, 2):
                    x = points[i] - wrist_x
                    y = points[i + 1] - wrist_y

                    normal_points.extend([x, y])
                    flipped_points.extend([-x, y])  # Flip X axis

                # 3. DOUBLE INFERENCE (The Fix)
                input_batch = np.array([normal_points, flipped_points])

                # Get probabilities for both versions
                all_probs = model.predict_proba(input_batch)

                # Version 1 (Normal) stats
                prob1 = all_probs[0]
                idx1 = np.argmax(prob1)
                conf1 = prob1[idx1]

                # Version 2 (Flipped) stats
                prob2 = all_probs[1]
                idx2 = np.argmax(prob2)
                conf2 = prob2[idx2]

                # Pick the winner
                if conf1 > conf2:
                    final_label = classes[idx1]
                    final_conf = conf1
                else:
                    final_label = classes[idx2]
                    final_conf = conf2

                # 4. Smoothing
                history.append(final_label)
                most_common = Counter(history).most_common(1)[0][0]

                # Update current sign for typing logic
                if final_conf > 0.5:
                    current_frame_sign = most_common

                # Display
                color = (0, 255, 0) if final_conf > 0.5 else (0, 0, 255)
                text = f"{most_common} ({int(final_conf * 100)}%)"

                cx = int(hand_landmarks.landmark[0].x * w)
                cy = int(hand_landmarks.landmark[0].y * h)
                cv2.putText(frame, text, (cx - 50, cy - 50), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)

                # Progress Bar
                if current_frame_sign == last_sign and current_frame_sign is not None and not has_added:
                    bar_width = int((hold_frames / REQUIRED_FRAMES) * 100)
                    cv2.rectangle(frame, (cx - 50, cy - 40), (cx - 50 + bar_width, cy - 30), (0, 255, 255), -1)

        # --- TYPING LOGIC ---
        if current_frame_sign:
            if current_frame_sign == last_sign:
                hold_frames += 1
                if hold_frames >= REQUIRED_FRAMES and not has_added:
                    typed_text += current_frame_sign
                    has_added = True
            else:
                hold_frames = 0
                has_added = False
                last_sign = current_frame_sign
        else:
            hold_frames = 0
            has_added = False
            last_sign = None

        # --- UI OVERLAY ---
        h, w, _ = frame.shape
        cv2.rectangle(frame, (0, h - 60), (w, h), (50, 50, 50), -1)
        cv2.putText(frame, f"Message: {typed_text}", (20, h - 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

        # --- GRACEFUL WINDOW DISPLAY (OPENCV HEADLESS TRAP FILTER) ---
        try:
            cv2.imshow("Geometry Sign Language", frame)
        except cv2.error as e:
            if "The function is not implemented" in str(e):
                print("\n" + "="*70)
                print("❌ ENVIRONMENT SYSTEM CONFLICT: HEADLESS OPENCV DETECTED")
                print("="*70)
                print("Your local environment is using 'opencv-python-headless'.")
                print("The headless version is for backend servers and CANNOT render GUI windows.")
                print("\n👉 RESOLUTION STEPS:")
                print("   1. Open Command Prompt / PowerShell as Administrator.")
                print("   2. Run the following command:")
                print("      pip uninstall opencv-python opencv-python-headless -y")
                print("   3. Install the visual-supporting version:")
                print("      pip install opencv-python")
                print("="*70 + "\n")
                cap.release()
                sys.exit(1)
            else:
                raise e

        # --- KEYBOARD INPUTS ---
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == 8:  # Backspace
            typed_text = typed_text[:-1]
        elif key == 32:  # Space
            typed_text += " "

    cap.release()
    try:
        cv2.destroyAllWindows()
    except cv2.error:
        pass


if __name__ == "__main__":
    run()