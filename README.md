# AeroSafe AI

AI-powered runway safety monitoring and incident management platform that automates the detection, reporting, assignment, and resolution of airport runway hazards using computer vision and a role-based workflow.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Workflow](#workflow)
- [Admin Portal](#admin-portal)
- [Engineer Portal](#engineer-portal)
- [Analytics](#analytics)
- [Security](#security)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Incident Lifecycle](#incident-lifecycle)

---

# Overview

AeroSafe AI is an AI-powered runway safety monitoring and incident management platform designed to improve airport runway operations through automated hazard detection and structured incident handling.

The system combines **YOLO-based computer vision**, a **FastAPI backend**, **PostgreSQL (Supabase)**, and dedicated **Admin** and **Engineer** portals to provide an end-to-end workflow from hazard detection to incident resolution.

---

# Features

## AI-Powered Hazard Detection

The AI pipeline automatically detects:

- Foreign Object Debris (FOD)
- Runway cracks
- Wildlife and birds
- Unauthorized vehicles
- People on restricted runway areas
- Other runway incursions

Each detection automatically creates an incident containing:

- Issue type
- Severity
- Camera information
- Runway location
- Timestamp
- Detection evidence

---

## Incident Management

Every detected hazard follows a controlled workflow:

1. AI detects a hazard.
2. Incident is generated.
3. Admin reviews the alert.
4. Engineer is assigned.
5. Engineer accepts the task.
6. Corrective action is performed.
7. Resolution feedback is submitted.
8. Incident is marked as **Resolved**.

Administrators can classify invalid detections as **False Alarms**.

---

# Workflow

```text
Runway CCTV / Image Feed
          │
          ▼
YOLO Hazard Detection
          │
          ▼
Incident Created
          │
          ▼
Pending
          │
          ▼
Admin Review
          │
          ▼
Engineer Assigned
          │
          ▼
Engineer Accepts
          │
          ▼
Active
          │
          ▼
Corrective Action
          │
          ▼
Resolution Feedback
          │
          ▼
Resolved
```

---

# Admin Portal

Administrators can:

- Monitor incoming incidents
- Receive live hazard alerts
- Review AI detection evidence
- Search and filter incidents
- Assign engineers
- Monitor Pending and Active incidents
- Mark incidents as False Alarms
- Review completed incidents
- Export operational reports
- View analytics dashboard

---

# Engineer Portal

Engineers can:

- View assigned incidents
- Review hazard details
- Accept assigned tasks
- Track active incidents
- Submit resolution feedback
- Mark incidents as Resolved
- View incident history

---

# Analytics

The analytics dashboard provides:

- Incident trends over time
- Severity distribution
- Hazard type analysis
- Runway location analysis
- Resolution time analysis
- Operational response performance

These insights help airport authorities identify recurring issues and improve runway safety.

---

# Security

AeroSafe AI implements multiple security mechanisms including:

- JWT Authentication
- bcrypt Password Hashing
- Role-Based Access Control
- Protected API Endpoints
- HMAC Request Verification
- Signed Image Access
- Environment Variable Secret Management

---

# System Architecture

```text
                     RUNWAY CCTV / IMAGE FEED
                              │
                              ▼
                   ┌────────────────────────┐
                   │   YOLO AI Detection    │
                   │   OpenCV + PyTorch     │
                   └───────────┬────────────┘
                               │
                               ▼
                   ┌────────────────────────┐
                   │     FastAPI Backend    │
                   │ Incident Management    │
                   │ Authentication         │
                   └───────────┬────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
      PostgreSQL / Supabase              React + Vite
                                               │
                               ┌───────────────┴───────────────┐
                               ▼                               ▼
                          Admin Portal                 Engineer Portal
```

---

# Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React, Vite, Tailwind CSS, React Router, Recharts |
| **Backend** | FastAPI, SQLAlchemy, Pydantic, Uvicorn |
| **Database** | PostgreSQL, Supabase |
| **AI / Computer Vision** | YOLOv8, PyTorch, OpenCV |
| **Security** | JWT, bcrypt, HMAC |

---

# Installation

## Prerequisites

- Node.js 18+
- Python 3.9+
- npm or pnpm
- Git

---

## Frontend

```bash
cd frontend

npm install
# or
pnpm install

# Create .env
VITE_API_URL=http://localhost:8000

npm run dev
```

Runs at:

```
http://localhost:5173
```

---

## Backend

```bash
cd backend

python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file:

```env
DATABASE_URL=YOUR_DATABASE_URL
JWT_SECRET=YOUR_SECRET
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=2880
AI_SERVICE_API_KEY=YOUR_API_KEY
```

Run the server:

```bash
python main.py

# or

uvicorn main:app --reload --port 8000
```

Runs at:

```
http://localhost:8000
```

API Documentation:

```
http://localhost:8000/docs
```

---

## AI Service

```bash
cd ai-service

python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file:

```env
BACKEND_URL=http://localhost:8000/api/complaints
AI_SERVICE_API_KEY=YOUR_API_KEY
CONFIDENCE_THRESHOLD=0.25
COOLDOWN_SECONDS=10
CAMERA_NAME=CAM-RWY-B-02
LOCATION=Runway B
```

Place the trained model (`best.pt`) inside the `ai-service` directory.

Run the detection service:

```bash
python detect.py
```

---

# Incident Lifecycle

```text
                 Pending
                    │
          Admin assigns engineer
                    │
                    ▼
          Pending (Assigned)
                    │
         Engineer accepts task
                    │
                    ▼
                 Active
                    │
          Corrective Action
                    │
                    ▼
          Resolution Feedback
                    │
                    ▼
                Resolved


          Invalid Detection
                  │
                  ▼
             False Alarm
```

---
