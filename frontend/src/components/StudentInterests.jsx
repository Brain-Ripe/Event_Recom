import { useEffect, useState } from "react";
import axios from "axios";

export default function StudentInterests({ studentId, onSaved }) {
  const [tags, setTags] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!studentId) return;

    axios.get("http://127.0.0.1:5000/tags").then((res) => setTags(res.data));

    axios
      .get(`http://127.0.0.1:5000/student/interests/${studentId}`)
      .then((res) => setSelected(res.data.map((t) => t.tag_id)));
  }, [studentId]);

  function toggle(tagId) {
    setSelected((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }

  function save() {
    axios
      .post(`http://127.0.0.1:5000/student/interests/${studentId}`, {
        tag_ids: selected,
      })
      .then(() => onSaved());
  }

  return (
    <div style={{ marginBottom: "28px" }}>
      <h3>🎯 Your Interests</h3>
      <p style={{ color: "#666", marginBottom: "12px" }}>
        Select topics you are interested in
      </p>

      {/* TAGS */}
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
            onClick={() => toggle(tag.tag_id)}
            style={{
              cursor: "pointer",
              padding: "6px 14px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 500,
              background: selected.includes(tag.tag_id) ? "#4f46e5" : "#f1f1f1",
              color: selected.includes(tag.tag_id) ? "#fff" : "#333",
              border: selected.includes(tag.tag_id) ? "none" : "1px solid #ddd",
              transition: "all 0.15s ease",
            }}
          >
            {tag.tag_name}
          </span>
        ))}
      </div>

      <button onClick={save}>Save Interests</button>
    </div>
  );
}
