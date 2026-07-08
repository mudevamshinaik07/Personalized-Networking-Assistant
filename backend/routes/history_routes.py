from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Event

router = APIRouter()


@router.get("/history")
def get_history(db: Session = Depends(get_db)):
    events = db.query(Event).all()

    return events