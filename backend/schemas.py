from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
from datetime import datetime

# --- Auth Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str

class UserCreate(UserBase):
    password: str
    # Student specific fields if role == 'student'
    university_id: Optional[str] = None
    course: Optional[str] = None
    year: Optional[int] = None
    semester: Optional[int] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

# --- Student Profile Schemas ---
class StudentProfileBase(BaseModel):
    university_id: str
    course: str
    year: int
    semester: int
    phone: Optional[str] = None

class StudentProfileUpdate(BaseModel):
    course: Optional[str] = None
    year: Optional[int] = None
    semester: Optional[int] = None
    phone: Optional[str] = None

class StudentProfileResponse(StudentProfileBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True

# --- Counselling Request Schemas ---
class CounsellingRequestCreate(BaseModel):
    subjective_response: str
    concern_category: Optional[str] = None

class CounsellingRequestResponse(BaseModel):
    id: int
    student_id: int
    subjective_response: str
    concern_category: Optional[str]
    status: str
    ai_status: str
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True

# --- Questionnaire Schemas ---
class QuestionnaireQuestionResponse(BaseModel):
    id: int
    question_text: str
    category: str
    is_adaptive: bool
    trigger_category: Optional[str]
    order_num: int
    class Config:
        from_attributes = True

class AnswerInput(BaseModel):
    question_id: int
    answer: str

class QuestionnaireSubmit(BaseModel):
    request_id: int
    answers: List[AnswerInput]

# --- AI Assessment Schemas ---
class AIAssessmentResponse(BaseModel):
    id: int
    summary: str
    concerns: List[str]
    suggested_priority: str
    safety_flag: bool
    duration: Optional[str]
    functional_impact: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

# --- Counsellor & Queues ---
class StudentDetailResponse(BaseModel):
    id: int
    name: str
    email: str
    profile: Optional[StudentProfileResponse]
    class Config:
        from_attributes = True

class CounsellorQueueResponse(BaseModel):
    request: CounsellingRequestResponse
    student: StudentDetailResponse
    ai_assessment: Optional[AIAssessmentResponse]
    class Config:
        from_attributes = True

class PriorityUpdate(BaseModel):
    priority: str
    reason: Optional[str] = None

class EscalateRequest(BaseModel):
    reason: str

class ReviewRequest(BaseModel):
    notes: str
    action: str

# --- Appointments ---
class AppointmentCreate(BaseModel):
    date: str
    time: str
    location: Optional[str] = None
    meeting_link: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: int
    date: str
    time: str
    location: Optional[str]
    meeting_link: Optional[str]
    status: str
    counsellor_id: int
    class Config:
        from_attributes = True

# --- Support Groups ---
class SupportGroupResponse(BaseModel):
    id: int
    name: str
    description: str
    organiser: str
    moderator: Optional[str]
    schedule: str
    location: str
    capacity: int
    enrolled: int
    is_online: bool
    active: bool
    class Config:
        from_attributes = True

class GroupJoinRequest(BaseModel):
    group_id: int

# --- Analytics ---
class AnalyticsOverview(BaseModel):
    total_requests: int
    by_priority: dict
    by_status: dict
    avg_response_time_hours: float

# --- Chat ---
class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    resources_suggested: bool

# --- Notifications ---
class NotificationResponse(BaseModel):
    id: int
    type: str
    message: str
    read: bool
    created_at: datetime
    class Config:
        from_attributes = True
