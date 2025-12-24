from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# ================= DEPARTMENT =================
class Department(db.Model):
    __tablename__ = "department"

    department_id = db.Column(db.Integer, primary_key=True)
    department_name = db.Column(db.String(100), nullable=False)
    head_email = db.Column(db.String(150))


# ================= STUDENT =================
class Student(db.Model):
    __tablename__ = "student"

    student_id = db.Column(db.Integer, primary_key=True)
    fname = db.Column(db.String(50))
    mname = db.Column(db.String(50))
    lname = db.Column(db.String(50))
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    department_id = db.Column(
        db.Integer,
        db.ForeignKey("department.department_id", ondelete="SET NULL")
    )


# ================= TAG =================
class Tag(db.Model):
    __tablename__ = "tag"

    tag_id = db.Column(db.Integer, primary_key=True)
    tag_name = db.Column(db.String(50), unique=True, nullable=False)


# ================= CLUB =================
class Club(db.Model):
    __tablename__ = "clubs"

    club_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)


# ================= EVENT =================
class Event(db.Model):
    __tablename__ = "event"

    event_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    location = db.Column(db.String(150))
    event_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    organizer_type = db.Column(db.String(50))


# ================= STUDENT_INTERESTS =================
class StudentInterest(db.Model):
    __tablename__ = "student_interests"

    student_id = db.Column(
        db.Integer,
        db.ForeignKey("student.student_id", ondelete="CASCADE"),
        primary_key=True
    )
    tag_id = db.Column(
        db.Integer,
        db.ForeignKey("tag.tag_id", ondelete="CASCADE"),
        primary_key=True
    )


# ================= STUDENT_CLUBS =================
class StudentClub(db.Model):
    __tablename__ = "student_clubs"

    student_id = db.Column(
        db.Integer,
        db.ForeignKey("student.student_id", ondelete="CASCADE"),
        primary_key=True
    )
    club_id = db.Column(
        db.Integer,
        db.ForeignKey("clubs.club_id", ondelete="CASCADE"),
        primary_key=True
    )


# ================= EVENT_TAGS =================
class EventTag(db.Model):
    __tablename__ = "event_tags"

    event_id = db.Column(
        db.Integer,
        db.ForeignKey("event.event_id", ondelete="CASCADE"),
        primary_key=True
    )
    tag_id = db.Column(
        db.Integer,
        db.ForeignKey("tag.tag_id", ondelete="CASCADE"),
        primary_key=True
    )


# ================= RSVPS =================
class RSVP(db.Model):
    __tablename__ = "rsvps"

    student_id = db.Column(
        db.Integer,
        db.ForeignKey("student.student_id", ondelete="CASCADE"),
        primary_key=True
    )
    event_id = db.Column(
        db.Integer,
        db.ForeignKey("event.event_id", ondelete="CASCADE"),
        primary_key=True
    )
    rsvp_status = db.Column(
        db.Enum("YES", "NO", "MAYBE"),
        default="YES"
    )
    rsvp_time = db.Column(db.DateTime, default=datetime.utcnow)
