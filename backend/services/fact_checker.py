import wikipedia


def verify_fact(topic):
    try:
        summary = wikipedia.summary(topic, sentences=2)
        return {
            "status": "Verified",
            "summary": summary
        }

    except Exception:
        return {
            "status": "Not Found",
            "summary": "No information available."
        }