import React, { useEffect, useRef } from "react";

/**
 * VideoTile
 * Renders a single participant's video stream with their name overlay.
 * Uses a ref to attach the MediaStream to the <video> element.
 */
const VideoTile = ({ stream, name, isLocal = false, audioEnabled = true, videoEnabled = true, className = "" }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`video-tile group ${className}`}>
      {/* Video element */}
      {stream && videoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Always mute local video to prevent echo
          className="w-full h-full object-cover"
          style={{ transform: isLocal ? "scaleX(-1)" : "none" }} // Mirror local video
        />
      ) : (
        // Avatar placeholder when camera is off
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-sky-400 rounded-full flex items-center justify-center text-white font-bold text-2xl font-display shadow-lg">
            {name ? name.charAt(0).toUpperCase() : "?"}
          </div>
        </div>
      )}

      {/* Gradient overlay at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

      {/* Name + status overlay */}
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between">
        <span className="text-white text-xs font-semibold drop-shadow bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
          {isLocal ? `${name} (You)` : name}
        </span>

        {/* Media status indicators */}
        <div className="flex items-center gap-1">
          {!audioEnabled && (
            <span className="bg-red-500/90 backdrop-blur-sm rounded-full w-5 h-5 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3">
                <line x1="1" y1="1" x2="23" y2="23" stroke="white" strokeWidth="2.5" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" fill="none" stroke="white" strokeWidth="2" />
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" fill="none" stroke="white" strokeWidth="2" />
                <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="2" />
                <line x1="8" y1="23" x2="16" y2="23" stroke="white" strokeWidth="2" />
              </svg>
            </span>
          )}
          {!videoEnabled && (
            <span className="bg-red-500/90 backdrop-blur-sm rounded-full w-5 h-5 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-3 h-3">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h1a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56" />
              </svg>
            </span>
          )}
        </div>
      </div>

      {/* "Local" badge */}
      {isLocal && (
        <div className="absolute top-2 right-2 bg-blue-500/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          YOU
        </div>
      )}
    </div>
  );
};

export default VideoTile;
