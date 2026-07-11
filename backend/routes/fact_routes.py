from fastapi import APIRouter
from pydantic import BaseModel

from backend.services.fact_checker import verify_fact

router = APIRouter()


class FactRequest(BaseModel):
    statement: str


@router.post("/fact-check")
def fact_check(request: FactRequest):

    result = verify_fact(request.statement)

    return {
        "verified": result["status"].lower() == "verified",
        "status": result["status"],
        "confidence": result["confidence"],
        "source": result["source"],
        "explanation": result["summary"]
    }