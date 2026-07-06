# AAI Runway - AI Detection Module

## Overview
This is the AI component of the AAI Safety Monitoring System.
It uses a custom-trained YOLOv8 model to detect runway hazards in real-time
and reports them directly to the backend via a secure, authenticated API call.

## What It Detects
| Class | Issue Type | Severity Sent |
|-------|-----------|---------------|
| `severecracks` | Safety Hazard | Critical / High |
| `L3_Hole` | Safety Hazard | Critical / High |
| `mildcracks` | Maintenance Required | Medium / Low |
| `L1_Hole`, `L2_Hole` | Maintenance Required | Medium / Low |
| `obj` | Foreign Object on Runway | varies |
| `bird` | Wildlife Hazard | varies |
| `person` | Security Issue | varies |
| `vehicle` | Runway Incursion | varies |
| `plane` | Runway Incursion | varies |

> Severity is auto-calculated from model confidence:
> `≥ 90%` → Critical · `≥ 75%` → High · `≥ 55%` → Medium · `< 55%` → Low

## Model Details
- Architecture: YOLOv8n (fine-tuned)
- Training: 50 epochs, 2544 images
- Accuracy: 85.8% mAP50
- Datasets used:
  - Runway Crack Detection (1532 images)
  - FOD Detection – Foreign Object Debris (607 images)
  - Airport Detection – Bird / Vehicle / Person (840 images)

---

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/Khushiv0707/AAI-SAFETY-MONITORING-SYSTEM
cd AAI-SAFETY-MONITORING-SYSTEM/ai-service
```

### 2. Create & activate a virtual environment
```bash
python -m venv venv
venv\Scripts\activate        # Windows
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure environment variables
Copy the sample and fill in your values:
```bash
# Edit ai-service/.env
BACKEND_URL=http://localhost:8000/api/complaints
AI_SERVICE_API_KEY=aai-runway-ai-service-key-2026   # must match backend .env

CONFIDENCE_THRESHOLD=0.25
COOLDOWN_SECONDS=10

# Set per camera station / deployment
CAMERA_NAME=CAM-RWY-B-02
LOCATION=Runway B
```
> All config is loaded via `config.py` → no hardcoded values in `detect.py`.

### 5. Download the model
Download `best.pt` from this Google Drive link:
https://drive.google.com/file/d/1AfU3T9kKXHK_fBYhrR0ujGEfxF9DLKoD/view?usp=drivesdk
Place it in the `ai-service/` folder.

### 6. Run the detection script
```bash
python detect.py
```
Select mode:
- `1` → Webcam (Real-time detection)
- `2` → Image Folder (Demo mode)

---

## Backend Integration

The AI service sends alerts **directly to the backend** (not via the frontend).
Authentication uses a shared `X-API-Key` header — no user login required.

**Endpoint:** `POST http://localhost:8000/api/complaints`

**Request format:** `multipart/form-data`

**Fields sent:**
| Field | Example Value | Notes |
|-------|--------------|-------|
| `location` | `Runway B` | From `LOCATION` in `.env` |
| `issue_type` | `Safety Hazard` | Derived from YOLO label |
| `description` | `severecracks detected at 21:30:25 (conf: 91.2%)` | Auto-generated |
| `severity` | `Critical` | Derived from confidence score |
| `camera_no` | `CAM-RWY-B-02` | From `CAMERA_NAME` in `.env` |
| `camera_location` | `Runway B` | Same as `location` |
| `status_val` | `Pending` | Default on creation |

**Auth header sent with every request:**
```
X-API-Key: aai-runway-ai-service-key-2026
```

> The backend's `POST /api/complaints` accepts either a valid JWT token (human user)
> or a valid `X-API-Key` (AI service). All other endpoints still require a full JWT.

---

## Configuration

All settings live in `.env` and are loaded once via `config.py`:

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKEND_URL` | `http://localhost:8000/api/complaints` | Backend POST endpoint |
| `AI_SERVICE_API_KEY` | — | Must match `AI_SERVICE_API_KEY` in backend `.env` |
| `CONFIDENCE_THRESHOLD` | `0.25` | Min confidence to trigger an alert |
| `COOLDOWN_SECONDS` | `10` | Min gap between alerts (webcam mode) |
| `CAMERA_NAME` | `CAM-UNKNOWN` | Camera ID sent to backend |
| `LOCATION` | `Unknown Location` | Location label sent to backend |

**To deploy on a different camera station**, just update `CAMERA_NAME` and `LOCATION` in `.env` — no code changes needed.

---

## Folder Structure
```
ai-service/
├── detect.py          # Main detection script
├── config.py          # Loads .env and exposes settings singleton
├── .env               # Environment config (not committed to git)
├── best.pt            # Trained YOLOv8 model (download separately)
├── requirements.txt   # Python dependencies
├── runway_images/     # Sample runway images for demo mode
└── README.md          # This file
```

---

## Notes
- `best.pt` is not pushed to GitHub (file too large ~6MB) — download from the Drive link above
- The `.env` file is not committed to git — keep your `AI_SERVICE_API_KEY` secret
- For webcam mode, ensure no other app is using the camera
- The backend must be running before starting `detect.py`
