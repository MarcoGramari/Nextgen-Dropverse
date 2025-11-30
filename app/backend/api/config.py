# backend/api/config.py
import os
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
class Config:
    SECRET_KEY = os.getenv("SECRET_KEY","dev_dropverse_secret")
    JWT_SECRET = os.getenv("JWT_SECRET_KEY","jwt_dropverse_secret")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR,'dropverse.db')}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024

    # Enable/disable Claude Haiku 4.5 for all clients (can be overridden by env var)
    CLAUDE_HAIKU_45_ENABLED = os.getenv("ENABLE_CLAUDE_HAIKU", "true").lower() in ("1", "true", "yes")
    # Default LLM model identifier used by server-side logic when interacting with an LLM provider
    DEFAULT_LLM_MODEL = os.getenv("DEFAULT_LLM_MODEL", "claude-haiku-4.5")
