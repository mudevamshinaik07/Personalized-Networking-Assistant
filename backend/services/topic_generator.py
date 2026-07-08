import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")


def generate_topics(event_name: str):
    prompt = f"""
    Generate 5 networking conversation topics for the event:
    {event_name}

    Return only the topics as a numbered list.
    """

    response = model.generate_content(prompt)

    return response.text