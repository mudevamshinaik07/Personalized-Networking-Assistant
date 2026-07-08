from backend.models import History


def save_history(db, event, topic, fact):
    history = History(
        event=event,
        topic=topic,
        fact=fact
    )

    db.add(history)
    db.commit()
    db.refresh(history)

    return history