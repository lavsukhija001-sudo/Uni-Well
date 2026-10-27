from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from auth import get_current_user, require_role
import models
import schemas

router = APIRouter(prefix="/api/counselling", tags=["Counselling"])


@router.post("/request")
def create_request(
    data: schemas.CounsellingRequestCreate,
    current_user: models.User = Depends(require_role(["student"])),
    db: Session = Depends(get_db),
):
    request = models.CounsellingRequest(
        student_id=current_user.id,
        subjective_response=data.subjective_response,
        concern_category=data.concern_category,
        status="submitted",
        ai_status="pending",
    )
    db.add(request)
    db.commit()
    db.refresh(request)

    # Create notification
    notification = models.Notification(
        user_id=current_user.id,
        type="request_submitted",
        message=f"Your counselling request #{request.id} has been successfully submitted.",
    )
    db.add(notification)
    db.commit()

    return {
        "id": request.id,
        "status": request.status,
        "created_at": request.created_at.isoformat(),
        "message": "Your counselling request has been successfully submitted.",
        "expected_response": "Within 3-5 working days",
    }


@router.get("/request/{request_id}")
def get_request(
    request_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    request = db.query(models.CounsellingRequest).filter(
        models.CounsellingRequest.id == request_id
    ).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Students can only see their own requests
    if current_user.role == "student" and request.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Calculate expected response time
    expected_response = "Within 3-5 working days"
    if request.ai_assessment:
        p = request.ai_assessment.suggested_priority
        if p == "immediate":
            expected_response = "Human review initiated"
        elif p == "urgent":
            expected_response = "Within 24 hours"
        elif p == "moderate":
            expected_response = "Within 48 hours"

    appointment = None
    if request.appointment:
        counsellor = db.query(models.User).filter(
            models.User.id == request.appointment.counsellor_id
        ).first()
        appointment = {
            "id": request.appointment.id,
            "date": request.appointment.date,
            "time": request.appointment.time,
            "location": request.appointment.location,
            "meeting_link": request.appointment.meeting_link,
            "status": request.appointment.status,
            "counsellor_name": counsellor.name if counsellor else "Unknown",
        }

    result = {
        "id": request.id,
        "subjective_response": request.subjective_response,
        "concern_category": request.concern_category,
        "status": request.status,
        "ai_status": request.ai_status,
        "created_at": request.created_at.isoformat(),
        "updated_at": request.updated_at.isoformat(),
        "expected_response": expected_response,
        "appointment": appointment,
    }

    # Counsellors and admins can see AI assessments
    if current_user.role in ("counsellor", "admin"):
        if request.ai_assessment:
            result["ai_assessment"] = {
                "id": request.ai_assessment.id,
                "summary": request.ai_assessment.summary,
                "concerns": request.ai_assessment.concerns,
                "suggested_priority": request.ai_assessment.suggested_priority,
                "safety_flag": request.ai_assessment.safety_flag,
                "not_sure_count": request.ai_assessment.not_sure_count,
                "not_sure_percentage": request.ai_assessment.not_sure_percentage,
                "duration": request.ai_assessment.duration,
                "functional_impact": request.ai_assessment.functional_impact,
                "key_indicators": request.ai_assessment.key_indicators,
                "reasoning_factors": request.ai_assessment.reasoning_factors,
                "human_review_required": request.ai_assessment.human_review_required,
            }
        if request.review:
            result["counsellor_review"] = {
                "final_priority": request.review.final_priority,
                "action": request.review.action,
                "notes": request.review.notes,
                "reviewed_at": request.review.reviewed_at.isoformat() if request.review.reviewed_at else None,
            }

    return result


@router.get("/my-requests")
def get_my_requests(
    current_user: models.User = Depends(require_role(["student"])),
    db: Session = Depends(get_db),
):
    requests = db.query(models.CounsellingRequest).filter(
        models.CounsellingRequest.student_id == current_user.id
    ).order_by(models.CounsellingRequest.created_at.desc()).all()

    results = []
    for r in requests:
        expected_response = "Within 3-5 working days"
        if r.ai_assessment:
            p = r.ai_assessment.suggested_priority
            if p == "immediate":
                expected_response = "Human review initiated"
            elif p == "urgent":
                expected_response = "Within 24 hours"
            elif p == "moderate":
                expected_response = "Within 48 hours"

        appointment = None
        if r.appointment:
            counsellor = db.query(models.User).filter(
                models.User.id == r.appointment.counsellor_id
            ).first()
            appointment = {
                "id": r.appointment.id,
                "date": r.appointment.date,
                "time": r.appointment.time,
                "location": r.appointment.location,
                "meeting_link": r.appointment.meeting_link,
                "status": r.appointment.status,
                "counsellor_name": counsellor.name if counsellor else "Unknown",
            }

        results.append({
            "id": r.id,
            "concern_category": r.concern_category,
            "status": r.status,
            "ai_status": r.ai_status,
            "created_at": r.created_at.isoformat(),
            "expected_response": expected_response,
            "appointment": appointment,
        })

    return results
