import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import engine, Base
from app.routes.requests import router as requests_router

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
    title="BDMS Department Portal API",
    description="Backend API for TMS, TDMS, and SMMS Maintenance Request Management",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(requests_router)

@app.get("/", tags=["Root"])
def root():
    return {
        "system": "BDMS Department Portal API",
        "departments": ["TMS", "TDMS", "SMMS"],
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
