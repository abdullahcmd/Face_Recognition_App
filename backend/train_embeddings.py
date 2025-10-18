# backend/train_embeddings.py
import os
import pickle
from pathlib import Path
import face_recognition
import cv2
import numpy as np
from PIL import Image

# 👇 Add HEIC support
try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
except ImportError:
    print("⚠️ pillow-heif not installed. Run: pip install pillow-heif")

dataset_dir = Path("./dataset")  # run from backend/
output_file = "model.pkl"

known_encodings = []
known_names = []

target_size = (160, 160)  # 👈 desired face size

for person_dir in sorted(dataset_dir.iterdir()):
    if not person_dir.is_dir():
        continue

    name = person_dir.name

    for img_path in person_dir.glob("*"):
        try:
            # If file is HEIC, convert to JPG first
            if img_path.suffix.lower() == ".heic":
                jpg_path = img_path.with_suffix(".jpg")
                if not jpg_path.exists():  # avoid reconverting
                    image = Image.open(img_path)
                    image.save(jpg_path, "JPEG")
                    print(f"🖼️ Converted {img_path.name} → {jpg_path.name}")
                img_path = jpg_path  # use converted image

            # Load image using face_recognition
            image = face_recognition.load_image_file(img_path)

            # Detect face locations
            face_locations = face_recognition.face_locations(image)
            if len(face_locations) == 0:
                print(f"No faces found in {img_path}, skipping.")
                continue

            # Use the first face found
            top, right, bottom, left = face_locations[0]
            face_image = image[top:bottom, left:right]

            # Resize to (160, 160)
            face_image = cv2.resize(face_image, target_size)

            # Re-encode the resized face
            encs = face_recognition.face_encodings(face_image)
            if len(encs) == 0:
                print(f"No encodings from {img_path}, skipping.")
                continue

            known_encodings.append(encs[0])
            known_names.append(name)

        except Exception as e:
            print("Error processing", img_path, e)

# Save encodings
data = {"encodings": known_encodings, "names": known_names}
with open(output_file, "wb") as f:
    pickle.dump(data, f)

print(f"✅ Saved {len(known_encodings)} encodings to {output_file}")
