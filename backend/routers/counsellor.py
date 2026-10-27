from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from database import get_db
from auth import get_current_user, require_role
from services.email_service import send_appointment_email
import models
import schemas

router = APIRouter(prefix="/api/counsellor", tags=["Counsellor"])


@router.get("/queue")
def get_queue(
    priority: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    concern: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: models.User = Depends(require_role(["counsellor", "admin"])),
    db: Session = Depends(get_db),
):
    query = db.query(models.CounsellingRequest)

    if status:
        query = query.filter(models.CounsellingRequest.status == status)

    if concern:
        query = query.filter(models.CounsellingRequest.concern_category == concern)

    requests = query.order_by(models.CounsellingRequest.created_at.asc()).all()

    # Build queue items
    queue_items = []
    for r in requests:
        student = db.query(models.User).filter(models.User.id == r.student_id).first()
        profile = db.query(models.StudentProfile).filter(
            models.StudentProfile.user_id == r.student_id
        ).first()

        if search:
            search_lower = search.lower()
            name_match = student and search_lower in student.name.lower()
            id_match = profile and search_lower in (profile.university_id or "").lower()
            if not name_match and not id_match:
                continue

        ai_data = None
        suggested_priority = "routine"
        if r.ai_assessment:
            suggested_priority = r.ai_assessment.suggested_priority or "routine"
            ai_data = {
                "id": r.ai_assessment.id,
                "summary": r.ai_assessment.summary,
                "concerns": r.ai_assessment.concerns,
                "suggested_priority": r.ai_assessment.suggested_priority,
                "safety_flag": r.ai_assessment.safety_flag,
                "not_sure_count": r.ai_assessment.not_sure_count,
                "not_sure_percentage": r.ai_assessment.not_sure_percentage,
                "functional_impact": r.ai_assessment.functional_impact,
                "human_review_required": r.ai_assessment.human_review_required,
            }

        # Filter by priority
        if priority and suggested_priority != priority:
            continue

        review_status = "pending"
        if r.review:
            review_status = "reviewed"

        # Calculate time waiting
        waiting_hours = (datetime.utcnow() - r.created_at).total_seconds() / 3600

        queue_items.append({
            "request_id": r.id,
            "student_name": student.name if student else "Unknown",
            "student_id": profile.university_id if profile else "N/A",
            "concern_category": r.concern_category,
            "status": r.status,
            "ai_status": r.ai_status,
            "suggested_priority": suggested_priority,
            "review_status": review_status,
            "not_sure_count": r.ai_assessment.not_sure_count if r.ai_assessment else 0,
            "created_at": r.created_at.isoformat(),
            "waiting_hours": round(waiting_hours, 1),
            "ai_assessment": ai_data,
        })

    # Sort by priority order
    priority_order = {"immediate": 0, "urgent": 1, "moderate": 2, "routine": 3}
    queue_items.sort(key=lambda x: (priority_order.get(x["suggested_priority"], 4), -x["waiting_hours"]))

    # Count by priority
    counts = {"immediate": 0, "urgent": 0, "moderate": 0, "routine": 0, "total": len(queue_items), "awaiting_review": 0}
    for item in queue_items:
        p = item["suggested_priority"]
        if p in counts:
            counts[p] += 1
        if item["review_status"] == "pending":
            counts["awaiting_review"] += 1

    return {
        "counts": counts,
        "items": queue_items,
    }


@router.get("/request/{request_id}")
def get_student_detail(
    request_id: int,
    current_user: models.User = Depends(require_role(["counsellor", "admin"])),
    db: Session = Depends(get_db),
):
    request = db.query(models.CounsellingRequest).filter(
        models.CounsellingRequest.id == request_id
    ).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    student = db.query(models.User).filter(models.User.id == request.student_id).first()
    profile = db.query(models.StudentProfile).filter(
        models.StudentProfile.user_id == request.student_id
    ).first()

    # Get questionnaire answers
    answers = db.query(models.QuestionnaireAnswer).filter(
        models.QuestionnaireAnswer.request_id == request_id
    ).all()

    answers_data = []
    for a in answers:
        question = db.query(models.QuestionnaireQuestion).filter(
            models.QuestionnaireQuestion.id == a.question_id
        ).first()
        answers_data.append({
            "question": question.question_text if question else "Unknown",
            "answer": a.answer,
            "category": question.category if question else "Unknown",
        })

    # AI Assessment
    ai_data = None
    if request.ai_assessment:
        ai_data = {
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
            "created_at": request.ai_assessment.created_at.isoformat(),
        }

    # Counsellor review
    review_data = None
    if request.review:
        reviewer = db.query(models.User).filter(
            models.User.id == request.review.counsellor_id
        ).first()
        review_data = {
            "final_priority": request.review.final_priority,
            "action": request.review.action,
            "notes": request.review.notes,
            "override_reason": request.review.override_reason,
            "reviewed_at": request.review.reviewed_at.isoformat() if request.review.reviewed_at else None,
            "counsellor_name": reviewer.name if reviewer else "Unknown",
        }

    # Appointment
    appointment = None
    if request.appointment:
        appointment = {
            "id": request.appointment.id,
            "date": request.appointment.date,
            "time": request.appointment.time,
            "location": request.appointment.location,
            "meeting_link": request.appointment.meeting_link,
            "status": request.appointment.status,
        }

    return {
        "request_id": request.id,
        "status": request.status,
        "ai_status": request.ai_status,
        "created_at": request.created_at.isoformat(),
        "subjective_response": request.subjective_response,
        "concern_category": request.concern_category,
        "student": {
            "id": student.id if student else None,
            "name": student.name if student else "Unknown",
            "email": student.email if student else "",
            "university_id": profile.university_id if profile else "N/A",
            "course": profile.course if profile else "N/A",
            "year": profile.year if profile else None,
            "phone": profile.phone if profile else None,
        },
        "questionnaire_answers": answers_data,
        "ai_assessment": ai_data,
        "counsellor_review": review_data,
        "appointment": appointment,
    }


@router.put("/request/{request_id}/priority")
def update_priority(
    request_id: int,
    data: schemas.PriorityUpdate,
    current_user: models.User = Depends(require_role(["counsellor", "admin"])),
    db: Session = Depends(get_db),
):
    request = db.query(models.CounsellingRequest).filter(
        models.CounsellingRequest.id == request_id
    ).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Create or update review
    review = request.review
    if not review:
        review = models.CounsellorReview(
            request_id=request_id,
            counsellor_id=current_user.id,
            final_priority=data.priority,
            action="reviewed",
            override_reason=data.reason,
        )
        db.add(review)
    else:
        review.final_priority = data.priority
        review.override_reason = data.reason
        review.counsellor_id = current_user.id
        review.reviewed_at = datetime.utcnow()

    request.status = "under_review"

    # Audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        action="priority_change",
        target_type="counselling_request",
        target_id=request_id,
        details=f"Priority changed to {data.priority}. Reason: {data.reason or 'N/A'}",
    )
    db.add(audit)
    db.commit()

    return {"message": f"Priority updated to {data.priority}"}


@router.post("/request/{request_id}/appointment")
def create_appointment(
    request_id: int,
    data: schemas.AppointmentCreate,
    current_user: models.User = Depends(require_role(["counsellor", "admin"])),
    db: Session = Depends(get_db),
):
    request = db.query(models.CounsellingRequest).filter(
        models.CounsellingRequest.id == request_id
    ).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Check if appointment already exists
    existing = db.query(models.Appointment).filter(
        models.Appointment.request_id == request_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Appointment already exists for this request")

    appointment = models.Appointment(
        request_id=request_id,
        counsellor_id=current_user.id,
        student_id=request.student_id,
        date=data.date,
        time=data.time,
        location=data.location,
        meeting_link=data.meeting_link,
    )
    db.add(appointment)

    request.status = "appointment_scheduled"

    # Create notification for student
    student = db.query(models.User).filter(models.User.id == request.student_id).first()
    notification = models.Notification(
        user_id=request.student_id,
        type="appointment_scheduled",
        message=f"Your counselling appointment has been scheduled for {data.date} at {data.time}.",
    )
    db.add(notification)

    # Audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        action="appointment_created",
        target_type="counselling_request",
        target_id=request_id,
        details=f"Appointment on {data.date} at {data.time}",
    )
    db.add(audit)
    db.commit()

    # Send email
    if student:
        send_appointment_email(student.email, {
            "date": data.date,
            "time": data.time,
            "location": data.location or "TBD",
            "meeting_link": data.meeting_link,
            "counsellor": current_user.name,
        })

    return {"message": "Appointment scheduled successfully", "appointment_id": appointment.id}


@router.post("/request/{request_id}/escalate")
def escalate_request(
    request_id: int,
    current_user: models.User = Depends(require_role(["counsellor", "admin"])),
    db: Session = Depends(get_db),
):
    request = db.query(models.CounsellingRequest).filter(
        models.CounsellingRequest.id == request_id
    ).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    request.status = "escalated"

    review = request.review
    if not review:
        review = models.CounsellorReview(
            request_id=request_id,
            counsellor_id=current_user.id,
            final_priority="immediate",
            action="escalated",
            notes="Case escalated by counsellor",
        )
        db.add(review)
    else:
        review.action = "escalated"
        review.final_priority = "immediate"
        review.reviewed_at = datetime.utcnow()

    audit = models.AuditLog(
        user_id=current_user.id,
        action="escalated",
        target_type="counselling_request",
        target_id=request_id,
        details="Case escalated",
    )
    db.add(audit)
    db.commit()

    return {"message": "Case has been escalated"}


@router.post("/request/{request_id}/review")
def mark_reviewed(
    request_id: int,
    current_user: models.User = Depends(require_role(["counsellor", "admin"])),
    db: Session = Depends(get_db),
):
    request = db.query(models.CounsellingRequest).filter(
        models.CounsellingRequest.id == request_id
    ).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    request.status = "under_review"

    review = request.review
    if not review:
        suggested = request.ai_assessment.suggested_priority if request.ai_assessment else "routine"
        review = models.CounsellorReview(
            request_id=request_id,
            counsellor_id=current_user.id,
            final_priority=suggested,
            action="reviewed",
        )
        db.add(review)
    else:
        review.action = "reviewed"
        review.reviewed_at = datetime.utcnow()

    audit = models.AuditLog(
        user_id=current_user.id,
        action="reviewed",
        target_type="counselling_request",
        target_id=request_id,
    )
    db.add(audit)
    db.commit()

    return {"message": "Request marked as reviewed"}


@router.post("/request/{request_id}/more-info")
def request_more_info(
    request_id: int,
    current_user: models.User = Depends(require_role(["counsellor", "admin"])),
    db: Session = Depends(get_db),
):
    request = db.query(models.CounsellingRequest).filter(
        models.CounsellingRequest.id == request_id
    ).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    notification = models.Notification(
        user_id=request.student_id,
        type="more_info_requested",
        message="A counsellor has requested additional information regarding your counselling request. Please check your email.",
    )
    db.add(notification)
    db.commit()

    return {"message": "Request for more information sent to student"}
