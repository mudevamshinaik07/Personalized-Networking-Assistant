from fastapi import FastAPI

from backend.database import Base, engine
from backend import models

from backend.routes.event_routes import router as event_router
from backend.routes.history_routes import router as history_router
from backend.routes.feedback_routes import router as feedback_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(event_router)
app.include_router(history_router)
app.include_router(feedback_router)

@app.get("/")
def root():
    return {"message": "Backend Running Successfully"}