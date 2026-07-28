# ✈️ AeroSafe AI — Airport Runway Safety Monitoring System

A real-time, AI-driven Airport Runway Safety Monitoring System designed for Airports Authority of India (AAI). The system automatically detects potential runway hazards (such as wildlife, foreign object debris (FOD), structural cracks, and runway incursions), dispatches real-time alerts to airside control personnel, enables assignment to field engineers, and tracks incident resolution with interactive analytics.

---

## 🎯 **Project Purpose & Features**

### 📋 **Key Features**
- **🤖 Real-time AI Hazard Detection**: Integrates YOLO-based Computer Vision model (`detect.py`) to monitor runway feeds for Foreign Objects (FOD), Wildlife, Structural Cracks, and Incursions.
- **🛡️ Role-Based Access Portals**:
  - **Admin / Control Center Portal**: Monitor all incoming alerts, search/filter incidents, assign tasks to field engineers, view analytics, and export reports.
  - **Engineer Portal**: View assigned task queues, accept active tasks, record resolution feedback, and mark incidents as resolved.
- **📊 Advanced Analytics Dashboard**: Visualizes incident trends, runway location risk distribution, severity breakdown, and engineer resolution times using full-width charts.
- **📁 Excel Export**: Export filtered incident history and engineer logs directly to Excel (`.xlsx`).
- **🔐 Secure API & HMAC Authentication**: Secure communication between AI Detection Service, Backend, and Frontend.

---

## 🏗️ **System Architecture**

```
AAI-SAFETY-MONITORING-SYSTEM/
├── backend/          # FastAPI REST API Backend (Python 3.11+)
├── frontend/         # React + Vite + Tailwind CSS Frontend (Node.js)
└── ai-service/       # YOLO Computer Vision AI Service & Detection Engine
```

---

## 🚀 **Getting Started**

### 1️⃣ **Prerequisites**
- **Python**: `3.11` or higher
- **Node.js**: `v18.0.0` or higher
- **pnpm**: `pnpm install -g pnpm` (or `npm`)

---

### 2️⃣ **Backend Setup (FastAPI)**

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows (Command Prompt):
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the Backend Server (runs on http://localhost:8000)
uvicorn main:app --reload
```

---

### 3️⃣ **Frontend Setup (React + Vite)**

```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install dependencies using pnpm
pnpm install

# Start the Vite Development Server (runs on http://localhost:5173)
pnpm run dev
```

---

### 4️⃣ **AI Detection Service Setup (YOLO Detection Engine)**

```bash
# Open a new terminal and navigate to the ai-service directory
cd ai-service

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows (Command Prompt):
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the AI Detection Script
python detect.py
```

---

## 🔑 **User Credentials for Testing**

| Portal | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Admin Portal** | `admin@aai.aero` | `admin123` | Admin |
| **Engineer Portal** | `rahul@aai.aero` | `engineer123` | Engineer |
| **Engineer Portal** | `priya@aai.aero` | `engineer123` | Engineer |

---

## 📄 **API Endpoints Summary**

- `POST /api/auth/login` — Authenticate user and receive JWT access token.
- `GET /api/complaints` — List all complaints/incidents.
- `POST /api/complaints` — Submit a new AI-detected incident (requires API Key header).
- `PUT /api/complaints/{id}` — Update complaint status or assign engineer.
- `GET /api/users/engineers` — Fetch list of field engineers.

---

## 🛠️ **Tech Stack**

- **Frontend**: React, Vite, Tailwind CSS, Recharts, Lucide Icons, XLSX.
- **Backend**: FastAPI, SQLAlchemy, SQLite, Pydantic, Uvicorn.
- **AI Service**: OpenCV, Ultralytics YOLOv8/YOLOv11, PyTorch.
