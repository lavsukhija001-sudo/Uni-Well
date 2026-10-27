from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import SessionLocal, engine, Base
from auth import get_password_hash
import models


def seed_database():
    """Seed initial questions, users, support groups, and sample triage requests."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Questionnaire Questions if empty
        if db.query(models.QuestionnaireQuestion).count() == 0:
            print("Seeding questionnaire questions...")
            base_questions = [
                {
                    "question_text": "Over the past two weeks, I have felt overwhelmed by daily pressures and demands.",
                    "category": "emotional_wellbeing",
                    "is_adaptive": False,
                    "order_num": 1,
                },
                {
                    "question_text": "I am experiencing persistent stress or anxiety that interferes with my ability to relax.",
                    "category": "stress",
                    "is_adaptive": False,
                    "order_num": 2,
                },
                {
                    "question_text": "My sleep quality or sleep schedule has been significantly disrupted recently.",
                    "category": "sleep",
                    "is_adaptive": False,
                    "order_num": 3,
                },
                {
                    "question_text": "I am finding it difficult to concentrate on coursework, attend classes, or complete assignments.",
                    "category": "academic_functioning",
                    "is_adaptive": False,
                    "order_num": 4,
                },
                {
                    "question_text": "I feel isolated, withdrawn, or disconnected from friends, family, and university life.",
                    "category": "social_functioning",
                    "is_adaptive": False,
                    "order_num": 5,
                },
                {
                    "question_text": "These difficulties have persisted continuously for more than two to three weeks.",
                    "category": "duration_persistence",
                    "is_adaptive": False,
                    "order_num": 6,
                },
                {
                    "question_text": "I feel safe in my current environment and have someone I can reach out to in distress.",
                    "category": "sense_of_safety",
                    "is_adaptive": False,
                    "order_num": 7,
                },
                {
                    "question_text": "My current wellbeing challenges are significantly impacting my ability to progress in my degree.",
                    "category": "impact_on_studies",
                    "is_adaptive": False,
                    "order_num": 8,
                },
            ]

            adaptive_questions = [
                # Academic pressure adaptive
                {
                    "question_text": "The fear of academic failure or falling behind dominates my daily thoughts.",
                    "category": "academic_stress",
                    "is_adaptive": True,
                    "trigger_category": "academic_pressure",
                    "order_num": 10,
                },
                {
                    "question_text": "I find myself avoiding lectures or deadlines because the workload feels unmanageable.",
                    "category": "academic_avoidance",
                    "is_adaptive": True,
                    "trigger_category": "academic_pressure",
                    "order_num": 11,
                },
                # Relationships adaptive
                {
                    "question_text": "Conflict or distress in a personal relationship is significantly impairing my daily functioning.",
                    "category": "relationship_distress",
                    "is_adaptive": True,
                    "trigger_category": "relationships",
                    "order_num": 12,
                },
                {
                    "question_text": "I lack a reliable emotional support system when experiencing interpersonal challenges.",
                    "category": "social_support",
                    "is_adaptive": True,
                    "trigger_category": "relationships",
                    "order_num": 13,
                },
                # Sleep adaptive
                {
                    "question_text": "I regularly experience insomnia, night waking, or exhaustion during class hours.",
                    "category": "sleep_impairment",
                    "is_adaptive": True,
                    "trigger_category": "sleep",
                    "order_num": 14,
                },
                # Loneliness adaptive
                {
                    "question_text": "I feel that nobody on campus truly knows or cares about what I am going through.",
                    "category": "perceived_isolation",
                    "is_adaptive": True,
                    "trigger_category": "loneliness",
                    "order_num": 15,
                },
            ]

            for q in base_questions + adaptive_questions:
                db.add(models.QuestionnaireQuestion(
                    question_text=q["question_text"],
                    category=q["category"],
                    is_adaptive=q["is_adaptive"],
                    trigger_category=q.get("trigger_category"),
                    active=True,
                    order_num=q["order_num"],
                ))
            db.commit()

        # 2. Seed Demo Users
        if db.query(models.User).filter(models.User.email == "student@uni.edu").first() is None:
            print("Seeding demo users...")
            demo_student = models.User(
                name="Alex Rivera",
                email="student@uni.edu",
                password_hash=get_password_hash("password123"),
                role="student",
            )
            db.add(demo_student)
            db.commit()
            db.refresh(demo_student)

            student_profile = models.StudentProfile(
                user_id=demo_student.id,
                university_id="STU-2024-8821",
                course="Computer Science & Data",
                year=2,
                semester=1,
                phone="+1 (555) 234-5678",
            )
            db.add(student_profile)

            counsellor = models.User(
                name="Dr. Sarah Chen, LPC",
                email="counsellor@uni.edu",
                password_hash=get_password_hash("password123"),
                role="counsellor",
            )
            db.add(counsellor)

            admin = models.User(
                name="Dean Marcus Vance",
                email="admin@uni.edu",
                password_hash=get_password_hash("password123"),
                role="admin",
            )
            db.add(admin)

            peer = models.User(
                name="Jordan Taylor (Senior Psych)",
                email="peer@uni.edu",
                password_hash=get_password_hash("password123"),
                role="peer_supporter",
            )
            db.add(peer)

            # Extra demo students for realistic queue
            student_elena = models.User(
                name="Elena Rostova",
                email="elena@uni.edu",
                password_hash=get_password_hash("password123"),
                role="student",
            )
            student_marcus = models.User(
                name="Marcus Brody",
                email="marcus@uni.edu",
                password_hash=get_password_hash("password123"),
                role="student",
            )
            student_samira = models.User(
                name="Samira Khan",
                email="samira@uni.edu",
                password_hash=get_password_hash("password123"),
                role="student",
            )
            student_david = models.User(
                name="David Kim",
                email="david@uni.edu",
                password_hash=get_password_hash("password123"),
                role="student",
            )
            db.add_all([student_elena, student_marcus, student_samira, student_david])
            db.commit()

            # Add profiles for extra students
            db.add_all([
                models.StudentProfile(user_id=student_elena.id, university_id="STU-2023-1104", course="Biomedical Science", year=3, semester=2, phone="+1 (555) 432-8871"),
                models.StudentProfile(user_id=student_marcus.id, university_id="STU-2024-5542", course="Mechanical Engineering", year=2, semester=1, phone="+1 (555) 871-3321"),
                models.StudentProfile(user_id=student_samira.id, university_id="STU-2022-9013", course="Law & International Relations", year=4, semester=1, phone="+1 (555) 349-2211"),
                models.StudentProfile(user_id=student_david.id, university_id="STU-2025-0199", course="Business Administration", year=1, semester=1, phone="+1 (555) 902-7711"),
            ])
            db.commit()

            # 3. Seed Support Groups
            print("Seeding support groups...")
            groups = [
                models.SupportGroup(
                    name="Exam Stress & Mindfulness Guild",
                    description="Weekly peer-supported mindfulness and academic decompression sessions run by senior psychology students.",
                    organiser="Psychology Student Guild",
                    moderator="Dr. Sarah Chen, LPC",
                    schedule="Tuesdays 4:00 PM - 5:30 PM",
                    location="Room 302, Student Hub",
                    capacity=15,
                    enrolled=9,
                    is_online=False,
                    active=True,
                ),
                models.SupportGroup(
                    name="First-Year Adjustment Circle",
                    description="A welcoming group for freshers navigating campus life, homesickness, workload management, and making connections.",
                    organiser="Peer Mentorship Network",
                    moderator="Jordan Taylor (Senior Psych)",
                    schedule="Wednesdays 5:00 PM - 6:00 PM",
                    location="Student Lounge B",
                    capacity=20,
                    enrolled=14,
                    is_online=False,
                    active=True,
                ),
                models.SupportGroup(
                    name="International Student Community",
                    description="Cultural transition, language confidence, visa stress, and building a local support circle.",
                    organiser="Global Student Alliance",
                    moderator="Maya Patel",
                    schedule="Thursdays 6:00 PM - 7:30 PM",
                    location="Zoom Online Hub",
                    capacity=25,
                    enrolled=18,
                    is_online=True,
                    active=True,
                ),
                models.SupportGroup(
                    name="Peer Listening & Safe Space",
                    description="Drop-in confidential listening space moderated by university trained peer supporters.",
                    organiser="Wellbeing Ambassadors",
                    moderator="Jordan Taylor",
                    schedule="Fridays 3:00 PM - 4:30 PM",
                    location="Quiet Room 104",
                    capacity=12,
                    enrolled=8,
                    is_online=False,
                    active=True,
                ),
                models.SupportGroup(
                    name="Social Anxiety & Connection Group",
                    description="Guided micro-challenges and mutual support for students feeling anxious about social interactions in university.",
                    organiser="Counselling Centre",
                    moderator="Dr. Sarah Chen, LPC",
                    schedule="Mondays 5:00 PM - 6:30 PM",
                    location="Room 204, Counselling Wing",
                    capacity=10,
                    enrolled=7,
                    is_online=False,
                    active=True,
                ),
            ]
            db.add_all(groups)
            db.commit()

            # 4. Seed Pre-Triaged Requests for Counsellor Priority Queue Demo
            print("Seeding demo queue requests...")
            
            # Case 1: IMMEDIATE safety flag
            req_elena = models.CounsellingRequest(
                student_id=student_elena.id,
                subjective_response="I feel completely hopeless and can't go on like this. I've been thinking about ending my life and feel like no one would notice if I disappeared.",
                concern_category="loneliness",
                status="submitted",
                ai_status="completed",
                created_at=datetime.utcnow() - timedelta(hours=2.5),
            )
            db.add(req_elena)
            db.commit()
            db.refresh(req_elena)

            ai_elena = models.AIAssessment(
                request_id=req_elena.id,
                summary="Student expresses acute feelings of hopelessness and thoughts of ending their life with profound perceived isolation.",
                concerns=["severe crisis", "hopelessness", "isolation"],
                suggested_priority="immediate",
                safety_flag=True,
                not_sure_count=0,
                not_sure_percentage=0.0,
                duration="recent acute escalation",
                functional_impact="severe",
                key_indicators=["ending my life", "completely hopeless", "no one would notice"],
                reasoning_factors=["Explicit crisis/safety keywords identified", "Severe functional impairment", "Immediate human outreach indicated"],
                human_review_required=True,
                created_at=datetime.utcnow() - timedelta(hours=2.4),
            )
            db.add(ai_elena)

            # Case 2: URGENT - Academic Pressure & Insomnia
            req_marcus = models.CounsellingRequest(
                student_id=student_marcus.id,
                subjective_response="I haven't slept more than 2-3 hours a night for nearly three weeks because of project anxiety. I'm having panic sensations before labs, missed four sessions already, and feel paralyzed.",
                concern_category="academic_pressure",
                status="submitted",
                ai_status="completed",
                created_at=datetime.utcnow() - timedelta(hours=6.2),
            )
            db.add(req_marcus)
            db.commit()
            db.refresh(req_marcus)

            ai_marcus = models.AIAssessment(
                request_id=req_marcus.id,
                summary="Student presents with persistent severe insomnia (3 weeks) coupled with panic symptoms and documented academic avoidance (missing mandatory labs).",
                concerns=["academic pressure", "severe sleep disruption", "panic symptoms"],
                suggested_priority="urgent",
                safety_flag=False,
                not_sure_count=2,
                not_sure_percentage=20.0,
                duration="approximately 3 weeks",
                functional_impact="significant",
                key_indicators=["haven't slept more than 2-3 hours", "panic sensations", "missed four sessions"],
                reasoning_factors=["Functional impairment in academic progression", "Severe sleep deprivation", "Persistent 3+ weeks duration"],
                human_review_required=True,
                created_at=datetime.utcnow() - timedelta(hours=6.1),
            )
            db.add(ai_marcus)

            # Case 3: MODERATE - Relationship Breakdown
            req_samira = models.CounsellingRequest(
                student_id=student_samira.id,
                subjective_response="Going through a difficult breakup after a 3-year relationship. Feeling constantly sad and struggling with appetite and focus, though I am managing to submit my assignments on time.",
                concern_category="relationships",
                status="under_review",
                ai_status="completed",
                created_at=datetime.utcnow() - timedelta(hours=14.0),
            )
            db.add(req_samira)
            db.commit()
            db.refresh(req_samira)

            ai_samira = models.AIAssessment(
                request_id=req_samira.id,
                summary="Student reports emotional distress following an interpersonal relationship rupture. Preserved basic academic functioning with moderate affective impact.",
                concerns=["relationship distress", "grief/loss", "appetite disturbance"],
                suggested_priority="moderate",
                safety_flag=False,
                not_sure_count=1,
                not_sure_percentage=10.0,
                duration="approximately 2 weeks",
                functional_impact="moderate",
                key_indicators=["difficult breakup", "constantly sad", "managing to submit"],
                reasoning_factors=["Ongoing emotional distress", "No safety flags", "Academic functioning partially preserved"],
                human_review_required=True,
                created_at=datetime.utcnow() - timedelta(hours=13.8),
            )
            db.add(ai_samira)

            # Case 4: ROUTINE - University Adjustment
            req_david = models.CounsellingRequest(
                student_id=student_david.id,
                subjective_response="I'm a first-year student from out of state. Feeling a bit homesick and overwhelmed by the change of pace. Just want some guidance on developing good study habits and finding campus clubs.",
                concern_category="adjustment_to_university",
                status="appointment_scheduled",
                ai_status="completed",
                created_at=datetime.utcnow() - timedelta(days=1, hours=8),
            )
            db.add(req_david)
            db.commit()
            db.refresh(req_david)

            ai_david = models.AIAssessment(
                request_id=req_david.id,
                summary="First-year student seeking proactive guidance for campus adjustment, study routine structuring, and overcoming mild homesickness.",
                concerns=["adjustment to university", "homesickness", "study habit guidance"],
                suggested_priority="routine",
                safety_flag=False,
                not_sure_count=0,
                not_sure_percentage=0.0,
                duration="1 week",
                functional_impact="mild",
                key_indicators=["first-year student", "homesick", "guidance on study habits"],
                reasoning_factors=["Standard transitional challenges", "No functional impairment", "High proactive motivation"],
                human_review_required=True,
                created_at=datetime.utcnow() - timedelta(days=1, hours=7),
            )
            db.add(ai_david)

            # Case 4 review & appointment
            review_david = models.CounsellorReview(
                request_id=req_david.id,
                counsellor_id=counsellor.id,
                final_priority="routine",
                action="reviewed",
                notes="Introductory consultation scheduled. Recommended First-Year Adjustment Circle.",
                reviewed_at=datetime.utcnow() - timedelta(days=1, hours=2),
            )
            db.add(review_david)

            appt_david = models.Appointment(
                request_id=req_david.id,
                counsellor_id=counsellor.id,
                student_id=student_david.id,
                date="2026-09-24",
                time="10:00 AM",
                location="Counselling Wing, Room 102",
                meeting_link=None,
                status="scheduled",
            )
            db.add(appt_david)

            # Also seed a welcome notification for demo student Alex
            notif_alex = models.Notification(
                user_id=demo_student.id,
                type="system_welcome",
                message="Welcome to UniWell! If you need support, talk to a counsellor or join a peer group anytime.",
            )
            db.add(notif_alex)

            db.commit()
            print("Seeding completed successfully!")

    except Exception as e:
        print(f"Seeding error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
