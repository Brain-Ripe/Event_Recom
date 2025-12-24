import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
} from "@clerk/clerk-react";

import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useEffect, useState } from "react";

import TopBar from "./components/TopBar";

import DarkVeil from "./ui/DarkVeil";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";

/* ================= AUTH SYNC ================= */
function AuthSync({ setRole }) {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    axios
      .post("http://127.0.0.1:5000/auth/sync", {
        clerk_user_id: user.id,
        email: user.primaryEmailAddress.emailAddress,
      })
      .then((res) => {
        setRole(res.data.role);

        localStorage.setItem("role", res.data.role);
        localStorage.setItem("user_id", res.data.user_id);

        if (res.data.student_id) {
          localStorage.setItem("student_id", res.data.student_id);
        }
      })
      .catch((err) => console.error("Auth sync failed", err));
  }, [isLoaded, user]);

  return null;
}

/* ================= MAIN APP ================= */
function App() {
  const [role, setRole] = useState(localStorage.getItem("role"));

  return (
    <>
      {/* 🌌 FULL-SCREEN BACKGROUND */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
        }}
      >
        <DarkVeil />
      </div>

      {/* 🧱 APP CONTENT */}
      <div
        style={{
          minHeight: "100vh",
          padding: "40px",
          fontFamily: "Inter, system-ui, sans-serif",
          color: "#f8fafc",
        }}
      >
        <AuthSync setRole={setRole} />

        <SignedOut>
          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto",
              paddingTop: "80px",
              textAlign: "center",
            }}
          >
            {/* 🏫 TITLE */}
            <h1
              style={{
                fontSize: "48px",
                fontWeight: 700,
                marginBottom: "16px",
                letterSpacing: "-0.02em",
              }}
            >
              Campus Event Discovery
            </h1>

            {/* 📝 SUBTITLE */}
            <p
              style={{
                fontSize: "18px",
                color: "#cbd5f5",
                maxWidth: "700px",
                margin: "0 auto 36px",
                lineHeight: 1.6,
              }}
            >
              Discover campus events tailored to your interests.
              <br />
              Powered by smart recommendations and real student activity.
            </p>

            {/* 🔘 BUTTONS */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              {/* Primary CTA */}
              <SignInButton mode="modal">
                <button
                  style={{
                    padding: "14px 28px",
                    fontSize: "16px",
                    borderRadius: "10px",
                    background: "#4f46e5",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Get Started
                </button>
              </SignInButton>

              {/* Secondary CTA */}
              <button
                style={{
                  padding: "14px 28px",
                  fontSize: "16px",
                  borderRadius: "10px",
                  background: "transparent",
                  color: "#e5e7eb",
                  border: "1px solid #e5e7eb",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Learn More
              </button>
            </div>

            {/* ✨ FEATURE HIGHLIGHTS */}
            <div
              id="features"
              style={{
                marginTop: "80px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "24px",
                textAlign: "left",
              }}
            >
              {[
                {
                  title: "🎯 Personalized",
                  desc: "Events recommended based on your interests.",
                },
                {
                  title: "🧠 Smart AI",
                  desc: "Uses tag-based similarity to surface relevant events.",
                },
                {
                  title: "📅 All Events",
                  desc: "Browse everything happening on campus in one place.",
                },
                {
                  title: "📝 Easy Registration",
                  desc: "Register instantly using official event links.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "14px",
                    padding: "20px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <h3 style={{ marginBottom: "8px" }}>{f.title}</h3>
                  <p style={{ color: "#cbd5f5", fontSize: "14px" }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </SignedOut>

        <SignedIn>
          {role === "ADMIN" && (
            <>
              <TopBar title=" Admin Dashboard" setRole={setRole} />
              <AdminDashboard />
            </>
          )}

          {role === "STUDENT" && (
            <>
              <TopBar title=" Student Dashboard" setRole={setRole} />
              <StudentDashboard />
            </>
          )}

          {!role && <p>Signing out...</p>}
        </SignedIn>
      </div>
    </>
  );
}

export default App;
