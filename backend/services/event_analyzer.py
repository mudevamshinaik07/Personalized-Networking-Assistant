import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")


def analyze_event(event_name: str):

    prompt = f"""
Analyze this networking event:

{event_name}

Return ONLY valid JSON in this format:

{{
    "summary":"...",
    "talking_points":[
        "...",
        "...",
        "...",
        "...",
        "..."
    ],
    "networking_tips":[
        "...",
        "...",
        "...",
        "...",
        "..."
    ],
    "confidence_score":95
}}
"""

    response = model.generate_content(prompt)

    text = response.text.strip()

    # Remove markdown if Gemini returns ```json
    text = text.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(text)

    except json.JSONDecodeError:
        return {
            "summary": text,
            "talking_points": [],
            "networking_tips": [],
            "confidence_score": 80
        }