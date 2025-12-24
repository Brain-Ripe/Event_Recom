import { useEffect, useState } from "react";
import axios from "axios";
import StudentInterests from "../components/StudentInterests";

export default function StudentDashboard() {
  const [events, setEvents] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  const studentId = localStorage.getItem("student_id");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:5000/events")
      .then((res) => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetchRecommendations();
  }, [studentId]);

  function fetchRecommendations() {
    if (!studentId) return;

    axios
      .get(`http://127.0.0.1:5000/ai/recommend/${studentId}`)
      .then((res) => setRecommended(res.data));
  }

  if (loading) return <p>Loading events...</p>;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "24px" }}>🎓 Student Dashboard</h2>

      {/* INTERESTS */}
      <div style={cardStyle}>
        <h3 style={{ marginBottom: "12px" }}>🎯 Your Interests</h3>
        <StudentInterests
          studentId={studentId}
          onSaved={fetchRecommendations}
        />
      </div>

      {/* RECOMMENDED */}
      {recommended.length > 0 && (
        <div style={{ ...cardStyle, marginTop: "32px" }}>
          <h3 style={{ marginBottom: "12px" }}>🔮 Recommended for You</h3>

          {recommended.map((rec) => (
            <div key={rec.event_id} style={innerCardStyle}>
              <b>{rec.title}</b>
            </div>
          ))}
        </div>
      )}

      {/* ALL EVENTS */}
      <h3 style={{ margin: "36px 0 16px" }}>📅 All Events</h3>

      {events.map((event) => (
        <div key={event.event_id} style={cardStyle}>
          <h4 style={{ marginBottom: "6px" }}>{event.title}</h4>

          <div style={{ fontSize: "14px", color: "#cbd5f5" }}>
            📍 {event.location || "TBA"} <br />
            📅 {event.event_date}
          </div>

          {/* TAGS */}
          <div style={tagContainerStyle}>
            {event.tags.map((tag) => (
              <span key={tag} style={tagStyle}>
                {tag}
              </span>
            ))}
          </div>

          {/* GLASS REGISTER BUTTON */}
          {event.registration_link && (
            <a
              href={event.registration_link}
              target="_blank"
              rel="noopener noreferrer"
              style={glassButtonStyle}
            >
              📝 Register
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

/* ================= STYLES ================= */

const cardStyle = {
  background: "rgba(255,255,255,0.04)",
  borderRadius: "14px",
  padding: "22px",
  border: "1px solid rgba(255,255,255,0.12)",
  marginBottom: "16px",
};

const innerCardStyle = {
  background: "rgba(255,255,255,0.06)",
  borderRadius: "10px",
  padding: "12px",
  marginBottom: "10px",
};

const tagContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  marginTop: "10px",
};

const tagStyle = {
  padding: "4px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#e5e7eb",
  fontWeight: 500,
};

/* 🔮 GLASS BUTTON */
const glassButtonStyle = {
  display: "inline-block",
  marginTop: "14px",
  padding: "10px 20px",
  borderRadius: "12px",
  background: "rgba(79,70,229,0.15)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(79,70,229,0.4)",
  color: "#c7d2fe",
  fontWeight: 600,
  textDecoration: "none",
  cursor: "pointer",
};
