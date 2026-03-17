import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { SocketProvider } from "./context/SocketContext";
import { ThemeProvider } from "./context/ThemeContext";
import LandingPage from "./components/LandingPage";
import RoomPage from "./components/RoomPage";

/**
 * App
 * Root component. Sets up providers and routing.
 *
 * Routes:
 * /           → Landing page (enter name, create/join room)
 * /room/:id   → Video call room
 */
function App() {
  return (
    <ThemeProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/room/:roomId" element={<RoomPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1e293b",
              color: "#f1f5f9",
              border: "1px solid #334155",
              borderRadius: "12px",
              fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
            },
            success: {
              iconTheme: { primary: "#34d399", secondary: "#1e293b" },
            },
            error: {
              iconTheme: { primary: "#f87171", secondary: "#1e293b" },
            },
          }}
        />
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
