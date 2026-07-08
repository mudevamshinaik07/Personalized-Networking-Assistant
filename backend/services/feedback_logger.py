from backend.models import Feedback


def save_feedback(db, event, feedback):
    new_feedback = Feedback(
        event=event,
        feedback=feedback
    )

    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)

    return new_feedback