import React from "react";

/**
 * ControlBar
 * Bottom action bar with mute, video, screen share, chat, and end call buttons.
 */

// ─── Icons ────────────────────────────────────────────────────────────────────
const MicOnIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const MicOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const VideoOnIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const VideoOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const ScreenShareOnIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <polyline points="9 9 12 6 15 9" />
    <line x1="12" y1="6" x2="12" y2="14" />
  </svg>
);

const ScreenShareOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <polyline points="9 11 12 14 15 11" />
    <line x1="12" y1="14" x2="12" y2="6" />
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const PhoneOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07C9.44 17.29 8.71 16.56 8 15.78" />
    <path d="M14.22 14.22A12.74 12.74 0 0 1 9.4 10.8m-.4-3.4A12.93 12.93 0 0 0 4.93 10" />
    <path d="M4.73 4.73A19.87 19.87 0 0 0 2.07 8.5 2 2 0 0 0 3.79 11h.34" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// ─── Control Button ───────────────────────────────────────────────────────────
const ControlButton = ({ onClick, active, danger, label, children, badge }) => (
  <div className="flex flex-col items-center gap-1">
    <button
      onClick={onClick}
      title={label}
      className={`
        relative w-12 h-12 rounded-2xl flex items-center justify-center
        transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0
        ${danger
          ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30"
          : active
          ? "bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20"
          : "bg-slate-800/80 backdrop-blur-sm text-slate-400 border border-slate-700/50 hover:text-white hover:bg-slate-700/80"
        }
      `}
    >
      {children}
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
    <span className="text-[10px] text-slate-400 font-medium">{label}</span>
  </div>
);

// ─── Control Bar ──────────────────────────────────────────────────────────────
const ControlBar = ({
  audioEnabled,
  videoEnabled,
  isScreenSharing,
  isChatOpen,
  unreadCount,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onEndCall,
  roomId,
}) => {
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  return (
    <div className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-900/90 backdrop-blur-xl border-t border-slate-700/50">
      {/* Left group */}
      <div className="flex items-center gap-3">
        <ControlButton
          onClick={onToggleAudio}
          active={audioEnabled}
          label={audioEnabled ? "Mute" : "Unmute"}
        >
          {audioEnabled ? <MicOnIcon /> : <MicOffIcon />}
        </ControlButton>

        <ControlButton
          onClick={onToggleVideo}
          active={videoEnabled}
          label={videoEnabled ? "Camera Off" : "Camera On"}
        >
          {videoEnabled ? <VideoOnIcon /> : <VideoOffIcon />}
        </ControlButton>

        <ControlButton
          onClick={isScreenSharing ? () => {} : onToggleScreenShare}
          active={isScreenSharing}
          label={isScreenSharing ? "Stop Share" : "Share Screen"}
        >
          {isScreenSharing ? <ScreenShareOffIcon /> : <ScreenShareOnIcon />}
        </ControlButton>
      </div>

      {/* Center: Room ID */}
      <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800/60 border border-slate-700/50 rounded-xl">
        <span className="text-slate-400 text-xs">Room:</span>
        <span className="font-mono font-bold text-white text-sm tracking-wider">{roomId}</span>
        <button
          onClick={copyRoomId}
          className="text-slate-400 hover:text-white transition-colors ml-1"
          title="Copy Room ID"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
      </div>

      {/* Right group */}
      <div className="flex items-center gap-3">
        <ControlButton
          onClick={onToggleChat}
          active={isChatOpen}
          badge={!isChatOpen ? unreadCount : 0}
          label="Chat"
        >
          <ChatIcon />
        </ControlButton>

        <ControlButton onClick={onEndCall} danger label="End Call">
          <PhoneOffIcon />
        </ControlButton>
      </div>
    </div>
  );
};

export default ControlBar;
