import numpy as np

class EventRecommender:
    def __init__(self, vectorizer):
        self.vectorizer = vectorizer

    def cosine_similarity(self, a, b):
        if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
            return 0.0
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

    def recommend(self, student_tag_ids, events):
        student_vec = self.vectorizer.vectorize(student_tag_ids)

        scored = []
        for event in events:
            event_vec = self.vectorizer.vectorize(event["tag_ids"])
            score = self.cosine_similarity(student_vec, event_vec)

            scored.append({
                "event_id": event["event_id"],
                "title": event["title"],
                "score": score
            })

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored
