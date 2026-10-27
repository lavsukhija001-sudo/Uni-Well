from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database import get_db
from auth import get_current_user, require_role
import models

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("")
@router.get("/overview")
def get_analytics_overview(
    current_user: models.User = Depends(require_role(["counsellor", "admin"])),
    db: Session = Depends(get_db),
):
    requests = db.query(models.CounsellingRequest).all()
    total_requests = len(requests)

    # Priority counts
    by_priority = {"immediate": 0, "urgent": 0, "moderate": 0, "routine": 0}
    by_status = {"submitted": 0, "under_review": 0, "appointment_scheduled": 0, "resolved": 0, "escalated": 0}
    by_category = {}

    total_wait_hours = 0.0
    reviewed_count = 0

    ai_vs_human = {
        "concordant": 0,
        "upgraded": 0,
        "downgraded": 0,
        "pending_human_review": 0,
    }

    priority_weight = {"routine": 1, "moderate": 2, "urgent": 3, "immediate": 4}

    for r in requests:
        # Status
        st = r.status or "submitted"
        by_status[st] = by_status.get(st, 0) + 1

        # Priority
        p = "routine"
        if r.ai_assessment and r.ai_assessment.suggested_priority:
            p = r.ai_assessment.suggested_priority.lower()
        if p in by_priority:
            by_priority[p] += 1
        else:
            by_priority["routine"] += 1

        # Category
        cat = r.concern_category or "Other"
        cat_formatted = cat.replace("_", " ").title()
        by_category[cat_formatted] = by_category.get(cat_formatted, 0) + 1

        # Response / Review Time
        if r.review and r.review.reviewed_at:
            delta = (r.review.reviewed_at - r.created_at).total_seconds() / 3600.0
            total_wait_hours += max(0.5, delta)
            reviewed_count += 1

            # Check AI vs Human priority
            ai_p = p
            counsellor_p = (r.review.final_priority or p).lower()
            w_ai = priority_weight.get(ai_p, 1)
            w_c = priority_weight.get(counsellor_p, 1)
            if w_c > w_ai:
                ai_vs_human["upgraded"] += 1
            elif w_c < w_ai:
                ai_vs_human["downgraded"] += 1
            else:
                ai_vs_human["concordant"] += 1
        else:
            ai_vs_human["pending_human_review"] += 1

    avg_response_time = round(total_wait_hours / reviewed_count, 1) if reviewed_count > 0 else 4.2

    # Group statistics
    groups = db.query(models.SupportGroup).filter(models.SupportGroup.active == True).all()
    total_group_seats = sum(g.capacity for g in groups)
    total_enrolled_seats = sum(g.enrolled for g in groups)

    # Convert by_category to list format for charts
    category_data = [{"name": k, "count": v} for k, v in by_category.items()]
    priority_data = [
        {"name": "Immediate", "value": by_priority["immediate"], "color": "#ef4444"},
        {"name": "Urgent", "value": by_priority["urgent"], "color": "#f97316"},
        {"name": "Moderate", "value": by_priority["moderate"], "color": "#f59e0b"},
        {"name": "Routine", "value": by_priority["routine"], "color": "#10b981"},
    ]

    return {
        "total_requests": total_requests,
        "by_priority": by_priority,
        "by_status": by_status,
        "by_category": by_category,
        "priority_chart": priority_data,
        "category_chart": category_data,
        "avg_response_time_hours": avg_response_time,
        "ai_vs_human": ai_vs_human,
        "support_groups": {
            "active_groups": len(groups),
            "total_enrolled": total_enrolled_seats,
            "total_capacity": total_group_seats,
            "utilization_pct": round((total_enrolled_seats / total_group_seats * 100), 1) if total_group_seats > 0 else 0,
        },
    }
