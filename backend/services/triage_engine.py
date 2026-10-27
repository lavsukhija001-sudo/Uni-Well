from typing import Dict, Any, List

def calculate_priority(ai_assessment: Dict[str, Any], questionnaire_answers: List[Dict[str, str]]) -> str:
    """
    Implements rule-based triage:
    - If safety_flag is True -> IMMEDIATE
    - If functional_impact is 'significant' or 'severe' -> URGENT
    - If duration indicates persistence (weeks+) and distress -> MODERATE
    - Otherwise -> ROUTINE
    """
    if ai_assessment.get("safety_flag") is True:
        return "immediate"
        
    impact = str(ai_assessment.get("functional_impact", "")).lower()
    if "severe" in impact or "significant" in impact:
        return "urgent"
        
    duration = str(ai_assessment.get("duration", "")).lower()
    if "week" in duration or "month" in duration or "year" in duration:
        return "moderate"
        
    return "routine"
