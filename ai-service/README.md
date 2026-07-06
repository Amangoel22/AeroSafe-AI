# AAI Runway - AI Detection Module

## Overview
This is the AI component of the AAI Safety Monitoring System.
It uses a custom-trained YOLOv8 model to detect runway hazards in real-time.

## What It Detects
| Class | Issue Type | Severity |
|-------|-----------|----------|
| severecracks | Safety Hazard | critical/high |
| mildcracks | Maintenance Required | medium |
| L1_Hole, L2_Hole, L3_Hole | Maintenance Required | medium |
| obj | Foreign Object on Runway | high |
| bird | Wildlife Hazard | medium |
| person | Security Issue | critical |
| vehicle | Runway Incursion | high |
| plane | Runway Incursion | high |

## Model Details
- Architecture: YOLOv8n (fine-tuned)
- Training: 50 epochs, 2544 images
- Accuracy: 85.8% mAP50
- Datasets used:
  - Runway Crack Detection (1532 images)
  - FOD Detection - Foreign Object Debris (607 images)
  - Airport Detection - Bird/Vehicle/Person (840 images)

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/Khushiv0707/AAI-SAFETY-MONITORING-SYSTEM
cd AAI-SAFETY-MONITORING-SYSTEM/ai_detection
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Download the model
Download `best.pt` from this Google Drive link:
[ADD YOUR GOOGLE DRIVE LINK HERE]
Place it in the `ai_detection/` folder.

### 4. Run the detection script
```bash
python detect.py
```
Select mode:
- `1` → Webcam (Real-time detection)
- `2` → Image Folder (Demo mode)

## Backend Integration
The script sends alerts to the backend via POST request:

**Endpoint:** `POST http://localhost:8000/complaints`

**Alert JSON format:**
```json
{
  "id": "ALT-001",
  "issueType": "Safety Hazard",
  "severity": "high",
  "cameraNumber": "CAM-RWY-B-02",
  "location": "Runway B",
  "description": "severecracks detected at 21:30:25",
  "createdAt": "2026-07-05T21:30:25"
}
```

**To change backend URL**, edit this line in `detect.py`:
```python
BACKEND_URL = "http://localhost:8000/complaints"
```

## Folder Structure
ai_detection/
├── detect.py          # Main detection script
├── best.pt            # Trained YOLOv8 model (download separately)
├── requirements.txt   # Python dependencies
├── runway_images/     # Sample runway images for demo mode
└── README.md          # This file

## Notes
- `best.pt` is not pushed to GitHub (file too large ~6MB)
- Download it from Google Drive link above
- For webcam mode, ensure no other app is using the camera
