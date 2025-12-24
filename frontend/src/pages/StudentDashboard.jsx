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
    <div>
      <h2>🎓 Student Dashboard</h2>

      {/* INTERESTS */}
      <StudentInterests studentId={studentId} onSaved={fetchRecommendations} />

      {/* RECOMMENDATIONS */}
      {recommended.length > 0 && (
        <>
          <h3>🔮 Recommended for You</h3>

          {recommended.some((r) => r.score === null) && (
            <p style={{ color: "#666" }}>
              Select interests to get better recommendations 👆
            </p>
          )}

          {recommended.map((rec) => (
            <div
              key={rec.event_id}
              style={{
                border: "1px solid #c7d2fe",
                background: "#f9fbff",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            >
              <b>{rec.title}</b>
            </div>
          ))}

          <hr />
        </>
      )}

      {/* ALL EVENTS */}
      <h3>📅 All Events</h3>

      {events.map((event) => (
        <div
          key={event.event_id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "14px",
          }}
        >
          <h3>{event.title}</h3>

          <p>
            📍 {event.location || "TBA"} <br />
            📅 {event.event_date}
          </p>

          {/* TAGS */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            {event.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  background: "#eef2ff",
                  color: "#3730a3",
                  border: "1px solid #c7d2fe",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* REGISTER LINK */}
          {event.registration_link && (
            <div style={{ marginTop: "10px" }}>
              <a
                href={event.registration_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                📝 Register Here
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
