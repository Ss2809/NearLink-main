import { StrictMode } from "react";
import "leaflet/dist/leaflet.css";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Toaster } from "react-hot-toast";
import React from "react";
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
  <App />

  <Toaster
    position="top-right"
    toastOptions={{
      duration: 3000,
      style: {
        background: "#111827",
        color: "#fff",
        border: "1px solid #22c55e",
      },
      success: {
        iconTheme: {
          primary: "#22c55e",
          secondary: "#fff",
        },
      },
      error: {
        iconTheme: {
          primary: "#ef4444",
          secondary: "#fff",
        },
      },
    }}
  />
</React.StrictMode>
);
