"""
Real AI service for the Project Architect and Code Drishti features.
Uses the official google-genai SDK with Structured Outputs (Pydantic)
to ensure JSON schema compliance.
"""
import os
import json
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound

# Ensure we have the API key from Django settings (via .env)
# In a real Django app you'd import settings, but for this standalone file
# we can just read it from os.environ (which was loaded by python-dotenv in settings.py)
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')

# Initialize the Gemini client
# It automatically picks up GEMINI_API_KEY from the environment if present.
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


# ── Pydantic Schemas for Structured Output ───────────────────────────────

class BlueprintStep(BaseModel):
    step_number: int
    tag: str = Field(description="Short uppercase category tag, e.g., DATA_PREP")
    title: str
    tasks: list[str]
    estimate: str

class BlueprintResponse(BaseModel):
    steps: list[BlueprintStep]

class ReviewFinding(BaseModel):
    id: int
    severity: str = Field(description="Must be one of: CRITICAL, WARNING, INFO, STYLE")
    category: str = Field(description="Must be one of: SECURITY, PERFORMANCE, LOGIC, STYLE")
    title: str
    description: str
    suggestion: str
    line_range: str = Field(description="Affected line range, e.g., '12-15' or '42'")

class ReviewResponse(BaseModel):
    findings: list[ReviewFinding]

class QuizQuestion(BaseModel):
    question: str
    options: list[str] = Field(description="Must contain exactly 4 options.")
    correct_index: int = Field(description="Must be 0, 1, 2, or 3 representing the index of the correct option.")

class QuizResponse(BaseModel):
    questions: list[QuizQuestion]


# ── AI Service Functions ──────────────────────────────────────────────────

def generate_project_blueprint(prompt):
    """
    Generate a step-by-step project blueprint from a user prompt using Gemini.
    """
    if not client:
        raise ValueError("Missing API Key. The Project Architect cannot run.")

    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=(
                    "You are an elite software architect. Break down the user's project "
                    "idea into a logical, step-by-step development blueprint."
                ),
                response_mime_type="application/json",
                response_schema=BlueprintResponse,
                temperature=0.4,
            ),
        )
        
        # The response text is a JSON string matching BlueprintResponse
        data = json.loads(response.text)
        return data.get("steps", [])
        
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise ValueError(f"AI Generation failed: {str(e)}")


def generate_code_review(code, language="python"):
    """
    Generate a structured code review using Gemini.
    """
    if not client:
        raise ValueError("Missing API Key. The Code Reviewer cannot run.")

    try:
        prompt = f"Review the following {language} code:\n\n{code}"
        
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=(
                    "You are a strict, senior code reviewer. Analyze the provided code "
                    "for bugs, security flaws, performance issues, and style guide violations."
                ),
                response_mime_type="application/json",
                response_schema=ReviewResponse,
                temperature=0.2,
            ),
        )
        
        data = json.loads(response.text)
        return data.get("findings", [])
        
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise ValueError(f"AI Generation failed: {str(e)}")

def generate_video_quiz(video_id):
    """
    Extracts transcript from a YouTube video and generates a 3-question 
    multiple choice quiz using Gemini Structured Outputs.
    """
    if not client:
        raise ValueError("GEMINI_API_KEY is missing. Quiz generation cannot proceed.")

    # 1. Fetch Transcript
    try:
        transcript_list = YouTubeTranscriptApi().fetch(video_id)
        # Concatenate transcript texts
        raw_text = " ".join([t.text for t in transcript_list])
    except TranscriptsDisabled:
        raise ValueError("Captions are disabled for this video.")
    except NoTranscriptFound:
        raise ValueError("No transcript found for this video.")
    except Exception as e:
        raise ValueError(f"Could not extract transcript: {str(e)}")

    # 2. Prompt Gemini
    prompt = f"Create a 3-question multiple-choice quiz based on this transcript:\n\n{raw_text}"
    
    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=(
                    "You are an expert educator. Based on the provided video transcript, "
                    "create a strict 3-question multiple-choice quiz. "
                    "Each question must have exactly 4 options and 1 correct_index."
                ),
                response_mime_type="application/json",
                response_schema=QuizResponse,
                temperature=0.3,
            ),
        )
        
        data = json.loads(response.text)
        return data.get("questions", [])
        
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise ValueError(f"AI Generation failed: {str(e)}")


def ask_oracle(message: str, history: list = None) -> str:
    """
    Acts as 'The Oracle', providing context-aware AI mentorship.
    """
    if not client:
        return "The Oracle is currently disconnected (Missing API Key)."

    history = history or []
    
    # Format the conversational history
    formatted_contents = []
    for msg in history:
        # Convert roles from our frontend format to Gemini format
        role = 'model' if msg.get('role') == 'ai' else 'user'
        formatted_contents.append({
            "role": role,
            "parts": [{"text": msg.get('content', '')}]
        })
    
    # Append the new user message
    formatted_contents.append({
        "role": "user",
        "parts": [{"text": message}]
    })
    
    system_instruction = (
        "You are The Oracle, a friendly, encouraging AI study buddy for students learning tech. "
        "Speak like a supportive friend. Be enthusiastic, use simple analogies, and keep the language "
        "highly accessible for kids and teens. "
        "Keep paragraphs very short (1-2 sentences). "
        "DO NOT use markdown headers (#, ###) or horizontal rules (---). "
        "Use relevant emojis frequently to make the text colorful and engaging (e.g., 🚀, 💡, 🎮, ✨). "
        "Use emojis as bullet points if listing items."
    )

    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=formatted_contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
            ),
        )
        return response.text
    except Exception as e:
        print(f"Gemini API Error (Oracle): {e}")
        raise ValueError(f"Oracle Generation failed: {str(e)}")


