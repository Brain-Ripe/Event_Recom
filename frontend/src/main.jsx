import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Clerk publishable key");
}

const clerkAppearance = {
  baseTheme: "dark",
  variables: {
    colorPrimary: "#4f46e5", // primary buttons
    colorBackground: "#020617", // popup background
    colorInputBackground: "#020617",
    colorText: "#e5e7eb",
    colorTextSecondary: "#94a3b8",
    borderRadius: "10px",
  },
  elements: {
    card: {
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.08)",
    },
    headerTitle: {
      color: "#fbfbfbff",
    },
    headerSubtitle: {
      color: "#94a3b8",
    },
    socialButtonsBlockButton: {
      border: "1px solid rgba(255,255,255,0.12)",
      backgroundColor: "#4f46e5",
      ":hover": { backgroundColor: "#4338ca" },
      color: "#ffffff",
    },
    formButtonPrimary: {
      backgroundColor: "#4f46e5",
      ":hover": {
        backgroundColor: "#4338ca",
      },
    },
  },
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <ClerkProvider
    publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
    appearance={clerkAppearance}
  >
    <App />
  </ClerkProvider>
);
