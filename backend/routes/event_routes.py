import json
from datetime import datetime
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Event
from backend.services.event_analyzer import analyze_event

router = APIRouter()


# Request model
class EventRequest(BaseModel):
    event: str


@router.post("/analyze-event")
def analyze_event_route(request: EventRequest, db: Session = Depends(get_db)):

    analysis = analyze_event(request.event)

    # Save only the summary in the database
    new_event = Event(
    event=request.event,
    summary=analysis["summary"],
    talking_points=json.dumps(analysis["talking_points"]),
    networking_tips=json.dumps(analysis["networking_tips"]),
    confidence_score=analysis["confidence_score"],
    created_at=datetime.now()
)

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return {
        "id": new_event.id,
        "event": new_event.event,
        "summary": analysis["summary"],
        "talking_points": analysis["talking_points"],
        "networking_tips": analysis["networking_tips"],
        "confidence_score": analysis["confidence_score"]
    }