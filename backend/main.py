from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from seed_data import seed_database
import models

# Import all routers
from routers.auth_router import router as auth_router
from routers.student import router as student_router
from routers.counselling import router as counselling_router
from routers.questionnaire import router as questionnaire_router
from routers.counsellor import router as counsellor_router
from routers.groups import router as groups_router
from routers.analytics import router as analytics_router
from routers.chat import router as chat_router
from routers.notifications import router as notifications_router

app = FastAPI(
    title="UniWell - AI-Assisted University Counselling & Student Wellbeing Platform",
    description="Backend API for student wellbeing triage, human-in-the-loop counsellor prioritization, and peer support network.",
    version="1.0.0",
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_router)
app.include_router(student_router)
app.include_router(counselling_router)
app.include_router(questionnaire_router)
app.include_router(counsellor_router)
app.include_router(groups_router)
app.include_router(analytics_router)
app.include_router(chat_router)
app.include_router(notifications_router)


@app.on_event("startup")
def on_startup():
    # Ensure database schema is ready and pre-seeded
    Base.metadata.create_all(bind=engine)
    seed_database()


@app.get("/")
def root():
    return {
        "status": "online",
        "app": "UniWell - AI-Assisted University Counselling & Student Wellbeing Platform",
        "version": "1.0.0",
        "human_in_the_loop": True,
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
