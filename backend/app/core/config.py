"""
Application configuration loaded from environment variables.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file if it exists
load_dotenv()

# Compute base directory (backend/)
_BASE_DIR = Path(__file__).resolve().parent.parent.parent
_LOCAL_DB_PATH = _BASE_DIR / "factsight.db"

def _get_safe_db_url() -> str:
    # Test if we can write to the local directory
    try:
        import sqlite3
        test_conn = sqlite3.connect(str(_LOCAL_DB_PATH))
        test_conn.execute("CREATE TABLE IF NOT EXISTS _test_rw (id INT)")
        test_conn.execute("DROP TABLE IF EXISTS _test_rw")
        test_conn.commit()
        test_conn.close()
        return f"sqlite:///{_LOCAL_DB_PATH.as_posix()}"
    except Exception:
        import tempfile
        safe_path = Path(tempfile.gettempdir()) / "factsight.db"
        return f"sqlite:///{safe_path.as_posix()}"

_DEFAULT_DB_URL = _get_safe_db_url()


class Settings:
    """Application settings from environment variables with sensible defaults."""

    # Model / AI Search
    MODEL_PATH: str = os.getenv("MODEL_PATH", "microsoft/deberta-v3-base")
    MODEL_VERSION: str = os.getenv("MODEL_VERSION", "rag-gemini-tavily-v2")
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Database — use safe path to avoid SQLite issues with OneDrive/virtualized folders
    DATABASE_URL: str = os.getenv("DATABASE_URL", _DEFAULT_DB_URL)

    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # Classification
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.5"))
    LABEL_MAP: list[str] = os.getenv("LABEL_MAP", "Genuine,Misleading,Fake").split(",")

    # CORS
    CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "*").split(",")

    # Paths
    BASE_DIR: Path = _BASE_DIR
    ML_MODELS_DIR: Path = _BASE_DIR.parent / "ml" / "models"


settings = Settings()
