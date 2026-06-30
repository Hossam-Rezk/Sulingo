import os
import cv2
import mediapipe as mp
import csv
import numpy as np

# ==========================================
# CONFIGURATION
# ==========================================
DATA_DIR = "./asl_alphabet_train"
OUTPUT_FILE = "hand_landmarks.csv"

# Define labels (A-Z)
LABELS = sorted(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
                 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'])

# Initialize MediaPipe
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, max_num_hands=1, min_detection_confidence=0.5)


def create_csv():
    print(f"Scanning {DATA_DIR}...")

    # Open CSV file for writing
    with open(OUTPUT_FILE, mode='w', newline='') as f:
        writer = csv.writer(f)

        # Write Header: label, x0, y0, x1, y1 ... x20, y20
        header = ['label']
        for i in range(21):
            header.extend([f'x{i}', f'y{i}'])
        writer.writerow(header)

        total_count = 0
        success_count = 0

        for label in LABELS:
            folder_path = os.path.join(DATA_DIR, label)
            if not os.path.exists(folder_path): continue

            file_list = os.listdir(folder_path)
            print(f"Processing Class '{label}' ({len(file_list)} images)...")

            for filename in file_list:
                img_path = os.path.join(folder_path, filename)

                try:
                    # Read image
                    img = cv2.imread(img_path)
                    if img is None: continue

                    # Convert to RGB
                    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

                    # Process with MediaPipe
                    results = hands.process(img_rgb)

                    if results.multi_hand_landmarks:
                        for hand_landmarks in results.multi_hand_landmarks:
                            # Extract normalized coordinates (0.0 to 1.0)
                            row = [label]
                            for lm in hand_landmarks.landmark:
                                row.extend([lm.x, lm.y])

                            writer.writerow(row)
                            success_count += 1
                            break  # Only take the first hand found

                except Exception:
                    pass

                total_count += 1
                if total_count % 1000 == 0:
                    print(f"  -> Processed {total_count} images (Found hands in {success_count})")

    print("=" * 40)
    print(f"DONE. Extracted {success_count} samples to {OUTPUT_FILE}")
    print("=" * 40)


if __name__ == "__main__":
    create_csv()