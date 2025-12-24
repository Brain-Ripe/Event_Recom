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
    <div>
      {/* HEADER */}
      <p style={{ color: "#94a3b8", marginBottom: "14px", fontSize: "14px" }}>
        Select topics you are interested in. This helps us personalize your
        recommendations.
      </p>

      {/* TAGS */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "18px",
        }}
      >
        {tags.map((tag) => {
          const active = selected.includes(tag.tag_id);
          return (
            <span
              key={tag.tag_id}
              onClick={() => toggle(tag.tag_id)}
              style={{
                cursor: "pointer",
                padding: "6px 16px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 600,

                background: active
                  ? "rgba(79,70,229,0.25)"
                  : "rgba(255,255,255,0.08)",

                color: active ? "#c7d2fe" : "#e5e7eb",

                border: active
                  ? "1px solid rgba(79,70,229,0.45)"
                  : "1px solid rgba(255,255,255,0.18)",

                backdropFilter: "blur(8px)",
                transition: "all 0.15s ease",
              }}
            >
              {tag.tag_name}
            </span>
          );
        })}
      </div>

      {/* SAVE BUTTON */}
      <button onClick={save} style={glassButtonStyle}>
        💾 Save Interests
      </button>
    </div>
  );
}

/* ================= STYLES ================= */

const glassButtonStyle = {
  padding: "10px 22px",
  borderRadius: "12px",
  background: "rgba(79,70,229,0.18)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(79,70,229,0.45)",
  color: "#c7d2fe",
  fontWeight: 600,
  cursor: "pointer",
};
