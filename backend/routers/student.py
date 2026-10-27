from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user, require_role
import models
import schemas

router = APIRouter(prefix="/api/student", tags=["Student"])


@router.get("/profile", response_model=None)
def get_student_profile(
    current_user: models.User = Depends(require_role(["student"])),
    db: Session = Depends(get_db),
):
    profile = db.query(models.StudentProfile).filter(
        models.StudentProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "university_id": profile.university_id,
        "course": profile.course,
        "year": profile.year,
        "semester": profile.semester,
        "phone": profile.phone,
        "name": current_user.name,
        "email": current_user.email,
    }


@router.put("/profile")
def update_profile(
    data: schemas.StudentProfileUpdate,
    current_user: models.User = Depends(require_role(["student"])),
    db: Session = Depends(get_db),
):
    profile = db.query(models.StudentProfile).filter(
        models.StudentProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if data.course is not None:
        profile.course = data.course
    if data.year is not None:
        profile.year = data.year
    if data.semester is not None:
        profile.semester = data.semester
    if data.phone is not None:
        profile.phone = data.phone

    db.commit()
    db.refresh(profile)
    return {"message": "Profile updated", "profile_id": profile.id}


@router.get("/dashboard")
def get_dashboard(
    current_user: models.User = Depends(require_role(["student"])),
    db: Session = Depends(get_db),
):
    # Count active requests
    requests = db.query(models.CounsellingRequest).filter(
        models.CounsellingRequest.student_id == current_user.id
    ).all()

    active_requests = [r for r in requests if r.status not in ("resolved",)]
    groups_count = db.query(models.SupportGroup).filter(
        models.SupportGroup.active == True
    ).count()

    recent_requests = []
    for r in sorted(requests, key=lambda x: x.created_at, reverse=True)[:5]:
        appointment = None
        if r.appointment:
            appointment = {
                "id": r.appointment.id,
                "date": r.appointment.date,
                "time": r.appointment.time,
                "location": r.appointment.location,
                "meeting_link": r.appointment.meeting_link,
                "status": r.appointment.status,
                "counsellor_id": r.appointment.counsellor_id,
            }

        # Calculate expected response time
        expected_response = "Within 3-5 working days"
        if r.ai_assessment:
            priority = r.ai_assessment.suggested_priority
            if priority == "immediate":
                expected_response = "Human review initiated"
            elif priority == "urgent":
                expected_response = "Within 24 hours"
            elif priority == "moderate":
                expected_response = "Within 48 hours"

        recent_requests.append({
            "id": r.id,
            "concern_category": r.concern_category,
            "status": r.status,
            "created_at": r.created_at.isoformat(),
            "expected_response": expected_response,
            "appointment": appointment,
        })

    return {
        "name": current_user.name,
        "active_requests_count": len(active_requests),
        "total_requests": len(requests),
        "groups_count": groups_count,
        "recent_requests": recent_requests,
    }
