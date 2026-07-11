from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

from backend.database import get_db
from backend.models import Event

import os

router = APIRouter()


@router.get("/history/{event_id}/pdf")
def export_pdf(event_id: int, db: Session = Depends(get_db)):

    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(status_code=404, detail="History not found")

    filename = f"history_{event_id}.pdf"

    doc = SimpleDocTemplate(filename)

    styles = getSampleStyleSheet()

    story = []

    story.append(Paragraph("<b>PERSONALIZED NETWORKING ASSISTANT</b>", styles["Heading1"]))

    story.append(Paragraph(f"<b>Event:</b> {event.event}", styles["BodyText"]))

    story.append(Paragraph(f"<b>Summary:</b> {event.summary}", styles["BodyText"]))

    story.append(Paragraph(f"<b>Confidence:</b> {event.confidence_score}%", styles["BodyText"]))

    story.append(Paragraph(f"<b>Date:</b> {event.created_at}", styles["BodyText"]))

    doc.build(story)

    return FileResponse(
        filename,
        media_type="application/pdf",
        filename=filename
    )