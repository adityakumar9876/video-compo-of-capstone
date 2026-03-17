import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useSocket } from "../context/SocketContext";
import { useWebRTC } from "../hooks/useWebRTC";
import { useChat } from "../hooks/useChat";

import VideoTile from "./VideoTile";
import ControlBar from "./ControlBar";
import ChatPanel from "./ChatPanel";

/**
 * RoomPage
 * The main video call interface. Orchestrates:
 * - WebRTC peer connections
 * - Video grid layout
 * - Chat panel
 * - Controls bar
 */

// Connection status badge
const StatusBadge = ({ status }) => {
  const config = {
    connecting: { label: "Connecting...", dotClass: "connecting" },
    connected: { label: "Connected", dotClass: "connected" },
    disconnected: { label: "Disconnected", dotClass: "disconnected" },
  };
  const { label, dotClass } = config[status] || config.connecting;

  return (
    <div className="flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 px-3 py-1.5 rounded-full">
      <span className={`status-dot ${dotClass}`} />
      <span className="text-white text-xs font-medium">{label}</span>
    </div>
  );
};

// Calculate grid class based on participant count
const getGridClass = (count) => {
  if (count <= 1) return "video-grid-1";
  if (count === 2) return "video-grid-2";
  if (count === 3) return "video-grid-3";
  if (count === 4) return "video-grid-4";
  return "video-grid-5";
};

const RoomPage = () => {
  const { roomId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const userName = state?.userName || "Guest";
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  // WebRTC hook
  const {
    localStream,
    remoteStreams,
    audioEnabled,
    videoEnabled,
    isScreenSharing,
    connectionStatus,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    cleanup,
  } = useWebRTC(socket, roomId, userName);

  // Chat hook
  const {
    messages,
    typingUsers,
    unreadCount,
    sendMessage,
    sendTyping,
    stopTyping,
    setChatOpen,
  } = useChat(socket, roomId, userName);

  // Join room on mount
  useEffect(() => {
    if (!socket || !roomId || !userName || hasJoined) return;

    if (!state?.userName) {
      toast.error("No username found. Redirecting to home...");
      navigate("/");
      return;
    }

    socket.emit("join-room", { roomId, userName });
    setHasJoined(true);

    return () => {
      socket.emit("leave-room", { roomId });
      cleanup();
    };
  }, [socket, roomId, userName, navigate, state, hasJoined, cleanup]);

  // Sync chat panel open state with chat hook
  useEffect(() => {
    setChatOpen(isChatOpen);
  }, [isChatOpen, setChatOpen]);

  const handleEndCall = useCallback(() => {
    if (socket) {
      socket.emit("leave-room", { roomId });
    }
    cleanup();
    navigate("/");
    toast.success("Call ended");
  }, [socket, roomId, cleanup, navigate]);

  const handleToggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  const handleToggleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  // Build array of all video tiles: local + remotes
  const remoteEntries = Object.entries(remoteStreams);
  const totalParticipants = 1 + remoteEntries.length; // local + remote
  const gridClass = getGridClass(totalParticipants);

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 z-10">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-sky-400 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
              <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
            </svg>
          </div>
          <span className="font-display font-semibold text-white text-sm hidden sm:block">
            Med Air
          </span>
        </div>

        {/* Center: Connection Status */}
        <StatusBadge status={connectionStatus} />

        {/* Right: Participant count */}
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="text-white font-medium">{totalParticipants}</span>
          <span>participant{totalParticipants !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Main Content: Video Grid + Chat */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 relative overflow-hidden">
          {localStream || remoteEntries.length > 0 ? (
            <div
              className={`grid ${gridClass} gap-2 p-2 h-full`}
              style={{ alignContent: "start" }}
            >
              {/* Local Video */}
              {localStream && (
                <VideoTile
                  stream={localStream}
                  name={userName}
                  isLocal={true}
                  audioEnabled={audioEnabled}
                  videoEnabled={videoEnabled}
                  className={`${totalParticipants === 3 ? "col-span-2 sm:col-span-1" : ""} min-h-[140px] max-h-[380px]`}
                />
              )}

              {/* Remote Videos */}
              {remoteEntries.map(([socketId, { stream, name }]) => (
                <VideoTile
                  key={socketId}
                  stream={stream}
                  name={name}
                  isLocal={false}
                  className="min-h-[140px] max-h-[380px]"
                />
              ))}
            </div>
          ) : (
            // Loading state while camera initializes
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium">Initializing camera...</p>
              <p className="text-xs text-slate-500 mt-1">Please allow camera and microphone access</p>
            </div>
          )}

          {/* Waiting for others message */}
          {localStream && remoteEntries.length === 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 px-4 py-2 rounded-full">
              <p className="text-slate-300 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                Waiting for others to join...
              </p>
            </div>
          )}
        </div>

        {/* Chat Panel (slide in from right) */}
        {isChatOpen && (
          <div className="w-80 flex-shrink-0 animate-slide-in-right">
            <ChatPanel
              messages={messages}
              typingUsers={typingUsers}
              onSendMessage={sendMessage}
              onTyping={sendTyping}
              onStopTyping={stopTyping}
              onClose={() => setIsChatOpen(false)}
              mySocketId={socket?.id}
            />
          </div>
        )}
      </div>

      {/* Control Bar */}
      <ControlBar
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        isScreenSharing={isScreenSharing}
        isChatOpen={isChatOpen}
        unreadCount={unreadCount}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleChat={handleToggleChat}
        onEndCall={handleEndCall}
        roomId={roomId}
      />
    </div>
  );
};

export default RoomPage;
