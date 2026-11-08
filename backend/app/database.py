from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Database file location
BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_URL = f"sqlite:///{(BASE_DIR / 'story.db').as_posix()}"

# Create database engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Create database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for database models
Base = declarative_base()


# Database connection dependency
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()