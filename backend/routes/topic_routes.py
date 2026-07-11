from fastapi import APIRouter
from pydantic import BaseModel

from backend.services.topic_generator import generate_topics

router = APIRouter()


class TopicRequest(BaseModel):
    event: str


@router.post("/generate-topics")
def generate_topics_route(request: TopicRequest):
    topics = generate_topics(request.event)

    return {
        "topics": topics.split("\n")
    }