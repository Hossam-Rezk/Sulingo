import cv2
import mediapipe as mp

# Absolute path to your image
image_path = r"C:\Users\omart\Desktop\GP 2\asl_alphabet_test\V_test.jpg"

# Check if the file exists
import os
print("Exists:", os.path.exists(image_path))

img = cv2.imread(image_path)
if img is None:
    print("Image not loaded.")
else:
    print("Image loaded successfully.")

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands

with mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    model_complexity=1,
    min_detection_confidence=0.3
) as hands:

    results = hands.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

    if results.multi_hand_landmarks:
        print("Hand detected ✅")
    else:
        print("No hand detected ❌")
