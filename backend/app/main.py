import traceback

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import inspect, text

from app.services.ai_service import (
    generate_ai_response,
    generate_ai_response_with_fallback
)
from app.prompts import SYSTEM_PROMPT, CHARACTER_PROMPT, DIALOGUE_PROMPT, PLOT_PROMPT

from app.database import Base, engine, get_db
from sqlalchemy.orm import Session
from app import timeline_models
from app import multiverse_models
from app import character_models
from app import user_models
from app.auth_routes import router as auth_router
from app.auth import get_current_user
from app.user_models import User

app = FastAPI(
    title="Multiverse Narrative Assistant",
    description="AI-powered storytelling platform",
    version="1.0.0"
)

app.include_router(auth_router)

# Create database tables
Base.metadata.create_all(bind=engine)

def migrate_existing_tables():
    inspector = inspect(engine)

    tables = ["characters", "timeline_events", "universes"]

    for table in tables:
        if table in inspector.get_table_names():
            columns = [
                column["name"]
                for column in inspector.get_columns(table)
            ]

            if "user_id" not in columns:
                with engine.begin() as connection:
                    connection.execute(
                        text(
                            f"ALTER TABLE {table} "
                            "ADD COLUMN user_id INTEGER REFERENCES users(id)"
                        )
                    )

migrate_existing_tables()

# Frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://multiverse-narrative-frontend.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Character input model
class CharacterRequest(BaseModel):
    name: str
    age: int
    personality: str
    powers: str
    universe: str


# Dialogue input model
class DialogueRequest(BaseModel):
    dialogue: str
    emotion: str


# Plot input model
class PlotRequest(BaseModel):
    story: str


# Timeline Event Input Model
class TimelineEventCreate(BaseModel):
    title: str
    description: str = ""
    event_time: str
    character_name: str = ""
    universe: str = ""


# Multiverse Input Model
class UniverseCreate(BaseModel):
    name: str
    description: str = ""
    genre: str = ""
    power_system: str = ""


@app.get("/")
def home():
    return {
        "message": "Multiverse Narrative Assistant API is running!"
    }


@app.get("/api/health")
def health():
    return {"status": "healthy"}


# AI Character Generator
@app.post("/api/character/generate")
def generate_character(
    data: CharacterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prompt = CHARACTER_PROMPT.format(
        name=data.name,
        age=data.age,
        personality=data.personality,
        powers=data.powers,
        universe=data.universe
    )

    demo_biography = f"""
# {data.name} — Character Biography

## Background
{data.name} is a character from {data.universe}.

## Personality
{data.personality}

## Special Abilities
{data.powers}

## Character Arc
{data.name} becomes an important protector of the multiverse.
"""

    try:
        result, mode = generate_ai_response_with_fallback(
            prompt=prompt,
            fallback_response=demo_biography,
            system_instruction=SYSTEM_PROMPT
        )

        # Save character to database
        character = character_models.Character(
            user_id=current_user.id,
            name=data.name,
            age=data.age,
            personality=data.personality,
            powers=data.powers,
            universe=data.universe,
            biography=result
        )

        db.add(character)
        db.commit()
        db.refresh(character)

        return {
            "success": True,
            "message": "Character generated and saved successfully!",
            "character_id": character.id,
            "character_name": character.name,
            "generated_biography": result,
            "mode": mode
        }

    except Exception as error:
        db.rollback()
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# AI Dialogue Generator
@app.post("/api/dialogue/generate")
def generate_dialogue(
    data: DialogueRequest,
    current_user: User = Depends(get_current_user)
):

    demo_dialogue = f"""
## Original Dialogue
{data.dialogue}

## Rewritten Dialogue ({data.emotion})
The character speaks with deep {data.emotion} emotion.

"{data.dialogue}"

The delivery, expressions and tone reflect
the selected emotion: {data.emotion}.
"""

    try:
        prompt = DIALOGUE_PROMPT.format(
            dialogue=data.dialogue,
            emotion=data.emotion
        )

        result, mode = generate_ai_response_with_fallback(
            prompt=prompt,
            fallback_response=demo_dialogue,
            system_instruction=SYSTEM_PROMPT
        )

        return {
            "success": True,
            "original_dialogue": data.dialogue,
            "selected_emotion": data.emotion,
            "generated_dialogue": result,
            "mode": mode
        }

    except Exception as error:
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# AI Branching Plot Generator
@app.post("/api/plot/generate")
def generate_plot(
    data: PlotRequest,
    current_user: User = Depends(get_current_user)
):

    demo_endings = f"""
# Happy Ending
The heroes overcome every obstacle in the story.
They restore peace and begin a hopeful new chapter.

# Tragic Ending
The final battle comes at a terrible cost.
The hero sacrifices everything to save the people
they love. The world survives, but nothing is the same.

# Unexpected Twist
The apparent villain was secretly protecting
the universe from a greater danger.
The real enemy was hiding in plain sight.
"""

    try:
        prompt = PLOT_PROMPT.format(
            story=data.story
        )

        result, mode = generate_ai_response_with_fallback(
            prompt=prompt,
            fallback_response=demo_endings,
            system_instruction=SYSTEM_PROMPT
        )

        return {
            "success": True,
            "original_story": data.story,
            "generated_endings": result,
            "mode": mode
        }

    except Exception as error:
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

# Add Timeline Event
@app.post("/api/timeline/events")
def add_timeline_event(
    data: TimelineEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:
        event = timeline_models.TimelineEvent(
            user_id=current_user.id,
            title=data.title,
            description=data.description,
            event_time=data.event_time,
            character_name=data.character_name,
            universe=data.universe
        )

        db.add(event)
        db.commit()
        db.refresh(event)

        return {
            "success": True,
            "message": "Timeline event added successfully!",
            "event_id": event.id,
            "title": event.title
        }

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# Get All Timeline Events
@app.get("/api/timeline/events")
def get_timeline_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:
        events = db.query(
            timeline_models.TimelineEvent
        ).filter(
            timeline_models.TimelineEvent.user_id == current_user.id
        ).order_by(
            timeline_models.TimelineEvent.id
        ).all()

        return {
            "success": True,
            "total_events": len(events),
            "events": [
                {
                    "id": event.id,
                    "title": event.title,
                    "description": event.description,
                    "event_time": event.event_time,
                    "character_name": event.character_name,
                    "universe": event.universe
                }
                for event in events
            ]
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# Update Timeline Event
@app.put("/api/timeline/events/{event_id}")
def update_timeline_event(
    event_id: int,
    data: TimelineEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(
        timeline_models.TimelineEvent
    ).filter(
        timeline_models.TimelineEvent.id == event_id,
        timeline_models.TimelineEvent.user_id == current_user.id
    ).first()

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Timeline event not found"
        )

    event.title = data.title
    event.description = data.description
    event.event_time = data.event_time
    event.character_name = data.character_name
    event.universe = data.universe

    db.commit()
    db.refresh(event)

    return {
        "success": True,
        "message": "Timeline event updated successfully!",
        "event_id": event.id,
        "title": event.title
    }


# Delete Timeline Event API
@app.delete("/api/timeline/events/{event_id}")
def delete_timeline_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        event = db.query(
            timeline_models.TimelineEvent
        ).filter(
            timeline_models.TimelineEvent.id == event_id,
            timeline_models.TimelineEvent.user_id == current_user.id
        ).first()

        if not event:
            raise HTTPException(
                status_code=404,
                detail="Timeline event not found"
            )

        db.delete(event)
        db.commit()

        return {
            "success": True,
            "message": "Timeline event deleted successfully!",
            "event_id": event_id
        }

    except HTTPException:
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

# ==========================================
# MULTIVERSE BUILDER APIs
# ==========================================

# 1. Create Universe
@app.post("/api/universes")
def create_universe(
    data: UniverseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        existing = db.query(
            multiverse_models.Universe
        ).filter(
            multiverse_models.Universe.name == data.name,
            multiverse_models.Universe.user_id == current_user.id
        ).first()

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Universe name already exists"
            )

        universe = multiverse_models.Universe(
            user_id=current_user.id,
            name=data.name,
            description=data.description,
            genre=data.genre,
            power_system=data.power_system
        )

        db.add(universe)
        db.commit()
        db.refresh(universe)

        return {
            "success": True,
            "message": "Universe created successfully!",
            "universe": {
                "id": universe.id,
                "name": universe.name,
                "description": universe.description,
                "genre": universe.genre,
                "power_system": universe.power_system
            }
        }

    except HTTPException:
        raise
    except Exception as error:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(error))


# 2. Get All Universes
@app.get("/api/universes")
def get_universes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    universes = db.query(
        multiverse_models.Universe
    ).filter(
        multiverse_models.Universe.user_id == current_user.id
    ).order_by(
        multiverse_models.Universe.id
    ).all()

    return {
        "success": True,
        "total_universes": len(universes),
        "universes": [
            {
                "id": u.id,
                "name": u.name,
                "description": u.description,
                "genre": u.genre,
                "power_system": u.power_system
            }
            for u in universes
        ]
    }


# 3. Update Universe
@app.put("/api/universes/{universe_id}")
def update_universe(
    universe_id: int,
    data: UniverseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    universe = db.query(
        multiverse_models.Universe
    ).filter(
        multiverse_models.Universe.id == universe_id,
        multiverse_models.Universe.user_id == current_user.id
    ).first()

    if not universe:
        raise HTTPException(
            status_code=404,
            detail="Universe not found"
        )

    duplicate = db.query(
        multiverse_models.Universe
    ).filter(
        multiverse_models.Universe.name == data.name,
        multiverse_models.Universe.user_id == current_user.id,
        multiverse_models.Universe.id != universe_id
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=400,
            detail="Another universe already uses this name"
        )

    universe.name = data.name
    universe.description = data.description
    universe.genre = data.genre
    universe.power_system = data.power_system

    db.commit()
    db.refresh(universe)

    return {
        "success": True,
        "message": "Universe updated successfully!",
        "universe_id": universe.id
    }


# 4. Delete Universe
@app.delete("/api/universes/{universe_id}")
def delete_universe(
    universe_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    universe = db.query(
        multiverse_models.Universe
    ).filter(
        multiverse_models.Universe.id == universe_id,
        multiverse_models.Universe.user_id == current_user.id
    ).first()

    if not universe:
        raise HTTPException(
            status_code=404,
            detail="Universe not found"
        )

    db.delete(universe)
    db.commit()

    return {
        "success": True,
        "message": "Universe deleted successfully!",
        "universe_id": universe_id
    }


# ==========================================
# CHARACTER LIBRARY APIs
# ==========================================

# 1. Get All Characters
@app.get("/api/characters")
def get_all_characters(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    characters = db.query(
        character_models.Character
    ).filter(
        character_models.Character.user_id == current_user.id
    ).order_by(
        character_models.Character.id.desc()
    ).all()

    return {
        "success": True,
        "total_characters": len(characters),
        "characters": [
            {
                "id": c.id,
                "name": c.name,
                "age": c.age,
                "personality": c.personality,
                "powers": c.powers,
                "universe": c.universe,
                "biography": c.biography,
                "created_at": c.created_at
            }
            for c in characters
        ]
    }


# 2. Get Character By ID
@app.get("/api/characters/{character_id}")
def get_character(
    character_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    character = db.query(
        character_models.Character
    ).filter(
        character_models.Character.id == character_id,
        character_models.Character.user_id == current_user.id
    ).first()

    if not character:
        raise HTTPException(
            status_code=404,
            detail="Character not found"
        )

    return {
        "success": True,
        "character": {
            "id": character.id,
            "name": character.name,
            "age": character.age,
            "personality": character.personality,
            "powers": character.powers,
            "universe": character.universe,
            "biography": character.biography,
            "created_at": character.created_at
        }
    }


# 3. Update Character
@app.put("/api/characters/{character_id}")
def update_character(
    character_id: int,
    data: CharacterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    character = db.query(
        character_models.Character
    ).filter(
        character_models.Character.id == character_id,
        character_models.Character.user_id == current_user.id
    ).first()

    if not character:
        raise HTTPException(
            status_code=404,
            detail="Character not found"
        )

    character.name = data.name
    character.age = data.age
    character.personality = data.personality
    character.powers = data.powers
    character.universe = data.universe

    db.commit()
    db.refresh(character)

    return {
        "success": True,
        "message": "Character updated successfully!",
        "character_id": character.id,
        "character_name": character.name
    }


# Delete Character API
@app.delete("/api/characters/{character_id}")
def delete_character(
    character_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        character = db.query(
            character_models.Character
        ).filter(
            character_models.Character.id == character_id,
            character_models.Character.user_id == current_user.id
        ).first()

        if not character:
            raise HTTPException(
                status_code=404,
                detail="Character not found"
            )

        db.delete(character)
        db.commit()

        return {
            "success": True,
            "message": "Character deleted successfully!",
            "character_id": character_id
        }

    except HTTPException:
        raise

    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )