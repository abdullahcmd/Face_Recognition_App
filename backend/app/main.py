from fastapi import FastAPI, File, UploadFile
import numpy as np
import cv2
from model_utils import recognize_face, mark_attendance, get_attendance  # 🧩 Added get_attendance import
from PIL import Image
import io
import pillow_heif

app = FastAPI()


@app.post("/recognize/")
async def recognize(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        # 🧩 Try reading image normally
        npimg = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

        # 🪄 If failed (HEIC or unsupported format), convert using Pillow
        if image is None:
            try:
                heif_file = pillow_heif.read_heif(io.BytesIO(contents))
                pil_image = Image.frombytes(
                    heif_file.mode, heif_file.size, heif_file.data
                )
                image_bytes = io.BytesIO()
                pil_image.save(image_bytes, format="JPEG")
                npimg = np.frombuffer(image_bytes.getvalue(), np.uint8)
                image = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
            except Exception:
                raise ValueError("Invalid image file or unsupported format")

        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        result = recognize_face(rgb_image)

        # 🧾 Mark attendance if recognized
        mark_attendance(result)

        return {"result": result}

    except Exception as e:
        print("❌ Error during recognition:", e)
        return {"error": str(e)}, 400


# 🆕 New API to view attendance
@app.get("/attendance/")
async def attendance():
    try:
        data = get_attendance()
        return {"attendance": data}
    except Exception as e:
        print("❌ Error reading attendance:", e)
        return {"error": str(e)}, 400
