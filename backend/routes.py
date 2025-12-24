from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text
from functools import wraps
from models import (
    db, Student, Event, Tag, Club,
    StudentInterest, StudentClub, EventTag, RSVP
)
from ai.vectorizer import TagVectorizer
from ai.recommender import EventRecommender

api = Blueprint("api", __name__)



@api.route("/")
def home():
    return {"status": "Backend running"}

#==========================================
# ADMIN BLOCKING
#==========================================

def admin_only(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        role = request.headers.get("X-Role")
        if role != "ADMIN":
            return {"error": "Unauthorized"}, 403
        return f(*args, **kwargs)
    return wrapper



#==========================================
# role check
#==========================================
def require_role(required_role):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user_id = request.headers.get("X-User-Id")

            if not user_id:
                return jsonify({"error": "Unauthorized"}), 401

            user = db.session.execute(
                text("SELECT role FROM users WHERE user_id = :uid"),
                {"uid": user_id}
            ).fetchone()

            if not user or user.role != required_role:
                return jsonify({"error": "Forbidden"}), 403

            return f(*args, **kwargs)
        return wrapper
    return decorator



# =====================================================
# STUDENTS
# =====================================================

# GET all students
@api.route("/students", methods=["GET"])
def get_students():
    students = Student.query.all()
    return jsonify([
        {
            "student_id": s.student_id,
            "name": f"{s.fname} {s.lname}",
            "email": s.email,
            "department_id": s.department_id
        }
        for s in students
    ])


# CREATE student
@api.route("/students", methods=["POST"])
def create_or_update_student():
    data = request.json

    if "email" not in data:
        return {"error": "Email is required"}, 400

    try:
        # 1️⃣ Check if student already exists
        student = Student.query.filter_by(email=data["email"]).first()

        if student:
            # 2️⃣ UPDATE existing student
            student.fname = data.get("fname", student.fname)
            student.mname = data.get("mname", student.mname)
            student.lname = data.get("lname", student.lname)
            student.password_hash = data.get("password_hash", student.password_hash)
            student.department_id = data.get("department_id", student.department_id)

            db.session.commit()
            return {"message": "Student updated"}, 200

        else:
            # 3️⃣ CREATE new student
            student = Student(
                fname=data.get("fname"),
                mname=data.get("mname"),
                lname=data.get("lname"),
                email=data["email"],
                password_hash=data["password_hash"],
                department_id=data.get("department_id")
            )
            db.session.add(student)
            db.session.commit()
            return {"message": "Student created"}, 201

    except IntegrityError as e:
        db.session.rollback()
        return {"error": "Database integrity error"}, 400

    except Exception as e:
        db.session.rollback()
        return {"error": str(e)}, 500


# =====================================================
# EVENTS
# =====================================================

# GET all events
@api.route("/events", methods=["GET"])
def get_events():
    result = db.session.execute(text("""
        SELECT
            e.event_id,
            e.title,
            e.location,
            e.event_date,
            GROUP_CONCAT(t.tag_name ORDER BY t.tag_name) AS tags
        FROM event e
        LEFT JOIN event_tags et ON e.event_id = et.event_id
        LEFT JOIN tag t ON et.tag_id = t.tag_id
        GROUP BY e.event_id
        ORDER BY e.event_date
    """))

    events = []
    for row in result:
        events.append({
            "event_id": row.event_id,
            "title": row.title,
            "location": row.location,
            "event_date": str(row.event_date),
            "tags": row.tags.split(",") if row.tags else []
        })

    return jsonify(events)



# CREATE event
@api.route("/events", methods=["POST"])
def create_event():
    data = request.json
    event = Event(
        title=data["title"],
        description=data.get("description"),
        location=data.get("location"),
        event_date=data.get("event_date"),
        organizer_type=data.get("organizer_type")
    )
    db.session.add(event)
    db.session.commit()
    return {"message": "Event created"}, 201


# =====================================================
# TAGS & MAPPINGS
# =====================================================

# GET tags
@api.route("/tags", methods=["GET"])
def get_tags():
    rows = db.session.execute(
        text("SELECT tag_id, tag_name FROM tag ORDER BY tag_name")
    ).fetchall()

    return jsonify([
        {
            "tag_id": r.tag_id,
            "tag_name": r.tag_name
        }
        for r in rows
    ])


# Add interest to student
@api.route("/students/<int:student_id>/interests", methods=["POST"])
def add_student_interest(student_id):
    data = request.json
    try:
        si = StudentInterest(
            student_id=student_id,
            tag_id=data["tag_id"]
        )
        db.session.add(si)
        db.session.commit()
        return {"message": "Interest added"}, 201
    except IntegrityError:
        db.session.rollback()
        return {"error": "Duplicate or invalid mapping"}, 400


# Tag an event
@api.route("/events/<int:event_id>/tags", methods=["POST"])
def add_event_tag(event_id):
    data = request.json
    try:
        et = EventTag(
            event_id=event_id,
            tag_id=data["tag_id"]
        )
        db.session.add(et)
        db.session.commit()
        return {"message": "Tag added to event"}, 201
    except IntegrityError:
        db.session.rollback()
        return {"error": "Duplicate or invalid mapping"}, 400


# =====================================================
# RSVP
# =====================================================

@api.route("/rsvp", methods=["POST"])
def rsvp_event():
    data = request.json

    student = Student.query.get(data["student_id"])
    event = Event.query.get(data["event_id"])

    if not student or not event:
        return {"error": "Invalid student or event"}, 400

    try:
        rsvp = RSVP(
            student_id=data["student_id"],
            event_id=data["event_id"],
            rsvp_status=data.get("status", "YES")
        )
        db.session.add(rsvp)
        db.session.commit()
        return {"message": "RSVP successful"}, 201
    except IntegrityError:
        db.session.rollback()
        return {"error": "Duplicate RSVP"}, 400

@api.route("/events/<int:event_id>/rsvps")
def get_event_rsvps(event_id):    #EVENT RSVPS
    rsvps = db.session.execute(text("""
        SELECT s.student_id, s.fname, s.lname, r.rsvp_status, r.rsvp_time
        FROM rsvps r
        JOIN student s ON r.student_id = s.student_id
        WHERE r.event_id = :eid
    """), {"eid": event_id})

    return jsonify([dict(row._mapping) for row in rsvps])

@api.route("/students/<int:student_id>/rsvps")
def get_student_rsvps(student_id):
    query = text("""
        SELECT
            e.event_id,
            e.title,
            e.location,
            e.event_date,
            r.rsvp_status,
            r.rsvp_time
        FROM rsvps r
        JOIN event e ON r.event_id = e.event_id
        WHERE r.student_id = :sid
        ORDER BY e.event_date ASC
    """)

    result = db.session.execute(query, {"sid": student_id})
    return jsonify([dict(row._mapping) for row in result])




# =====================================================
# RECOMMENDATION ENGINE (SQL-BASED)
# =====================================================

@api.route("/recommendations/<int:student_id>")
def recommend_events(student_id):
    query = text("""
        SELECT
            e.event_id,
            e.title,
            e.location,
            e.event_date,
            COUNT(et.tag_id) AS tag_match_score,
            COUNT(r.student_id) AS popularity_score,
            DATEDIFF(e.event_date, CURDATE()) AS days_until_event
        FROM event e
        JOIN event_tags et ON e.event_id = et.event_id
        JOIN student_interests si ON et.tag_id = si.tag_id
        LEFT JOIN rsvps r ON e.event_id = r.event_id
        WHERE si.student_id = :sid
        GROUP BY e.event_id
    """)
    
    result = db.session.execute(query, {"sid": student_id})
    return jsonify([dict(row._mapping) for row in result])



# =====================================================
# UPCOMING EVENTS
# =====================================================

@api.route("/students/<int:student_id>/upcoming-events")
def upcoming_events(student_id):
    query = text("""
        SELECT
            e.event_id,
            e.title,
            e.location,
            e.event_date
        FROM rsvps r
        JOIN event e ON r.event_id = e.event_id
        WHERE r.student_id = :sid
          AND r.rsvp_status = 'YES'
          AND e.event_date >= CURDATE()
        ORDER BY e.event_date ASC
    """)

    result = db.session.execute(query, {"sid": student_id})
    return jsonify([dict(row._mapping) for row in result])


@api.route("/events/upcoming")
def all_upcoming_events():
    query = text("""
        SELECT event_id, title, event_date, location
        FROM event
        WHERE event_date >= CURDATE()
        ORDER BY event_date ASC
    """)
    result = db.session.execute(query)
    return jsonify([dict(row._mapping) for row in result])



# =====================================================
# MOST ACTIVE DEPTS
# =====================================================

@api.route("/analytics/most-active-department")
def most_active_department():
    query = text("""
        SELECT
            d.department_name,
            COUNT(r.student_id) AS participation_count
        FROM rsvps r
        JOIN student s ON r.student_id = s.student_id
        JOIN department d ON s.department_id = d.department_id
        GROUP BY d.department_id
        ORDER BY participation_count DESC
    """)

    result = db.session.execute(query)
    return jsonify([
        {
            "department": row.department_name,
            "participation_count": row.participation_count
        }
        for row in result
    ])


# =====================================================
# Ai Recommendation
# =====================================================

@api.route("/ai/recommend/<int:student_id>", methods=["GET"])
def ai_recommend(student_id):
    # 1️⃣ All tag IDs (global vector space)
    all_tag_ids = [t.tag_id for t in Tag.query.all()]

    # 2️⃣ Student interest tags
    student_tag_rows = db.session.execute(
        text("""
            SELECT tag_id
            FROM student_interests
            WHERE student_id = :sid
        """),
        {"sid": student_id}
    ).fetchall()

    student_tag_ids = [row.tag_id for row in student_tag_rows]

    # 🔥 COLD START (NO INTERESTS)
    if not student_tag_ids:
        rows = db.session.execute(
            text("""
                SELECT e.event_id, e.title
                FROM event e
                ORDER BY e.created_at DESC
                LIMIT 5
            """)
        ).fetchall()

        return jsonify([
            {
                "event_id": r.event_id,
                "title": r.title,
                "score": None   # 👈 IMPORTANT FLAG
            }
            for r in rows
        ])

    # 3️⃣ Events with their tag IDs
    event_rows = db.session.execute(text("""
        SELECT
            e.event_id,
            e.title,
            GROUP_CONCAT(et.tag_id) AS tag_ids
        FROM event e
        JOIN event_tags et ON e.event_id = et.event_id
        GROUP BY e.event_id
    """)).fetchall()

    events = []
    for row in event_rows:
        events.append({
            "event_id": row.event_id,
            "title": row.title,
            "tag_ids": list(map(int, row.tag_ids.split(",")))
        })

    # 4️⃣ AI pipeline
    vectorizer = TagVectorizer(all_tag_ids)
    recommender = EventRecommender(vectorizer)

    recommendations = recommender.recommend(student_tag_ids, events)

    # 5️⃣ Remove zero-score events
    recommendations = [r for r in recommendations if r["score"] > 0]

    return jsonify(recommendations)


# =====================================================
# Auth Syncing
# =====================================================
@api.route("/auth/sync", methods=["POST"])
@api.route("/auth/sync", methods=["POST"])
def auth_sync():
    try:
        data = request.json
        clerk_user_id = data.get("clerk_user_id")
        email = data.get("email")

        if not clerk_user_id or not email:
            return jsonify({"error": "Missing clerk_user_id or email"}), 400

        # 1️⃣ Find or create USER
        user = db.session.execute(
            text("SELECT * FROM users WHERE clerk_user_id = :cid"),
            {"cid": clerk_user_id}
        ).fetchone()

        if not user:
            role = "ADMIN" if email == "admin@rvce.edu.in" else "STUDENT"

            db.session.execute(
                text("""
                    INSERT INTO users (email, role, clerk_user_id)
                    VALUES (:email, :role, :cid)
                """),
                {"email": email, "role": role, "cid": clerk_user_id}
            )
            db.session.commit()

            user = db.session.execute(
                text("SELECT * FROM users WHERE clerk_user_id = :cid"),
                {"cid": clerk_user_id}
            ).fetchone()

        # 2️⃣ STUDENT HANDLING (only if role = STUDENT)
        student_id = None

        if user.role == "STUDENT":
            # Check if student already linked
            student = db.session.execute(
                text("SELECT student_id FROM student WHERE user_id = :uid"),
                {"uid": user.user_id}
            ).fetchone()

            if not student:
                # Try linking by email (existing student data)
                existing = db.session.execute(
                    text("SELECT student_id FROM student WHERE email = :email"),
                    {"email": email}
                ).fetchone()

                if existing:
                    db.session.execute(
                        text("""
                            UPDATE student
                            SET user_id = :uid
                            WHERE student_id = :sid
                        """),
                        {"uid": user.user_id, "sid": existing.student_id}
                    )
                    student_id = existing.student_id
                else:
                    # Create new student profile
                    db.session.execute(
                        text("""
                            INSERT INTO student (email, password_hash, user_id)
                            VALUES (:email, 'CLERK_AUTH', :uid)
                        """),
                        {"email": email, "uid": user.user_id}
                    )

                    student = db.session.execute(
                        text("""
                            SELECT student_id FROM student
                            WHERE user_id = :uid
                        """),
                        {"uid": user.user_id}
                    ).fetchone()

                    student_id = student.student_id

                db.session.commit()
            else:
                student_id = student.student_id

        # 3️⃣ Return EVERYTHING frontend needs
        return jsonify({
            "user_id": user.user_id,
            "role": user.role,
            "student_id": student_id
        }), 200

    except Exception as e:
        db.session.rollback()
        print("🔥 AUTH SYNC ERROR:", e)
        return jsonify({"error": "Internal Server Error"}), 500

@api.route("/admin/events", methods=["POST"])
@require_role("ADMIN")
def admin_create_event():
    data = request.json

    title = data.get("title")
    description = data.get("description")
    location = data.get("location")
    event_date = data.get("event_date")
    tag_ids = data.get("tag_ids", [])
    registration_link = data.get("registration_link")

    if not title:
        return {"error": "Title is required"}, 400

    # 1️⃣ Insert event
    result = db.session.execute(
        text("""
            INSERT INTO event (title, description, location, event_date, organizer_type, registration_link)
            VALUES (:title, :desc, :loc, :date, 'ADMIN', :link)
        """),
        {
            "title": title,
            "desc": description,
            "loc": location,
            "date": event_date,
            "link": registration_link
        }
    )

    event_id = result.lastrowid

    # 2️⃣ Insert tags
    for tag_id in tag_ids:
        db.session.execute(
            text("""
                INSERT INTO event_tags (event_id, tag_id)
                VALUES (:eid, :tid)
            """),
            {"eid": event_id, "tid": tag_id}
        )

    db.session.commit()
    return {"message": "Event created"}, 201


@api.route("/admin/events", methods=["GET"])
@require_role("ADMIN")
def admin_get_events():
    rows = db.session.execute(
        text("""
            SELECT 
                e.event_id,
                e.title,
                e.event_date,
                e.location,
                e.registration_link,
                GROUP_CONCAT(t.tag_name) AS tags
            FROM event e
            LEFT JOIN event_tags et ON e.event_id = et.event_id
            LEFT JOIN tag t ON et.tag_id = t.tag_id
            GROUP BY e.event_id
            ORDER BY e.created_at DESC
        """)
    ).fetchall()

    return jsonify([
        {
            "event_id": r.event_id,
            "title": r.title,
            "event_date": r.event_date,
            "location": r.location,
            "registration_link": r.registration_link,
            "tags": r.tags.split(",") if r.tags else []
        }
        for r in rows
    ])

@api.route("/admin/events/<int:event_id>", methods=["PUT"])
@require_role("ADMIN")
def admin_update_event(event_id):
    data = request.json

    db.session.execute(text("""
        UPDATE event
        SET title=:title,
            description=:desc,
            location=:loc,
            event_date=:date
        WHERE event_id=:eid
    """), {
        "eid": event_id,
        "title": data["title"],
        "desc": data.get("description"),
        "loc": data.get("location"),
        "date": data.get("event_date")
    })

    db.session.commit()
    return {"message": "Event updated"}


@api.route("/admin/events/<int:event_id>", methods=["DELETE"])
@require_role("ADMIN")
def admin_delete_event(event_id):
    db.session.execute(
        text("DELETE FROM event WHERE event_id = :eid"),
        {"eid": event_id}
    )
    db.session.commit()
    return {"message": "Event deleted"}


def get_student_id_for_user(user_id):
    row = db.session.execute(
        text("SELECT student_id FROM student WHERE user_id = :uid"),
        {"uid": user_id}
    ).fetchone()
    return row.student_id if row else None


def cold_start_recommendations(limit=5):
    rows = db.session.execute(
        text("""
            SELECT e.event_id, e.title
            FROM event e
            ORDER BY e.created_at DESC
            LIMIT :limit
        """),
        {"limit": limit}
    ).fetchall()

    return jsonify([
        {
            "event_id": r.event_id,
            "title": r.title,
            "score": None
        }
        for r in rows
    ])
