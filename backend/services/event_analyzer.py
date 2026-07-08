import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")


def analyze_event(event_name: str):
    prompt = f"""
    Analyze the networking event: {event_name}

    Provide:
    1. Event overview
    2. Networking opportunities
    3. Conversation starters
    4. Skills to discuss
    5. Tips for making connections
    """

    response = model.generate_content(prompt)

    return response.text