import { useEffect, useState } from "react";
import axios from "axios";

const userId = localStorage.getItem("user_id");

const authHeaders = {
  headers: {
    "X-User-Id": userId,
  },
};

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    event_date: "",
    registration_link: "",
  });

  useEffect(() => {
    fetchEvents();
    fetchTags();
  }, []);

  function fetchEvents() {
    axios
      .get("http://127.0.0.1:5000/admin/events", authHeaders)
      .then((res) => setEvents(res.data));
  }

  function fetchTags() {
    axios.get("http://127.0.0.1:5000/tags").then((res) => setTags(res.data));
  }

  function toggleTag(tagId) {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }

  function addEvent() {
    axios
      .post(
        "http://127.0.0.1:5000/admin/events",
        {
          ...form,
          tag_ids: selectedTags,
        },
        authHeaders
      )
      .then(() => {
        fetchEvents();
        setForm({
          title: "",
          description: "",
          location: "",
          event_date: "",
          registration_link: "",
        });
        setSelectedTags([]);
      });
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* ================= HEADER ================= */}
      <h2 style={{ marginBottom: "24px" }}> Admin Event Manager</h2>

      {/* ================= ADD EVENT CARD ================= */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: "14px",
          padding: "24px",
          border: "1px solid rgba(255,255,255,0.12)",
          marginBottom: "36px",
        }}
      >
        <h3 style={{ marginBottom: "16px" }}>➕ Add New Event</h3>

        {/* FORM FIELDS */}
        <div style={{ display: "grid", gap: "12px" }}>
          <input
            placeholder="Event Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={inputStyle}
          />
          <textarea
            placeholder="Event Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            style={inputStyle}
          />

          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            style={inputStyle}
          />

          <input
            type="date"
            value={form.event_date}
            onChange={(e) => setForm({ ...form, event_date: e.target.value })}
            style={inputStyle}
          />

          <input
            placeholder="Google Form Registration Link"
            value={form.registration_link}
            onChange={(e) =>
              setForm({ ...form, registration_link: e.target.value })
            }
            style={inputStyle}
          />
        </div>

        {/* TAG PICKER */}
        <h4 style={{ marginTop: "20px", marginBottom: "10px" }}>
          🏷 Event Tags
        </h4>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          {tags.map((tag) => {
            const active = selectedTags.includes(tag.tag_id);
            return (
              <span
                key={tag.tag_id}
                onClick={() => toggleTag(tag.tag_id)}
                style={{
                  cursor: "pointer",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 500,
                  background: active ? "#4f46e5" : "rgba(255,255,255,0.08)",
                  color: active ? "#fff" : "#e5e7eb",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                {tag.tag_name}
              </span>
            );
          })}
        </div>

        {/* ADD BUTTON */}
        <button
          onClick={addEvent}
          style={{
            padding: "12px 22px",
            borderRadius: "10px",
            background: "#4f46e5",
            color: "white",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Create Event
        </button>
      </div>

      {/* ================= EVENTS LIST ================= */}
      <h3 style={{ marginBottom: "16px" }}> Existing Events</h3>

      {events.map((e) => (
        <div
          key={e.event_id}
          style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: "12px",
            padding: "18px",
            border: "1px solid rgba(255,255,255,0.12)",
            marginBottom: "16px",
          }}
        >
          <h4 style={{ marginBottom: "6px" }}>{e.title}</h4>

          <div style={{ fontSize: "14px", color: "#cbd5f5" }}>
            Location: {e.location || "TBA"} <br />
            📅 {e.event_date}
          </div>

          {/* TAGS */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "10px",
            }}
          >
            {e.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  background: "rgba(255,255,255,0.1)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* REGISTRATION LINK */}
          {e.registration_link && (
            <div style={{ marginTop: "10px" }}>
              <a
                href={e.registration_link}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#a5b4fc",
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                📝 Registration Link →
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ================= SHARED INPUT STYLE ================= */
const inputStyle = {
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(0,0,0,0.3)",
  color: "#f8fafc",
};
