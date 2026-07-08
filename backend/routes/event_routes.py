from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Event

router = APIRouter()


@router.get("/event/{event_name}")
def get_event(event_name: str, db: Session = Depends(get_db)):

    analysis = f"{event_name} is a great networking opportunity."

    new_event = Event(
        event=event_name,
        analysis=analysis
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return {
        "id": new_event.id,
        "event": new_event.event,
        "analysis": new_event.analysis
    }