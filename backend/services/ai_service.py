import json
import os
import logging

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

SYSTEM_PROMPT = """You are an AI assistant for a university counselling platform. Your role is to help counsellors by summarising student-submitted information and suggesting an urgency level for review.

IMPORTANT RULES:
- You are NOT a psychologist or counsellor.
- You do NOT diagnose any mental health conditions.
- You do NOT make clinical decisions.
- You ONLY summarise and highlight concerns for human review.
- All your outputs are RECOMMENDATIONS that must be reviewed by a qualified human.

Given a student's free-text description of their situation, their selected concern category, and their questionnaire answers, produce a JSON object with EXACTLY this structure:

{
  "primary_concerns": ["list of main concerns identified"],
  "duration": "estimated duration of difficulties (e.g., 'approximately 3 weeks')",
  "functional_impact": "none | mild | moderate | significant | severe",
  "key_indicators": ["specific phrases or indicators from the student's responses"],
  "suggested_urgency": "immediate | urgent | moderate | routine",
  "human_review_required": true,
  "summary": "A concise summary of the student's situation for the counsellor",
  "reasoning_factors": ["factors that influenced the urgency suggestion"],
  "safety_flag": false
}

Guidelines for urgency:
- "immediate": Any indication of safety concerns, self-harm, harm to others, or crisis situations
- "urgent": Significant distress, substantial functional impairment, persistent problems affecting daily life
- "moderate": Meaningful wellbeing concerns, some functional impact, ongoing difficulties
- "routine": General support needs, mild stress, adjustment issues

Set safety_flag to true ONLY if there are explicit safety concerns.
Always set human_review_required to true.

Return ONLY the JSON object, no additional text."""


async def analyze_student_request(
    subjective_response: str,
    concern_category: str | None,
    questionnaire_answers: list[dict],
) -> dict | None:
    """Analyze student request using Gemini API and return structured assessment."""
    
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not set. Using fallback analysis.")
        return _fallback_analysis(subjective_response, concern_category, questionnaire_answers)
    
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        # Format questionnaire answers for the prompt
        answers_text = ""
        for ans in questionnaire_answers:
            answers_text += f"- Q: {ans.get('question', 'N/A')} -> A: {ans.get('answer', 'N/A')}\n"
        
        user_prompt = f"""Student Submission:

Concern Category: {concern_category or 'Not specified'}

Student's Description:
\"{subjective_response}\"

Questionnaire Responses:
{answers_text if answers_text else 'No questionnaire responses provided'}

Please analyze this submission and provide the structured JSON assessment."""
        
        response = model.generate_content(
            [
                {"role": "user", "parts": [{"text": SYSTEM_PROMPT}]},
                {"role": "model", "parts": [{"text": "Understood. I will analyze student submissions and return structured JSON assessments as specified, without making diagnoses or clinical decisions."}]},
                {"role": "user", "parts": [{"text": user_prompt}]},
            ]
        )
        
        # Parse the response
        response_text = response.text.strip()
        # Remove markdown code fences if present
        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()
        
        result = json.loads(response_text)
        
        # Ensure required fields exist
        result.setdefault("primary_concerns", [])
        result.setdefault("duration", "not specified")
        result.setdefault("functional_impact", "not specified")
        result.setdefault("key_indicators", [])
        result.setdefault("suggested_urgency", "moderate")
        result.setdefault("human_review_required", True)
        result.setdefault("summary", "AI summary could not be fully generated.")
        result.setdefault("reasoning_factors", [])
        result.setdefault("safety_flag", False)
        
        return result
        
    except Exception as e:
        logger.error(f"Gemini API analysis failed: {e}")
        return _fallback_analysis(subjective_response, concern_category, questionnaire_answers)


def _fallback_analysis(
    subjective_response: str,
    concern_category: str | None,
    questionnaire_answers: list[dict],
) -> dict:
    """Rule-based fallback when Gemini API is unavailable."""
    
    # Simple keyword-based analysis
    text = subjective_response.lower()
    
    safety_keywords = ["suicide", "self-harm", "hurt myself", "end my life", "kill", "die", "not safe", "harm myself"]
    urgent_keywords = ["can't sleep", "can't eat", "panic", "crying", "hopeless", "worthless", "alone", "isolated", "failing"]
    moderate_keywords = ["stressed", "anxious", "worried", "pressure", "struggling", "difficult", "overwhelmed"]
    
    safety_flag = any(kw in text for kw in safety_keywords)
    has_urgent = any(kw in text for kw in urgent_keywords)
    has_moderate = any(kw in text for kw in moderate_keywords)
    
    if safety_flag:
        urgency = "immediate"
        impact = "severe"
    elif has_urgent:
        urgency = "urgent"
        impact = "significant"
    elif has_moderate:
        urgency = "moderate"
        impact = "moderate"
    else:
        urgency = "routine"
        impact = "mild"
    
    # Count Not Sure answers
    not_sure_count = sum(1 for a in questionnaire_answers if a.get("answer", "").lower() == "not sure")
    
    concerns = []
    if concern_category:
        concerns.append(concern_category.replace("_", " "))
    if "sleep" in text:
        concerns.append("sleep difficulties")
    if "stress" in text or "pressure" in text:
        concerns.append("stress")
    if "anxious" in text or "anxiety" in text:
        concerns.append("anxiety")
    if "lonely" in text or "alone" in text:
        concerns.append("loneliness")
    if not concerns:
        concerns.append("general wellbeing concern")
    
    # Truncate the response for the summary
    summary_text = subjective_response[:200] + ("..." if len(subjective_response) > 200 else "")
    
    return {
        "primary_concerns": concerns,
        "duration": "not specified",
        "functional_impact": impact,
        "key_indicators": [kw for kw in urgent_keywords + moderate_keywords if kw in text][:5],
        "suggested_urgency": urgency,
        "human_review_required": True,
        "summary": f"Student reports concerns related to {', '.join(concerns)}. {summary_text}",
        "reasoning_factors": [
            f"concern category: {concern_category or 'not specified'}",
            f"functional impact: {impact}",
            f"keyword analysis: {'safety concerns detected' if safety_flag else 'no immediate safety concerns'}",
        ],
        "safety_flag": safety_flag,
    }


async def chat_response(message: str) -> dict:
    """Generate a supportive chatbot response."""
    
    safety_keywords = ["suicide", "self-harm", "hurt myself", "end my life", "kill myself", "die"]
    if any(kw in message.lower() for kw in safety_keywords):
        return {
            "response": (
                "I can hear that you're going through an incredibly difficult time. "
                "Please know that help is available right now.\n\n"
                "🚨 **If you are in immediate danger, please call emergency services.**\n\n"
                "📞 **Crisis Helpline**: 988 Suicide & Crisis Lifeline (call or text 988)\n"
                "📞 **University Emergency**: Contact your university's emergency services\n\n"
                "You can also register for counselling through our platform, and a professional "
                "counsellor will be in touch as soon as possible.\n\n"
                "Remember: reaching out for help is a sign of strength."
            ),
            "resources_suggested": True,
        }
    
    if not GEMINI_API_KEY:
        return _fallback_chat(message)
    
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        chat_system = """You are UniWell Assistant, a supportive AI helper for a university wellbeing platform.

IMPORTANT:
- You are NOT a therapist, psychologist, or counsellor.
- You do NOT diagnose conditions.
- You do NOT prescribe medication.
- You provide general supportive responses and help students navigate university resources.
- If someone appears to be in crisis, direct them to emergency services and professional help.
- Keep responses warm, empathetic, and brief (2-3 paragraphs max).
- Encourage students to register for professional counselling when appropriate.
- You can explain how the platform works and what resources are available."""
        
        response = model.generate_content(
            [
                {"role": "user", "parts": [{"text": chat_system}]},
                {"role": "model", "parts": [{"text": "I understand. I'll provide supportive, navigational assistance while directing students to professional resources."}]},
                {"role": "user", "parts": [{"text": message}]},
            ]
        )
        
        return {
            "response": response.text.strip(),
            "resources_suggested": False,
        }
    except Exception as e:
        logger.error(f"Chat API failed: {e}")
        return _fallback_chat(message)


def _fallback_chat(message: str) -> dict:
    """Fallback chat response when Gemini is unavailable."""
    return {
        "response": (
            "Thank you for reaching out. I'm here to help you navigate our wellbeing resources.\n\n"
            "Here's what you can do on our platform:\n"
            "• **Request Counselling** — Connect with a professional university counsellor\n"
            "• **Support Groups** — Join student-led peer support groups\n"
            "• **Immediate Support** — Access crisis resources and emergency contacts\n\n"
            "If you'd like to speak with a counsellor, you can start by clicking "
            "'Request Counselling' on your dashboard. Would you like to know more about any of these options?"
        ),
        "resources_suggested": True,
    }
