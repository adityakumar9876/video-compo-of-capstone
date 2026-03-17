import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

// ─── Icon Components ──────────────────────────────────────────────────────────
const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ZapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

// ─── Landing Page ─────────────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [userName, setUserName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [generatedRoomId, setGeneratedRoomId] = useState("");
  const [activeTab, setActiveTab] = useState("create"); // "create" | "join"
  const [isLoading, setIsLoading] = useState(false);

  // Generate a unique room ID
  const handleCreateRoom = () => {
    if (!userName.trim()) {
      toast.error("Please enter your name first");
      return;
    }
    const roomId = uuidv4().split("-")[0].toUpperCase();
    setGeneratedRoomId(roomId);
  };

  const handleStartCall = async () => {
    if (!userName.trim()) {
      toast.error("Please enter your name first");
      return;
    }
    const roomId = activeTab === "create" ? generatedRoomId : joinRoomId.trim().toUpperCase();
    if (!roomId) {
      toast.error(activeTab === "create" ? "Generate a room ID first" : "Enter a Room ID to join");
      return;
    }

    setIsLoading(true);
    // Small delay for UX
    await new Promise((r) => setTimeout(r, 500));
    navigate(`/room/${roomId}`, { state: { userName: userName.trim() } });
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/room/${generatedRoomId}`;
    navigator.clipboard.writeText(link);
    toast.success("Room link copied!");
  };

  return (
    <div className={`min-h-screen bg-mesh dark:bg-mesh-dark ${isDark ? "dark" : ""}`}>
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-400/10 dark:bg-sky-400/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-300/5 dark:bg-blue-300/3 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-sky-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display font-bold text-base text-slate-800 dark:text-white leading-none">
              Med Air
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Video Calling System
            </p>
          </div>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/80 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all duration-200 backdrop-blur-sm shadow-sm"
          title="Toggle dark mode"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-10 pb-20">
        {/* Hero text */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 text-blue-700 dark:text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Secure · HD Quality · HIPAA-Ready
          </div>

          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-slate-800 dark:text-white mb-4 leading-tight">
            Healthcare <span className="text-gradient">Telehealth</span>
            <br />
            Built for Professionals
          </h2>

          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
            Crystal-clear video consultations. Join or create a secure room instantly —
            no downloads, no accounts required.
          </p>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-md animate-slide-up">
          <div className="glass-card p-8">
            {/* Username input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Your Display Name
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Your Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStartCall()}
                maxLength={30}
              />
            </div>

            {/* Tab selector */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-6">
              <button
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === "create"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
                onClick={() => setActiveTab("create")}
              >
                Create Room
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === "join"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
                onClick={() => setActiveTab("join")}
              >
                Join Room
              </button>
            </div>

            {/* Create Room Tab */}
            {activeTab === "create" && (
              <div className="space-y-4">
                {!generatedRoomId ? (
                  <button
                    onClick={handleCreateRoom}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <PlusIcon />
                    Generate Room ID
                  </button>
                ) : (
                  <div className="space-y-3">
                    {/* Generated Room ID display */}
                    <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 rounded-xl p-3">
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                          Room ID
                        </p>
                        <p className="font-mono font-bold text-blue-700 dark:text-blue-300 text-lg tracking-widest">
                          {generatedRoomId}
                        </p>
                      </div>
                      <button
                        onClick={copyRoomLink}
                        className="btn-icon bg-white dark:bg-slate-700 border border-blue-200 dark:border-slate-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-600"
                        title="Copy room link"
                      >
                        <CopyIcon />
                      </button>
                    </div>

                    <button
                      onClick={handleStartCall}
                      disabled={isLoading}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <VideoIcon />
                          Start Video Call
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setGeneratedRoomId("")}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-full text-center transition-colors"
                    >
                      Generate a different Room ID
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Join Room Tab */}
            {activeTab === "join" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Room ID
                  </label>
                  <input
                    type="text"
                    className="input-field font-mono tracking-widest uppercase"
                    placeholder="Enter Room ID"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleStartCall()}
                    maxLength={8}
                  />
                </div>
                <button
                  onClick={handleStartCall}
                  disabled={isLoading || !joinRoomId.trim()}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ArrowRightIcon />
                      Join Room
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {["End-to-End Encrypted", "No Sign Up", "HD Video"].map((feat) => (
              <span
                key={feat}
                className="text-xs bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-blue-100 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full"
              >
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full mt-16">
          {[
            {
              icon: <ShieldIcon />,
              title: "Secure Connections",
              desc: "WebRTC P2P encryption. Media travels directly between participants — not through any server.",
            },
            {
              icon: <UsersIcon />,
              title: "Group Consultations",
              desc: "Up to 6 participants in a single room. Dynamic video grid adapts automatically.",
            },
            {
              icon: <ZapIcon />,
              title: "Real-Time Chat",
              desc: "Built-in chat panel with typing indicators. Keep communication flowing during the call.",
            },
          ].map((feat) => (
            <div
              key={feat.title}
              className="glass-card p-6 text-center hover:-translate-y-1 transition-transform duration-200"
            >
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                {feat.icon}
              </div>
              <h3 className="font-display font-semibold text-slate-800 dark:text-white mb-1">
                {feat.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-xs text-slate-400 dark:text-slate-600">
        Med Air Video Calling System &nbsp;·&nbsp; Powered by WebRTC + Socket.io
      </footer>
    </div>
  );
};

export default LandingPage;
