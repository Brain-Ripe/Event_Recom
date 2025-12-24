import { useEffect, useState } from "react";
import axios from "axios";

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
      .get("http://127.0.0.1:5000/admin/events")
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
      .post("http://127.0.0.1:5000/admin/events", {
        ...form,
        tag_ids: selectedTags,
      })
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
    <div>
      <h2>🛠 Admin Event Manager</h2>

      <h3>Add Event</h3>

      <input
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <input
        placeholder="Location"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
      />

      <input
        type="date"
        value={form.event_date}
        onChange={(e) => setForm({ ...form, event_date: e.target.value })}
      />

      <input
        placeholder="Google Form Registration Link"
        value={form.registration_link}
        onChange={(e) =>
          setForm({ ...form, registration_link: e.target.value })
        }
      />

      <h4 style={{ marginTop: "16px" }}>Event Tags</h4>

      {/* TAG PICKER */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        {tags.map((tag) => (
          <span
            key={tag.tag_id}
            onClick={() => toggleTag(tag.tag_id)}
            style={{
              cursor: "pointer",
              padding: "6px 14px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 500,
              background: selectedTags.includes(tag.tag_id)
                ? "#16a34a"
                : "#f1f1f1",
              color: selectedTags.includes(tag.tag_id) ? "#fff" : "#333",
              border: selectedTags.includes(tag.tag_id)
                ? "none"
                : "1px solid #ddd",
            }}
          >
            {tag.tag_name}
          </span>
        ))}
      </div>

      <button onClick={addEvent}>Add Event</button>

      <hr />

      <h3>Existing Events</h3>

      {events.map((e) => (
        <div key={e.event_id} style={{ marginBottom: "14px" }}>
          <b>{e.title}</b> ({e.event_date})
          <br />
          📍 {e.location}
          <br />
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "6px",
            }}
          >
            {e.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  background: "#eee",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          {e.registration_link && (
            <div style={{ marginTop: "6px" }}>
              <a href={e.registration_link} target="_blank">
                📝 Registration Link
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
