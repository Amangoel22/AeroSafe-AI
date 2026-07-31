# ✈️ AeroSafe AI — Airport Runway Safety Monitoring System

AeroSafe AI is an **AI-powered runway safety monitoring and incident management platform** designed to automate the detection, reporting, assignment, and resolution of airport runway hazards.

The system combines **YOLO-based computer vision**, a **FastAPI backend**, and dedicated **Admin and Engineer portals** to provide an end-to-end workflow — from detecting a runway hazard to assigning personnel, tracking corrective action, and analysing historical safety data.

---

## 🎯 Project Overview

Airport runways require continuous monitoring to identify hazards such as structural damage, foreign objects, wildlife, and runway incursions.

AeroSafe AI provides a centralized workflow where AI-detected hazards are automatically converted into incidents and presented to airport administrators for verification and assignment.

Once assigned, field engineers can accept incidents, perform the required corrective action, provide mandatory resolution feedback, and close the incident.

```text
Runway Image / Video Feed
          ↓
   AI Hazard Detection
          ↓
   Incident Generated
          ↓
       PENDING
          ↓
   Admin Reviews Alert
          ↓
   Engineer Assigned
          ↓
       PENDING
          ↓
   Engineer Accepts
          ↓
        ACTIVE
          ↓
  Corrective Action Taken
          ↓
 Mandatory Feedback Submitted
          ↓
       RESOLVED
```

An administrator can also classify an invalid AI detection as a **False Alarm**.

---

# ✨ Key Features

## 🤖 AI-Powered Hazard Detection

AeroSafe AI integrates YOLO-based computer vision models for automated runway monitoring.

The detection pipeline can identify runway safety concerns including:

- Foreign Object Debris (FOD)
- Structural cracks and runway damage
- Wildlife and birds
- People or vehicles on restricted runway areas
- Other runway incursions

Detected hazards can automatically generate incidents containing information such as location, camera, issue type, severity, timestamp, and detection evidence.

---

## 🚨 Real-Time Incident Management

Every detected runway hazard follows a controlled incident lifecycle.

### 1. Pending

A newly detected incident is created with:

```text
Status: Pending
Assigned Engineer: Unassigned
```

It immediately becomes visible to administrators on the monitoring dashboard.

### 2. Engineer Assignment

The administrator reviews the incident and assigns it to an available field engineer.

Importantly, **assignment does not activate the incident**.

After assignment:

```text
Status: Pending
Assigned Engineer: <Engineer>
```

The incident remains Pending until the engineer acknowledges the task.

### 3. Engineer Acceptance

The assigned engineer sees the incident in their task queue and explicitly accepts it.

Only then does the status transition:

```text
Pending → Active
```

This distinguishes between an incident that has merely been dispatched and one that is actively being handled.

### 4. Resolution & Mandatory Feedback

After completing the corrective action, the engineer must submit **resolution feedback** describing the action taken.

Feedback is mandatory before an incident can be marked as resolved.

```text
Active
   ↓
Engineer performs corrective action
   ↓
Resolution feedback submitted
   ↓
Resolved
```

This provides an auditable record of how every runway safety incident was handled.

### 5. False Alarm

If an administrator determines that an AI-generated detection is not a genuine runway hazard, the incident can be classified as:

```text
False Alarm
```

This separates invalid detections from successfully resolved safety incidents.

---

# 👨‍💼 Admin / Control Centre Portal

The Admin portal provides centralized monitoring and incident coordination.

Administrators can:

- Monitor incoming AI-generated incidents
- Receive alerts for newly detected hazards
- Review incident details and detection evidence
- View severity and runway location
- Search and filter incidents
- Assign incidents to field engineers
- Monitor Pending and Active incidents
- Identify unassigned incidents
- Mark incorrect AI detections as False Alarms
- Track engineer assignments
- Review completed incidents
- Access incident history
- Export operational data
- View runway safety analytics

---

# 👷 Engineer Portal

The Engineer portal provides field personnel with their own incident workflow.

Engineers can:

- View incidents assigned specifically to them
- Review hazard details and location
- Accept assigned incidents
- Transition accepted incidents from **Pending → Active**
- Track currently active tasks
- Perform corrective actions
- Submit mandatory resolution feedback
- Mark completed incidents as **Resolved**
- View their incident/task history

This ensures that administrators coordinate incidents while engineers control the actual acceptance and completion of field work.

---

# 📊 Analytics & Safety Intelligence

AeroSafe AI includes a dedicated **Analytics Dashboard** that transforms historical incident data into operational safety insights.

The analytics system includes multiple graphs and visualisations covering:

### 📍 Location-Based Analysis

Analyse how incidents are distributed across different runway locations and identify areas experiencing higher concentrations of hazards.

### ⚠️ Severity Analysis

Visualise incidents according to severity levels:

```text
Low
Medium
High
Critical
```

This helps identify the overall risk profile of detected runway hazards.

### 🔍 Issue-Type Analysis

Analyse the frequency of different detected hazards such as:

- Structural cracks
- Foreign objects
- Wildlife
- Runway incursions
- Other detected safety issues

### ⏱️ Resolution-Time Analysis

Track how long incidents take to move from detection to resolution.

This can help evaluate operational response performance and identify incidents that required unusually long corrective actions.

### 📈 Incident Trends

Historical graphs provide visibility into:

- Incident frequency over time
- Resolved incidents
- Hazard trends
- Severity distribution
- Issue-type distribution
- Location-based incident patterns
- Resolution performance

Together, these analytics provide administrators with more than a live monitoring dashboard — they provide historical runway safety intelligence.

---

# 🔐 Security & Authentication

AeroSafe AI implements multiple security mechanisms across the platform.

## JWT Authentication

User authentication is handled using **JSON Web Tokens (JWT)**.

After successful login, authenticated users receive an access token used to access protected backend resources.

```text
User Login
    ↓
Credentials Verified
    ↓
JWT Access Token Generated
    ↓
Authenticated API Requests
```

## 🔑 Password Security

User passwords are not intended to be stored as plaintext.

Passwords are hashed using **bcrypt** before being stored in the database.

During authentication:

```text
Entered Password
       ↓
bcrypt Verification
       ↓
Stored Password Hash
       ↓
Authentication Result
```

This prevents the original password from being directly recoverable from the stored database value.

## 🛡️ Additional API Security

The backend architecture also supports:

- Role-based access control
- Protected API endpoints
- AI service API authentication
- HMAC-based request/resource verification
- Signed access to incident images
- Environment-variable-based secret management

Sensitive values such as database credentials, JWT secrets, and API keys are stored through environment variables rather than hard-coded into application source code.

---

# 🏗️ System Architecture

```text
                    RUNWAY CCTV / IMAGE FEED
                              │
                              ▼
                  ┌───────────────────────┐
                  │   YOLO AI Detection   │
                  │   OpenCV + PyTorch    │
                  └───────────┬───────────┘
                              │
                       Hazard Detection
                              │
                              ▼
                  ┌───────────────────────┐
                  │    FastAPI Backend    │
                  │   Incident Services   │
                  │   Authentication      │
                  └───────────┬───────────┘
                              │
                     ┌────────┴────────┐
                     │                 │
                     ▼                 ▼
             ┌──────────────┐   ┌──────────────┐
             │ PostgreSQL / │   │ React + Vite │
             │   Supabase   │   │   Frontend   │
             └──────────────┘   └──────┬───────┘
                                       │
                              ┌────────┴─────────┐
                              ▼                  ▼
                       ┌─────────────┐    ┌─────────────┐
                       │    Admin    │    │  Engineer   │
                       │   Portal    │    │   Portal    │
                       └─────────────┘    └─────────────┘
```

---

# 🛠️ Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Recharts
- Lucide React
- XLSX

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn

### Database
- PostgreSQL
- Supabase

### AI / Computer Vision
- Ultralytics YOLO
- PyTorch
- OpenCV

### Security
- JWT Authentication
- bcrypt Password Hashing
- HMAC Verification
- Environment-Based Secret Management

---

# 🚀 Quick Start & Setup Guide

Follow the step-by-step instructions below to set up and run the **Frontend**, **Backend**, and **AI Service** on **macOS/Linux** or **Windows**.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your system:
- **Node.js**: `v18.0.0` or higher
- **Package Manager**: `npm` or `pnpm`
- **Python**: `v3.9` or higher
- **Git**

---

## 💻 1. Frontend Setup (`frontend/`)

### 🍎 macOS / Linux

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install   # or: pnpm install

# 3. Create environment file (.env)
echo "VITE_API_URL=http://localhost:8000" > .env

# 4. Start Vite development server
npm run dev   # or: pnpm dev
```

### 🪟 Windows

```cmd
:: 1. Navigate to the frontend directory
cd frontend

:: 2. Install dependencies
npm install   :: or: pnpm install

:: 3. Create environment file (.env)
echo VITE_API_URL=http://localhost:8000 > .env

:: 4. Start Vite development server
npm run dev
```

> 💡 **Frontend Server:** Runs by default at `http://localhost:5173`.

---

## ⚙️ 2. Backend Setup (`backend/`)

### 🍎 macOS / Linux

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create Python virtual environment
python3 -m venv venv

# 3. Activate virtual environment
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Create environment file (.env)
cat <<EOT > .env
DATABASE_URL=YOUR_DB_KEY
JWT_SECRET=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=2880
AI_SERVICE_API_KEY=YOUR_KEY
EOT

# 6. Run FastAPI backend server
python main.py
# (Alternative: uvicorn main:app --reload --port 8000)
```

### 🪟 Windows

```cmd
:: 1. Navigate to backend directory
cd backend

:: 2. Create Python virtual environment
python -m venv venv

:: 3. Activate virtual environment
:: Command Prompt (cmd.exe):
venv\Scripts\activate
:: PowerShell:
:: .\venv\Scripts\Activate.ps1

:: 4. Install dependencies
pip install -r requirements.txt

:: 5. Create environment file (.env)
:: Create backend\.env with the following content:
:: DATABASE_URL=YOUR_DB_KEY
:: JWT_SECRET=your_jwt_secret_key_here
:: JWT_ALGORITHM=HS256
:: ACCESS_TOKEN_EXPIRE_MINUTES=2880
:: AI_SERVICE_API_KEY=YOUR_KEY

:: 6. Run FastAPI backend server
python main.py
:: (Alternative: uvicorn main:app --reload --port 8000)
```

> 💡 **Backend Server:** Runs on `http://localhost:8000`. Interactive API Docs are at `http://localhost:8000/docs`.

---

## 🤖 3. AI Service Setup (`ai-service/`)

### 🍎 macOS / Linux

```bash
# 1. Navigate to AI service directory
cd ai-service

# 2. Create Python virtual environment
python3 -m venv venv

# 3. Activate virtual environment
source venv/bin/activate

# 4. Install dependencies (YOLOv8, OpenCV, PyTorch, etc.)
pip install -r requirements.txt

# 5. Create environment file (.env)
cat <<EOT > .env
BACKEND_URL=http://localhost:8000/api/complaints
AI_SERVICE_API_KEY=YOUR_KEY
CONFIDENCE_THRESHOLD=0.25
COOLDOWN_SECONDS=10
CAMERA_NAME=CAM-RWY-B-02
LOCATION=Runway B
EOT

# 6. Download model weights (best.pt) into ai-service/ folder

# 7. Run AI detection service
python detect.py
```

### 🪟 Windows

```cmd
:: 1. Navigate to AI service directory
cd ai-service

:: 2. Create Python virtual environment
python -m venv venv

:: 3. Activate virtual environment
:: Command Prompt (cmd.exe):
venv\Scripts\activate
:: PowerShell:
:: .\venv\Scripts\Activate.ps1

:: 4. Install dependencies (YOLOv8, OpenCV, PyTorch, etc.)
pip install -r requirements.txt

:: 5. Create environment file (.env)
:: Create ai-service\.env with the following content:
:: BACKEND_URL=http://localhost:8000/api/complaints
:: AI_SERVICE_API_KEY=YOUR_KEY
:: CONFIDENCE_THRESHOLD=0.25
:: COOLDOWN_SECONDS=10
:: CAMERA_NAME=CAM-RWY-B-02
:: LOCATION=Runway B

:: 6. Download model weights (best.pt) into ai-service/ folder

:: 7. Run AI detection service
python detect.py
```

---

# 🔄 Incident State Machine

The core incident workflow can be summarized as:

```text
                        ┌─────────────┐
                        │   PENDING   │
                        │ Unassigned  │
                        └──────┬──────┘
                               │
                         Admin assigns
                            engineer
                               │
                               ▼
                        ┌─────────────┐
                        │   PENDING   │
                        │  Assigned   │
                        └──────┬──────┘
                               │
                        Engineer accepts
                               │
                               ▼
                        ┌─────────────┐
                        │    ACTIVE   │
                        └──────┬──────┘
                               │
                      Corrective action
                               │
                               ▼
                     Mandatory Feedback
                               │
                               ▼
                        ┌─────────────┐
                        │  RESOLVED   │
                        └─────────────┘


        Invalid AI Detection
                │
                ▼
        ┌───────────────┐
        │  FALSE ALARM  │
        └───────────────┘
```

The distinction between **assigned** and **active** is intentionally handled through assignment state rather than treating assignment itself as an incident status:

> **Assigned Pending** = An engineer has been selected but has not yet accepted the task.  
> **Active** = The assigned engineer has acknowledged the incident and corrective action is underway.  
> **Resolved** = Corrective action has been completed and mandatory feedback has been submitted.

---
