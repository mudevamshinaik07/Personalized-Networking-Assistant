from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Feedback

router = APIRouter()


@router.post("/feedback/{text}")
def save_feedback(text: str, db: Session = Depends(get_db)):
    feedback = Feedback(feedback=text)

    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return {
        "id": feedback.id,
        "feedback": feedback.feedback
    }