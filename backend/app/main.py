from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import scan, history, auth
from app.services.nlp_service import setup_nltk, get_spacy_nlp

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warm up resources on startup to prevent slow first request
    setup_nltk()
    get_spacy_nlp()
    yield

app = FastAPI(
    title="ScamShield API",
    description="Backend API for AI Scam Message Detector",
    version="1.0.0",
    lifespan=lifespan
)

import os

# Configure CORS so React can consume this API
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174"
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.extend([url.strip() for url in frontend_url.split(",") if url.strip()])

is_wildcard = "*" in allowed_origins or not allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if not is_wildcard else ["*"],
    allow_credentials=not is_wildcard,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routes
app.include_router(scan.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(auth.router, prefix="/api")

@app.get("/")
def health_check():
    """
    Service health check endpoint.
    """
    return {
        "status": "healthy",
        "app": "ScamShield - AI Scam Message Detector REST API",
        "mock_db_mode": settings.USE_MOCK_DATABASE
    }
