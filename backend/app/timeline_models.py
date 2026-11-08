from sqlalchemy import Column, Integer, String, Text, ForeignKey
from app.database import Base


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    title = Column(String(200), nullable=False)

    description = Column(Text, nullable=True)

    event_time = Column(String(100), nullable=False)

    character_name = Column(String(100), nullable=True)

    universe = Column(String(100), nullable=True)