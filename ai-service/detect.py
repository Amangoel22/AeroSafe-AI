import cv2
from ultralytics import YOLO
from datetime import datetime
import glob
import time
import os
import requests
from config import settings   # ← all config values from .env via config.py

model = YOLO("best.pt")



def get_issue_type(label: str) -> str:
    mapping = {
        "person":       "Security Issue",
        "vehicle":      "Runway Incursion",
        "plane":        "Runway Incursion",
        "bird":         "Wildlife Hazard",
        "Bird":         "Wildlife Hazard",
        "Platalea":     "Wildlife Hazard",
        "Dog":          "Wildlife Hazard",
        "Cat":          "Wildlife Hazard",
        "Cow":          "Wildlife Hazard",
        "Elephant":     "Wildlife Hazard",
        "Sheep":        "Wildlife Hazard",
        "Pig":          "Wildlife Hazard",
        "Giraffe":      "Wildlife Hazard",
        "Deer":         "Wildlife Hazard",
        "obj":          "Foreign Object on Runway",
        "mildcracks":   "Maintenance Required",
        "L1_Hole":      "Maintenance Required",
        "L2_Hole":      "Maintenance Required",
        "severecracks": "Safety Hazard",
        "L3_Hole":      "Safety Hazard",
    }
    return mapping.get(label, "Foreign Object on Runway")


def get_severity(confidence: float) -> str:
    """Returns Title-cased severity to match backend Literal['Low','Medium','High','Critical']"""
    if confidence >= 0.90:
        return "Critical"
    elif confidence >= 0.75:
        return "High"
    elif confidence >= 0.55:
        return "Medium"
    else:
        return "Low"


def build_form_data(alert_count: int, label: str, confidence: float) -> dict:
    """
    Builds a dict that maps exactly to the backend POST /api/complaints Form fields:
      location, issue_type, description, severity, camera_no, camera_location, status_val
    """
    return {
        "location":         settings.LOCATION,
        "issue_type":       get_issue_type(label),
        "description":      f"{label} detected at {datetime.now().strftime('%H:%M:%S')} (conf: {confidence:.1%})",
        "severity":         get_severity(confidence),
        "camera_no":        settings.CAMERA_NAME,
        "camera_location":  settings.LOCATION,
        "status_val":       "Pending",
    }


def send_alert(form_data: dict):
    try:
        response = requests.post(
            settings.BACKEND_URL,
            data=form_data,              # multipart/form-data — matches backend Form(...)
            headers=settings.REQUEST_HEADERS,  # X-API-Key for service auth
            timeout=5
        )
        if response.status_code in [200, 201]:
            print(f"   ✅ Sent to backend! (ID: {response.json().get('id')})")
        else:
            print(f"   ⚠️  Backend responded: {response.status_code} — {response.text[:120]}")
    except requests.exceptions.ConnectionError:
        print(f"   ❌ Backend offline (cannot connect to {settings.BACKEND_URL})")
    except Exception as e:
        print(f"   ❌ Unexpected error: {e}")


def print_alert(form_data: dict, label: str, confidence: float):
    print(f"\n🚨 ALERT:")
    print(f"   Detected  : {label}")
    print(f"   Issue     : {form_data['issue_type']}")
    print(f"   Severity  : {form_data['severity']}")
    print(f"   Confidence: {confidence:.1%}")
    print(f"   Camera    : {form_data['camera_no']}")
    print(f"   Location  : {form_data['location']}")


# ─── MODE SELECTION ───────────────────────
print("\n" + "="*40)
print("  AAI RUNWAY - AI DETECTION SYSTEM")
print("="*40)
print("\nSelect Mode:")
print("  1 → Webcam (Real-time)")
print("  2 → Image Folder (Demo)")
print()
mode = input("Enter 1 or 2: ").strip()

# ─── MODE 1: WEBCAM ───────────────────────
if mode == "1":
    print("\n📷 Starting Webcam Detection...")
    print("Press Q to quit\n")

    cap = cv2.VideoCapture(0)
    alert_count = 0
    last_alert_time = 0

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Cannot read webcam")
                break

            results = model(frame, verbose=False)

            for result in results:
                for box in result.boxes:
                    label = result.names[int(box.cls)]
                    confidence = float(box.conf)

                    if confidence >= settings.CONFIDENCE_THRESHOLD:
                        current_time = time.time()
                        if current_time - last_alert_time >= settings.COOLDOWN_SECONDS:
                            last_alert_time = current_time
                            alert_count += 1

                            form_data = build_form_data(alert_count, label, confidence)
                            print_alert(form_data, label, confidence)
                            send_alert(form_data)

            annotated = results[0].plot()
            cv2.putText(
                annotated,
                f"AAI Runway | LIVE | {datetime.now().strftime('%H:%M:%S')}",
                (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2
            )
            cv2.imshow("AAI Runway - WEBCAM Detection", annotated)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    except KeyboardInterrupt:
        print("\nStopped!")
    finally:
        cap.release()
        cv2.destroyAllWindows()
        print(f"\n✅ Done! Total alerts: {alert_count}")

# ─── MODE 2: IMAGE FOLDER ─────────────────
elif mode == "2":
    print("\n🖼️ Starting Image Detection...")
    print("Auto-advances every 10s | Press any key to skip | Q to quit\n")

    images = glob.glob("demo_runway_images/*.jpg") + glob.glob("demo_runway_images/*.png")
    if not images:
        images = glob.glob("runway_images/*.jpg") + glob.glob("runway_images/*.png")
    images.sort()
    print(f"Found {len(images)} images\n")

    alert_count = 0
    os.makedirs("detection_output", exist_ok=True)

    for img_path in images:
        frame = cv2.imread(img_path)
        if frame is None:
            continue

        results = model(frame, verbose=False)

        for result in results:
            for box in result.boxes:
                label = result.names[int(box.cls)]
                confidence = float(box.conf)

                if confidence >= settings.CONFIDENCE_THRESHOLD:
                    alert_count += 1

                    form_data = build_form_data(alert_count, label, confidence)
                    print_alert(form_data, label, confidence)
                    send_alert(form_data)

        # Save annotated image
        annotated = results[0].plot()
        img_name = img_path.split("\\")[-1].split("/")[-1]
        output_path = f"detection_output/{img_name}"
        cv2.imwrite(output_path, annotated)
        print(f"   📸 Saved: {output_path}")

        # Display with auto-resize to fit screen
        display = annotated.copy()
        h, w = display.shape[:2]
        scale = min(1280 / w, 720 / h, 1.0)
        if scale < 1.0:
            display = cv2.resize(display, (int(w * scale), int(h * scale)))
        cv2.putText(
            display,
            f"AAI Runway | {img_name[:30]}",
            (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2
        )
        cv2.imshow("AAI Runway - AI Detection", display)

        key = cv2.waitKey(10000) & 0xFF  # Auto-advance after 10 sec, or press any key
        if key == ord('q'):
            print("\n⏹️ Stopped by user.")
            break

    cv2.destroyAllWindows()
    print(f"\n✅ Done! Total alerts: {alert_count}")
    print(f"📁 Detection images saved in 'detection_output' folder")

else:
    print("❌ Invalid choice! Run again and enter 1 or 2")