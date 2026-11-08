from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class Universe(Base):
    __tablename__ = "universes"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(200), nullable=False, unique=True)

    description = Column(Text, nullable=True)

    genre = Column(String(100), nullable=True)

    power_system = Column(Text, nullable=True)