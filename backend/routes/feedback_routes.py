from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Feedback

router = APIRouter()


class FeedbackRequest(BaseModel):
    rating: int
    feedback: str


@router.post("/feedback")
def save_feedback(request: FeedbackRequest, db: Session = Depends(get_db)):

    new_feedback = Feedback(
        rating=request.rating,
        feedback=request.feedback
    )

    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)

    return {
        "message": "Feedback submitted successfully!",
        "id": new_feedback.id
    }


@router.get("/feedback")
def get_feedback(db: Session = Depends(get_db)):

    feedbacks = db.query(Feedback).order_by(Feedback.created_at.desc()).all()

    return feedbacks