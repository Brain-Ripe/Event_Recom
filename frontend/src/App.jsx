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
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";

/* ================= AUTH SYNC ================= */
function AuthSync({ setRole }) {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    axios
      .post(
        "http://127.0.0.1:5000/auth/sync",
        {
          clerk_user_id: user.id,
          email: user.primaryEmailAddress.emailAddress,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        setRole(res.data.role);

        localStorage.setItem("role", res.data.role);
        localStorage.setItem("user_id", res.data.user_id);

        if (res.data.student_id) {
          localStorage.setItem("student_id", res.data.student_id);
        }
      })
      .catch((err) => {
        console.error("Auth sync failed", err);
      });
  }, [isLoaded, user]);

  return null;
}

/* ================= MAIN APP ================= */
function App() {
  const [role, setRole] = useState(localStorage.getItem("role"));

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      {/* 🔑 MUST BE HERE */}
      <AuthSync setRole={setRole} />

      <SignedOut>
        <h1>Campus Event Recommendation System</h1>
        <SignInButton mode="modal">
          <button>Sign In / Sign Up</button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <UserButton />
        <br />
        <br />
        <SignOutButton>
          <button
            onClick={() => {
              localStorage.removeItem("role");
              setRole(null);
            }}
          >
            Sign Out
          </button>
        </SignOutButton>

        <hr />

        {/* 🔐 ROLE BASED VIEW */}
        {role === "ADMIN" && <AdminDashboard />}

        {role === "STUDENT" && <StudentDashboard />}

        {role && role !== "ADMIN" && role !== "STUDENT" && (
          <p>Unauthorized role</p>
        )}

        {!role && <p>Loading role...</p>}
      </SignedIn>
    </div>
  );
}

export default App;
