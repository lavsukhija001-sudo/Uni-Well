from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from auth import get_current_user, require_role
import models
import schemas

router = APIRouter(prefix="/api/groups", tags=["Support Groups"])


@router.get("", response_model=List[schemas.SupportGroupResponse])
def get_support_groups(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    groups = db.query(models.SupportGroup).filter(
        models.SupportGroup.active == True
    ).all()
    return groups


@router.post("", response_model=schemas.SupportGroupResponse)
def create_support_group(
    group_data: schemas.SupportGroupResponse,
    current_user: models.User = Depends(require_role(["counsellor", "admin"])),
    db: Session = Depends(get_db),
):
    group = models.SupportGroup(
        name=group_data.name,
        description=group_data.description,
        organiser=group_data.organiser,
        moderator=group_data.moderator,
        schedule=group_data.schedule,
        location=group_data.location,
        capacity=group_data.capacity,
        enrolled=0,
        is_online=group_data.is_online,
        active=True,
    )
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


@router.post("/{group_id}/join")
def join_support_group(
    group_id: int,
    current_user: models.User = Depends(require_role(["student"])),
    db: Session = Depends(get_db),
):
    group = db.query(models.SupportGroup).filter(
        models.SupportGroup.id == group_id,
        models.SupportGroup.active == True,
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Support group not found")

    if group.enrolled >= group.capacity:
        raise HTTPException(status_code=400, detail="Support group is at full capacity")

    group.enrolled += 1

    # Create notification for student
    notification = models.Notification(
        user_id=current_user.id,
        type="group_joined",
        message=f"You have successfully joined the '{group.name}' support group. Meeting schedule: {group.schedule}.",
    )
    db.add(notification)
    db.commit()

    return {
        "message": f"Successfully joined '{group.name}'",
        "group_id": group.id,
        "enrolled": group.enrolled,
        "capacity": group.capacity,
    }
