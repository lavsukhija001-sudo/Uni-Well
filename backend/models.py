import json
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.types import TypeDecorator
from datetime import datetime
from database import Base

class JSONEncodedDict(TypeDecorator):
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return json.loads(value)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String) # student, counsellor, admin, peer_supporter
    created_at = Column(DateTime, default=datetime.utcnow)

    student_profile = relationship("StudentProfile", back_populates="user", uselist=False)
    counselling_requests = relationship("CounsellingRequest", back_populates="student", foreign_keys="[CounsellingRequest.student_id]")
    notifications = relationship("Notification", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    university_id = Column(String)
    course = Column(String)
    year = Column(Integer)
    semester = Column(Integer)
    phone = Column(String, nullable=True)

    user = relationship("User", back_populates="student_profile")

class CounsellingRequest(Base):
    __tablename__ = "counselling_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    subjective_response = Column(Text)
    concern_category = Column(String, nullable=True)
    status = Column(String, default="submitted") # submitted, under_review, appointment_scheduled, resolved, escalated
    ai_status = Column(String, default="pending") # pending, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = relationship("User", back_populates="counselling_requests", foreign_keys=[student_id])
    answers = relationship("QuestionnaireAnswer", back_populates="request")
    ai_assessment = relationship("AIAssessment", back_populates="request", uselist=False)
    review = relationship("CounsellorReview", back_populates="request", uselist=False)
    appointment = relationship("Appointment", back_populates="request", uselist=False)

class QuestionnaireQuestion(Base):
    __tablename__ = "questionnaire_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    question_text = Column(Text)
    category = Column(String)
    is_adaptive = Column(Boolean, default=False)
    trigger_category = Column(String, nullable=True)
    active = Column(Boolean, default=True)
    order_num = Column(Integer)

class QuestionnaireAnswer(Base):
    __tablename__ = "questionnaire_answers"
    
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("counselling_requests.id"))
    question_id = Column(Integer, ForeignKey("questionnaire_questions.id"))
    answer = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("CounsellingRequest", back_populates="answers")
    question = relationship("QuestionnaireQuestion")

class AIAssessment(Base):
    __tablename__ = "ai_assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("counselling_requests.id"), unique=True)
    summary = Column(Text)
    concerns = Column(JSONEncodedDict) # JSON list of concerns
    suggested_priority = Column(String) # immediate, urgent, moderate, routine
    safety_flag = Column(Boolean, default=False)
    not_sure_count = Column(Integer, default=0)
    not_sure_percentage = Column(Float, default=0.0)
    duration = Column(String, nullable=True)
    functional_impact = Column(String, nullable=True)
    key_indicators = Column(JSONEncodedDict)
    reasoning_factors = Column(JSONEncodedDict)
    human_review_required = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("CounsellingRequest", back_populates="ai_assessment")

class CounsellorReview(Base):
    __tablename__ = "counsellor_reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("counselling_requests.id"))
    counsellor_id = Column(Integer, ForeignKey("users.id"))
    final_priority = Column(String)
    action = Column(String) # reviewed, escalated, more_info, peer_support
    notes = Column(Text, nullable=True)
    override_reason = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("CounsellingRequest", back_populates="review")
    counsellor = relationship("User")

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("counselling_requests.id"))
    counsellor_id = Column(Integer, ForeignKey("users.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    date = Column(String)
    time = Column(String)
    location = Column(String, nullable=True)
    meeting_link = Column(String, nullable=True)
    status = Column(String, default="scheduled") # scheduled, completed, cancelled, rescheduled
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("CounsellingRequest", back_populates="appointment")
    counsellor = relationship("User", foreign_keys=[counsellor_id])
    student = relationship("User", foreign_keys=[student_id])

class SupportGroup(Base):
    __tablename__ = "support_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    organiser = Column(String)
    moderator = Column(String, nullable=True)
    schedule = Column(String)
    location = Column(String)
    capacity = Column(Integer)
    enrolled = Column(Integer, default=0)
    is_online = Column(Boolean, default=False)
    active = Column(Boolean, default=True)

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String)
    message = Column(Text)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    target_type = Column(String)
    target_id = Column(Integer)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
