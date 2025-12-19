from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Railway Fleet Command"
    VERSION: str = "0.0.1"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        case_sensitive = True

settings = Settings()

from contextlib import asynccontextmanager
from app import database, api
from app.models import Base as ModelsBase
from app.models_realtime import Base as RealtimeBase

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load DB (Create tables for MVP simplicity)
    async with database.engine.begin() as conn:
        await conn.run_sync(ModelsBase.metadata.create_all)
        await conn.run_sync(RealtimeBase.metadata.create_all)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

from app.routers import realtime

app.include_router(api.router, prefix=settings.API_V1_STR)
app.include_router(realtime.router, prefix="/api/realtime")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME, "version": settings.VERSION}

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}
