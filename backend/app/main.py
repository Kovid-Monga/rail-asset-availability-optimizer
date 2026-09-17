import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import engine, Base
# Import models so Base.metadata knows about them
import app.models.request
import app.models.block

from app.routes.requests import router as requests_router
from app.routes.blocks import router as blocks_router
from app.routes.overview import router as overview_router
from app.routes.ai import router as ai_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist on startup
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as exc:
        print(f"Database initialization notice: {exc}")
        print("Please ensure PostgreSQL is running and credentials in .env are correct.")
    yield

app = FastAPI(
    title="Rail Asset & Block Schedule Central API",
    description="Backend API for Maintenance Requests, Block Schedules, and AI Decision Support",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS strictly for the active local frontend ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(requests_router)
app.include_router(blocks_router)
app.include_router(overview_router)
app.include_router(ai_router)

@app.get("/", tags=["Root"])
def root():
    return {
        "system": "Rail Asset & Block Schedule Central API",
        "status": "online"
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    uvicorn.run("app.main.app", host=host, port=port, reload=True)
