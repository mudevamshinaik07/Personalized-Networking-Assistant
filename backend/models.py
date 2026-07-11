from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from backend.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    event = Column(String)
    summary = Column(Text)
    talking_points = Column(Text)
    networking_tips = Column(Text)
    confidence_score = Column(Integer)
    created_at = Column(DateTime, default=datetime.now)


class History(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(Text)
    response = Column(Text)

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)

    rating = Column(Integer)

    feedback = Column(Text)

    created_at = Column(DateTime, default=datetime.now)