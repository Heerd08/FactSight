import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

# Search and load .env from backend folder or current working directory
backend_dir = Path(__file__).resolve().parent.parent
env_paths = [
    backend_dir / ".env",
    backend_dir.parent / ".env",
    Path(".env")
]

for env_path in env_paths:
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
        break


_raw_key = os.getenv("GEMINI_API_KEY", "").strip()
_is_real_key = bool(_raw_key and "your_actual" not in _raw_key)

class Settings(BaseModel):
    APP_NAME: str = "VeritasAI Fact-Checking Engine"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")
    PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "127.0.0.1")
    GEMINI_API_KEY: str = _raw_key if _is_real_key else ""
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini" if _is_real_key else "mock")
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]


settings = Settings()
