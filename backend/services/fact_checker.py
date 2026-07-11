import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")


def verify_fact(statement: str):

    prompt = f"""
You are an AI Fact Checker.

Verify the following statement.

Statement:
"{statement}"

Return your answer ONLY in this format.

Status: Verified / Partially Verified / False

Confidence: XX

Explanation:
(Explain in 3-5 sentences.)

Source:
(Mention trusted sources like WHO, NASA, ISRO, Government websites, Wikipedia, etc.)
"""

    response = model.generate_content(prompt)

    text = response.text.strip()

    status = "Unknown"
    confidence = 50
    explanation = text
    source = "Gemini AI"

    try:
        lines = text.split("\n")

        for line in lines:

            if line.lower().startswith("status:"):
                status = line.split(":", 1)[1].strip()

            elif line.lower().startswith("confidence:"):
                confidence = int(
                    ''.join(filter(str.isdigit, line))
                )

            elif line.lower().startswith("source:"):
                source = line.split(":", 1)[1].strip()

    except Exception:
        pass

    return {
        "status": status,
        "confidence": confidence,
        "source": source,
        "summary": explanation
    }