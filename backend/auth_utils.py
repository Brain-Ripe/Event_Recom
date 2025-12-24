from functools import wraps
from flask import request, jsonify
from models import User
from clerk_backend_api import Clerk

clerk = Clerk()

def require_role(required_role):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization")

            if not auth_header:
                return {"error": "Missing auth header"}, 401

            token = auth_header.replace("Bearer ", "")

            try:
                session = clerk.verify_session(token)
                clerk_user_id = session["sub"]
            except Exception:
                return {"error": "Invalid token"}, 401

            user = User.query.filter_by(clerk_user_id=clerk_user_id).first()
            if not user or user.role != required_role:
                return {"error": "Forbidden"}, 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator
