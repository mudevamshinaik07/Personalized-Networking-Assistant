import json

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Event

router = APIRouter()


@router.get("/history")
def get_history(
    page: int = Query(1),
    limit: int = Query(5),
    search: str = "",
    db: Session = Depends(get_db),
):
    query = db.query(Event)

    if search:
        query = query.filter(Event.event.contains(search))

    total = query.count()

    events = (
        query.order_by(Event.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    results = []

    for event in events:

        results.append({
            "id": event.id,
            "date": event.created_at.strftime("%d-%b-%Y %I:%M:%S %p"),
            "event": event.event,
            "summary": event.summary,
            "talking_points": json.loads(event.talking_points),
            "networking_tips": json.loads(event.networking_tips),
            "confidence_score": event.confidence_score
        })

    return {
        "total": total,
        "results": results
    }


@router.delete("/history/{event_id}")
def delete_history(event_id: int, db: Session = Depends(get_db)):

    event = db.query(Event).filter(Event.id == event_id).first()

    if event:

        db.delete(event)
        db.commit()

        return {
            "message": "History deleted successfully."
        }

    return {
        "message": "History not found."
    }