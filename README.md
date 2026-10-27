# UniWell — AI-Assisted University Counselling & Student Wellbeing Platform

> **Hackathon MVP v1.0**  
> *"AI-assisted, human-controlled."*

UniWell is a digital mental health triage and counselling platform built for universities. It enables students to easily register for professional counselling and peer support, while utilizing **Google Gemini 2.5 Flash** to analyze intake submissions, identify key functional impacts, and prioritize the counsellor queue based on clinical urgency—all while keeping every clinical decision in the hands of qualified professionals.

---

## 🌟 Key Features

### 1. Multi-Step Student Intake Wizard
- **Subjective Self-Report:** Allows students to describe their challenges in their own words.
- **Adaptive Structured Questionnaire:** Base wellbeing questions + dynamic category-specific questions (academic pressure, relationships, insomnia, loneliness).
- **6-Point Likert Scale with "Not Sure" Logic:** "Not Sure" is treated as distinct ambiguity for counsellor follow-up, **never** automatically labeled as high risk.
- **Transparent Response Expectations:** Students see expected response windows (e.g., *"Within 24 hours"*), while internal clinical risk labels remain strictly protected.

### 2. Counsellor Priority Queue & Review Workspace
- **Algorithmic Urgency Triage:** Categorizes incoming requests into `Immediate`, `Urgent`, `Moderate`, and `Routine`.
- **Crisis Safety Alerts:** Explicit crisis or self-harm keywords trigger instant `Immediate` safety flags.
- **Original Student Voice Preserved:** Counsellors review original unmodified student submissions side-by-side with AI summaries.
- **Human-in-the-Loop Actions:** Counsellors can confirm or override suggested priority (with clinical rationale), schedule sessions, escalate to emergency protocols, or request more information.

### 3. Community & Peer Support Network
- **Active Help Groups:** Browse and join student club circles (Exam Stress Mindfulness, First-Year Freshers, International Students, Peer Listening, Social Anxiety).
- **Seat Capacity Management:** Real-time enrollment and capacity tracking.

### 4. Immediate Support & AI Navigator
- **24/7 Crisis Helpline Hotlines:** Direct dial to 988 Suicide & Crisis Lifeline, campus emergency services, and crisis text lines.
- **Supportive AI Assistant:** Empathetic navigation assistant helping students find resources and register for care. (Strictly guarded against medical diagnosis).

### 5. Institutional Analytics & Audit Dashboard
- Real-time Recharts visualizations of triage categories, student concern themes, response times, and **AI vs Human Concordance** metrics.

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.12+ (Installed with virtualenv)
- Node.js v18+ & npm

### 1. Running the Backend
```bash
cd backend

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1

# (Optional) Set your Gemini API Key in .env:
# GEMINI_API_KEY="your-gemini-key"
# If omitted, UniWell uses an intelligent rule-based triage fallback

# Start FastAPI server
uvicorn main:app --reload --port 8000
```
*API will run at `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.*

### 2. Running the Frontend
```bash
cd frontend

# Install dependencies (already prepared)
npm install

# Start Vite dev server
npm run dev
```
*Frontend will launch at `http://localhost:5173`.*

---

## 👥 Demo Accounts (1-Click Login on UI)

The login screen includes instant 1-click login buttons for quick testing during hackathon presentations:

| Role | Email | Password | Access & Capabilities |
| :--- | :--- | :--- | :--- |
| **Student** | `student@uni.edu` | `password123` | Intake wizard, status tracker, support groups, profile |
| **Counsellor** | `counsellor@uni.edu` | `password123` | Priority queue, AI assessment review, scheduling, override |
| **Administrator** | `admin@uni.edu` | `password123` | Analytics dashboards, audit logs, support group registration |
| **Peer Supporter** | `peer@uni.edu` | `password123` | Peer support groups & community moderation |

---

## 🧪 Automated Testing

To run the automated API and Hackathon Demo verification scripts:

```bash
cd backend
.\venv\Scripts\python.exe test_api.py
.\venv\Scripts\python.exe test_hackathon_demo.py
```
Both test suites verify:
- Database table creation & seeding
- JWT authentication and role-based permissions
- Adaptive questionnaire retrieval
- Intake submission and AI analysis background task
- Counsellor priority sorting & overrides
- Appointment scheduling & mock notifications
- Emergency keyword detection & safety guardrails
