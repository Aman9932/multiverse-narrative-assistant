import os
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai


# Load .env from the backend folder
BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / ".env")

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY is missing in backend/.env")

# Initialize Gemini
client = genai.Client(api_key=API_KEY)

MODEL_NAME = "gemini-3.8-flash"

# Retry delays: 2, 4 and 8 seconds
RETRY_DELAYS = [2, 4, 8]


def is_temporary_error(error):
    """Check whether the error may be temporary."""

    status = (
        getattr(error, "code", None)
        or getattr(error, "status_code", None)
    )

    if status in (429, 500, 502, 503, 504):
        return True

    message = str(error).lower()

    temporary_words = [
        "503",
        "429",
        "500",
        "502",
        "504",
        "unavailable",
        "overloaded",
        "high demand",
        "deadline exceeded"
    ]

    return any(word in message for word in temporary_words)


def generate_ai_response(
    prompt: str,
    system_instruction: str = ""
) -> str:
    """Generate AI content with automatic retry."""

    for attempt in range(4):
        try:
            # Same simple API request as test_gemini.py
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt
            )

            if not response.text:
                raise RuntimeError("Gemini returned an empty response")

            print("Gemini API: SUCCESS")
            return response.text

        except Exception as error:

            print(f"Gemini attempt {attempt + 1} failed: {error}")

            if not is_temporary_error(error):
                raise

            if attempt < len(RETRY_DELAYS):
                delay = RETRY_DELAYS[attempt]
                print(f"Retrying in {delay} seconds...")
                time.sleep(delay)

    raise RuntimeError(
        "Gemini is temporarily unavailable after 4 attempts."
    )


def generate_ai_response_with_fallback(
    prompt: str,
    fallback_response: str,
    system_instruction: str = ""
):
    """Try Gemini first, then use clearly labelled demo content."""

    try:
        result = generate_ai_response(
            prompt=prompt,
            system_instruction=system_instruction
        )

        return result, "ai"

    except Exception as error:
        print(f"Using DEMO FALLBACK: {error}")

        return fallback_response, "demo"