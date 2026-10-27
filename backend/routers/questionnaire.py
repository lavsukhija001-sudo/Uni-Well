from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user, require_role
from services.ai_service import analyze_student_request
from services.triage_engine import calculate_priority
import models
import schemas

router = APIRouter(prefix="/api/questionnaire", tags=["Questionnaire"])


@router.get("")
def get_questions(
    category: str = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.QuestionnaireQuestion).filter(
        models.QuestionnaireQuestion.active == True
    )

    # Get base questions (not adaptive)
    base_questions = query.filter(
        models.QuestionnaireQuestion.is_adaptive == False
    ).order_by(models.QuestionnaireQuestion.order_num).all()

    # Get adaptive questions if category is specified
    adaptive_questions = []
    if category:
        adaptive_questions = query.filter(
            models.QuestionnaireQuestion.is_adaptive == True,
            models.QuestionnaireQuestion.trigger_category == category,
        ).order_by(models.QuestionnaireQuestion.order_num).all()

    all_questions = base_questions + adaptive_questions

    return [
        {
            "id": q.id,
            "question_text": q.question_text,
            "category": q.category,
            "is_adaptive": q.is_adaptive,
            "order_num": q.order_num,
        }
        for q in all_questions
    ]


async def _run_ai_analysis(request_id: int, db_url: str):
    """Background task to run AI analysis on a counselling request."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    engine = create_engine(db_url, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        request = db.query(models.CounsellingRequest).filter(
            models.CounsellingRequest.id == request_id
        ).first()
        if not request:
            return

        # Get questionnaire answers with question text
        answers = db.query(models.QuestionnaireAnswer).filter(
            models.QuestionnaireAnswer.request_id == request_id
        ).all()

        answer_data = []
        for a in answers:
            question = db.query(models.QuestionnaireQuestion).filter(
                models.QuestionnaireQuestion.id == a.question_id
            ).first()
            answer_data.append({
                "question": question.question_text if question else "Unknown",
                "answer": a.answer,
            })

        # Run AI analysis
        result = await analyze_student_request(
            subjective_response=request.subjective_response,
            concern_category=request.concern_category,
            questionnaire_answers=answer_data,
        )

        if result is None:
            request.ai_status = "failed"
            db.commit()
            return

        # Count Not Sure answers
        not_sure_count = sum(1 for a in answer_data if a["answer"].lower() == "not sure")
        total_answers = len(answer_data) if answer_data else 1
        not_sure_pct = (not_sure_count / total_answers) * 100

        # Calculate final priority using triage engine
        final_priority = calculate_priority(result, answer_data)

        # Create AI assessment record
        assessment = models.AIAssessment(
            request_id=request_id,
            summary=result.get("summary", ""),
            concerns=result.get("primary_concerns", []),
            suggested_priority=final_priority,
            safety_flag=result.get("safety_flag", False),
            not_sure_count=not_sure_count,
            not_sure_percentage=round(not_sure_pct, 1),
            duration=result.get("duration"),
            functional_impact=result.get("functional_impact"),
            key_indicators=result.get("key_indicators", []),
            reasoning_factors=result.get("reasoning_factors", []),
            human_review_required=True,
        )
        db.add(assessment)

        request.ai_status = "completed"
        db.commit()

    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"AI analysis failed for request {request_id}: {e}")
        request = db.query(models.CounsellingRequest).filter(
            models.CounsellingRequest.id == request_id
        ).first()
        if request:
            request.ai_status = "failed"
            db.commit()
    finally:
        db.close()


@router.post("/submit")
async def submit_answers(
    data: schemas.QuestionnaireSubmit,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(require_role(["student"])),
    db: Session = Depends(get_db),
):
    # Verify the request belongs to this student
    request = db.query(models.CounsellingRequest).filter(
        models.CounsellingRequest.id == data.request_id,
        models.CounsellingRequest.student_id == current_user.id,
    ).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Save answers
    for answer in data.answers:
        qa = models.QuestionnaireAnswer(
            request_id=data.request_id,
            question_id=answer.question_id,
            answer=answer.answer,
        )
        db.add(qa)

    db.commit()

    # Trigger AI analysis in background
    db_url = "sqlite:///./wellbeing.db"
    background_tasks.add_task(_run_ai_analysis, data.request_id, db_url)

    # Calculate expected response
    expected_response = "Within 3-5 working days"

    return {
        "message": "Thank you. Your counselling request has been successfully submitted.",
        "detail": "Your responses are being reviewed so we can connect you with the appropriate support.",
        "request_id": data.request_id,
        "expected_response": expected_response,
    }
