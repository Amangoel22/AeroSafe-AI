import cv2
from ultralytics import YOLO
from datetime import datetime
import glob
import time
import requests
import sys

# ── CONFIG ──────────────────────────────────
CAMERA_NAME = "CAM-RWY-B-02"
LOCATION = "Runway B"
CONFIDENCE_THRESHOLD = 0.25
BACKEND_URL = "http://localhost:8000/complaints"
COOLDOWN_SECONDS = 10
# ────────────────────────────────────────────

model = YOLO("best.pt")

def get_issue_type(label):
    if label == "person":
        return "Security Issue"
    elif label in ["vehicle", "plane"]:
        return "Runway Incursion"
    elif label == "bird":
        return "Wildlife Hazard"
    elif label == "obj":
        return "Foreign Object on Runway"
    elif label in ["mildcracks", "L1_Hole", "L2_Hole"]:
        return "Maintenance Required"
    elif label in ["severecracks", "L3_Hole"]:
        return "Safety Hazard"
    else:
        return "Foreign Object on Runway"

def get_severity(confidence):
    if confidence >= 0.90:
        return "critical"
    elif confidence >= 0.75:
        return "high"
    elif confidence >= 0.55:
        return "medium"
    else:
        return "low"

def send_alert(alert):
    try:
        response = requests.post(BACKEND_URL, json=alert, timeout=5)
        if response.status_code in [200, 201]:
            print(f"   ✅ Sent to backend!")
        else:
            print(f"   ⚠️ Backend: {response.status_code}")
    except:
        print(f"   ❌ Backend offline")

def print_alert(alert, label, confidence):
    print(f"\n🚨 ALERT:")
    print(f"   ID        : {alert['id']}")
    print(f"   Detected  : {label}")
    print(f"   Issue     : {alert['issueType']}")
    print(f"   Severity  : {alert['severity']}")
    print(f"   Confidence: {confidence:.1%}")
    print(f"   Camera    : {alert['cameraNumber']}")
    print(f"   Location  : {alert['location']}")

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

                    if confidence >= CONFIDENCE_THRESHOLD:
                        current_time = time.time()
                        if current_time - last_alert_time >= COOLDOWN_SECONDS:
                            last_alert_time = current_time
                            alert_count += 1

                            alert = {
                                "id": f"ALT-{alert_count:03d}",
                                "issueType": get_issue_type(label),
                                "severity": get_severity(confidence),
                                "cameraNumber": CAMERA_NAME,
                                "location": LOCATION,
                                "description": f"{label} detected at {datetime.now().strftime('%H:%M:%S')}",
                                "createdAt": datetime.now().isoformat(),
                            }

                            print_alert(alert, label, confidence)
                            send_alert(alert)

            annotated = results[0].plot()
            cv2.putText(annotated,
                        f"AAI Runway | LIVE | {datetime.now().strftime('%H:%M:%S')}",
                        (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
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
    print("Press Q to skip image, Ctrl+C to stop\n")

    images = glob.glob("runway_images/*.jpg") + glob.glob("runway_images/*.png")
    images.sort()
    print(f"Found {len(images)} images\n")

    alert_count = 0

    for img_path in images:
        frame = cv2.imread(img_path)
        if frame is None:
            continue

        results = model(frame, verbose=False)

        for result in results:
            for box in result.boxes:
                label = result.names[int(box.cls)]
                confidence = float(box.conf)

                if confidence >= CONFIDENCE_THRESHOLD:
                    alert_count += 1

                    alert = {
                        "id": f"ALT-{alert_count:03d}",
                        "issueType": get_issue_type(label),
                        "severity": get_severity(confidence),
                        "cameraNumber": CAMERA_NAME,
                        "location": LOCATION,
                        "description": f"{label} detected at {datetime.now().strftime('%H:%M:%S')}",
                        "createdAt": datetime.now().isoformat(),
                    }

                    print_alert(alert, label, confidence)
                    send_alert(alert)

        annotated = results[0].plot()
        img_name = img_path.split("\\")[-1]
        cv2.putText(annotated,
                    f"AAI Runway | {img_name[:30]}",
                    (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        cv2.imshow("AAI Runway - IMAGE Detection", annotated)

        if cv2.waitKey(2000) & 0xFF == ord('q'):
            break

    cv2.destroyAllWindows()
    print(f"\n✅ Done! Total alerts: {alert_count}")

else:
    print("❌ Invalid choice! Run again and enter 1 or 2")