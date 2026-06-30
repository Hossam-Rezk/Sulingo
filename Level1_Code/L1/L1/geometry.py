import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import LabelBinarizer
import csv
import os

DATA_FILE = "hand_landmarks.csv"
MODEL_FILE = "geometry_model.pkl"
LABEL_ENCODER_FILE = "label_encoder.pkl"


def load_data_from_csv(filename):
    inputs = []
    labels = []

    with open(filename, 'r') as f:
        reader = csv.reader(f)
        next(reader)  # Skip header
        for row in reader:
            labels.append(row[0])
            # Convert coordinates to float
            coords = [float(x) for x in row[1:]]
            inputs.append(coords)

    return np.array(inputs), np.array(labels)


def train():
    print("Loading CSV data...")
    if not os.path.exists(DATA_FILE):
        print(f"Error: {DATA_FILE} not found. Run create_dataset.py first!")
        return

    X, y_raw = load_data_from_csv(DATA_FILE)
    print(f"Loaded {len(X)} samples.")

    # 1. Normalize inputs relative to the wrist (Point 0)
    # This makes the model "translation invariant" (hand can be anywhere on screen)
    print("Normalizing coordinates...")
    for i in range(len(X)):
        # x0, y0 are at indices 0 and 1
        wrist_x = X[i, 0]
        wrist_y = X[i, 1]

        for j in range(0, 42, 2):
            X[i, j] -= wrist_x  # Offset x
            X[i, j + 1] -= wrist_y  # Offset y

    # 2. Encode Labels
    lb = LabelBinarizer()
    y = lb.fit_transform(y_raw)

    # Save the label encoder so the main app knows 'A', 'B', etc.
    with open(LABEL_ENCODER_FILE, 'wb') as f:
        pickle.dump(lb, f)

    # 3. Split Data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=42)

    # 4. Define Model (Multi-Layer Perceptron)
    # A simple Neural Network
    clf = MLPClassifier(
        hidden_layer_sizes=(128, 64),
        activation='relu',
        solver='adam',
        max_iter=500,
        random_state=42,
        verbose=True
    )

    print("Training Neural Network...")
    clf.fit(X_train, y_train)

    # 5. Evaluate
    score = clf.score(X_test, y_test)
    print(f"Validation Accuracy: {score * 100:.2f}%")

    # 6. Save Model
    with open(MODEL_FILE, 'wb') as f:
        pickle.dump(clf, f)
    print(f"Success! Model saved to {MODEL_FILE}")


if __name__ == "__main__":
    train()