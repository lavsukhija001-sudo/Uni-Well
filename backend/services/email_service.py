import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def send_request_received_email(student_email: str, request_id: int):
    """
    Stub/mock email service for MVP.
    Logs email to console.
    """
    logger.info(f"[EMAIL MOCK] To: {student_email} | Subject: Counselling Request #{request_id} Received | Body: Your request has been successfully submitted and is under review.")

def send_appointment_email(student_email: str, appointment_details: dict):
    """
    Stub/mock email service for MVP.
    Logs email to console.
    """
    logger.info(f"[EMAIL MOCK] To: {student_email} | Subject: Counselling Appointment Scheduled | Body: Your appointment is scheduled for {appointment_details.get('date')} at {appointment_details.get('time')}.")
