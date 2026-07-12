from backend.routes.pdf_routes import router as pdf_router
from backend.routes.fact_routes import router as fact_router
from backend.routes.topic_routes import router as topic_router
from backend.routes.feedback_routes import router as feedback_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import Base, engine
from backend import models

from backend.routes.event_routes import router as event_router
from backend.routes.history_routes import router as history_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(event_router)
app.include_router(history_router)
app.include_router(topic_router)
app.include_router(fact_router)
app.include_router(pdf_router)
app.include_router(feedback_router)

@app.get("/")
def root():
    return {"message": "Backend Running Successfully"}