import { SignOutButton, UserButton } from "@clerk/clerk-react";

export default function TopBar({ title, setRole }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        marginBottom: "32px",

        background: "rgba(255,255,255,0.04)",
        borderRadius: "14px",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(10px)",
      }}
    >
      {/* ⬅️ LEFT */}
      <h2 style={{ margin: 0 }}>{title}</h2>

      {/* ➡️ RIGHT */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <UserButton />

        <SignOutButton>
          <button
            onClick={() => {
              localStorage.clear();
              setRole(null);
            }}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#f8fafc",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
