/**
 * useWebRTC Hook
 *
 * Manages the entire WebRTC lifecycle:
 * 1. Get local media stream (camera + mic)
 * 2. Create RTCPeerConnection for each remote participant
 * 3. Handle offer/answer/ICE candidate exchange via Socket.io
 * 4. Manage media tracks (mute, video toggle, screen share)
 * 5. Clean up connections on leave
 *
 * Mesh Architecture:
 * - When you join a room, the server tells you who's already there
 * - You send an OFFER to each existing participant
 * - Each sends back an ANSWER
 * - When a NEW participant joins after you, they send you an OFFER, you send ANSWER
 * - Both sides exchange ICE candidates to find the best network path
 */

import { useEffect, useRef, useState, useCallback } from "react";
import toast from "react-hot-toast";

// STUN servers help peers discover their public IP/port
// For production, add TURN servers for users behind strict firewalls/NAT
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    // Add TURN servers for production:
    // { urls: "turn:your-turn-server.com", username: "user", credential: "pass" }
  ],
};

export const useWebRTC = (socket, roomId, userName) => {
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peerConnectionsRef = useRef({}); // { socketId: RTCPeerConnection }
  const pendingCandidatesRef = useRef({}); // Buffer ICE candidates before remote description is set

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // { socketId: { stream, name } }
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [participants, setParticipants] = useState({});

  // ── Initialize local media stream ─────────────────────────────────────────
  const initLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (error) {
      if (error.name === "NotAllowedError") {
        toast.error("Camera/microphone permission denied. Please allow access and reload.");
      } else if (error.name === "NotFoundError") {
        toast.error("No camera or microphone found on your device.");
      } else {
        toast.error("Could not access media devices: " + error.message);
      }
      throw error;
    }
  }, []);

  // ── Create a new RTCPeerConnection for a participant ──────────────────────
  const createPeerConnection = useCallback(
    (targetSocketId, targetName) => {
      console.log(`[WebRTC] Creating peer connection with ${targetName} (${targetSocketId})`);

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionsRef.current[targetSocketId] = pc;
      pendingCandidatesRef.current[targetSocketId] = [];

      // Add local tracks to the connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // Handle incoming remote stream
      pc.ontrack = (event) => {
        console.log(`[WebRTC] Got remote track from ${targetName}`);
        const [remoteStream] = event.streams;
        setRemoteStreams((prev) => ({
          ...prev,
          [targetSocketId]: { stream: remoteStream, name: targetName },
        }));
      };

      // Send ICE candidates to the remote peer via signaling server
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("ice-candidate", {
            targetId: targetSocketId,
            candidate: event.candidate,
          });
        }
      };

      // Monitor connection state
      pc.onconnectionstatechange = () => {
        console.log(`[WebRTC] Connection state (${targetName}):`, pc.connectionState);
        if (pc.connectionState === "connected") {
          setConnectionStatus("connected");
        } else if (["failed", "disconnected"].includes(pc.connectionState)) {
          // Could attempt reconnection here
          toast.error(`Connection with ${targetName} dropped`);
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`[WebRTC] ICE state (${targetName}):`, pc.iceConnectionState);
      };

      return pc;
    },
    [socket]
  );

  // ── Create and send an OFFER (called by the joining participant) ──────────
  const createOffer = useCallback(
    async (targetSocketId, targetName) => {
      const pc = createPeerConnection(targetSocketId, targetName);

      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);

        socket.emit("webrtc-offer", {
          targetId: targetSocketId,
          offer,
          senderName: userName,
        });
      } catch (error) {
        console.error("[WebRTC] Error creating offer:", error);
      }
    },
    [createPeerConnection, socket, userName]
  );

  // ── Handle incoming OFFER and send ANSWER ─────────────────────────────────
  const handleOffer = useCallback(
    async ({ senderId, senderName, offer }) => {
      console.log(`[WebRTC] Received offer from ${senderName}`);
      const pc = createPeerConnection(senderId, senderName);

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // Add any buffered ICE candidates
        const pending = pendingCandidatesRef.current[senderId] || [];
        for (const candidate of pending) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
        pendingCandidatesRef.current[senderId] = [];

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("webrtc-answer", { targetId: senderId, answer });
      } catch (error) {
        console.error("[WebRTC] Error handling offer:", error);
      }
    },
    [createPeerConnection, socket]
  );

  // ── Handle incoming ANSWER ────────────────────────────────────────────────
  const handleAnswer = useCallback(async ({ senderId, answer }) => {
    const pc = peerConnectionsRef.current[senderId];
    if (!pc) return;

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));

      // Add any buffered ICE candidates
      const pending = pendingCandidatesRef.current[senderId] || [];
      for (const candidate of pending) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
      pendingCandidatesRef.current[senderId] = [];
    } catch (error) {
      console.error("[WebRTC] Error handling answer:", error);
    }
  }, []);

  // ── Handle incoming ICE CANDIDATE ─────────────────────────────────────────
  const handleIceCandidate = useCallback(async ({ senderId, candidate }) => {
    const pc = peerConnectionsRef.current[senderId];
    if (!pc || !pc.remoteDescription) {
      // Buffer candidates until remote description is set
      if (!pendingCandidatesRef.current[senderId]) {
        pendingCandidatesRef.current[senderId] = [];
      }
      pendingCandidatesRef.current[senderId].push(candidate);
      return;
    }

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error("[WebRTC] Error adding ICE candidate:", error);
    }
  }, []);

  // ── Remove a peer when they disconnect ────────────────────────────────────
  const removePeer = useCallback((socketId) => {
    if (peerConnectionsRef.current[socketId]) {
      peerConnectionsRef.current[socketId].close();
      delete peerConnectionsRef.current[socketId];
    }
    delete pendingCandidatesRef.current[socketId];
    setRemoteStreams((prev) => {
      const next = { ...prev };
      delete next[socketId];
      return next;
    });
    setParticipants((prev) => {
      const next = { ...prev };
      delete next[socketId];
      return next;
    });
  }, []);

  // ── Toggle Audio ──────────────────────────────────────────────────────────
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      const newState = audioTracks[0]?.enabled ?? false;
      setAudioEnabled(newState);
      if (socket && roomId) {
        socket.emit("media-state-change", {
          roomId,
          audioEnabled: newState,
          videoEnabled,
        });
      }
    }
  }, [socket, roomId, videoEnabled]);

  // ── Toggle Video ──────────────────────────────────────────────────────────
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      const newState = videoTracks[0]?.enabled ?? false;
      setVideoEnabled(newState);
      if (socket && roomId) {
        socket.emit("media-state-change", {
          roomId,
          audioEnabled,
          videoEnabled: newState,
        });
      }
    }
  }, [socket, roomId, audioEnabled]);

  // ── Screen Sharing ────────────────────────────────────────────────────────
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: false,
      });
      screenStreamRef.current = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];

      // Replace video track in all peer connections
      Object.values(peerConnectionsRef.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(screenTrack);
      });

      setIsScreenSharing(true);

      // Stop screen share when user clicks "Stop sharing" in browser UI
      screenTrack.onended = () => stopScreenShare();
    } catch (error) {
      if (error.name !== "NotAllowedError") {
        toast.error("Screen sharing failed: " + error.message);
      }
    }
  }, []);

  const stopScreenShare = useCallback(async () => {
    if (!screenStreamRef.current) return;

    // Stop screen track
    screenStreamRef.current.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;

    // Restore camera video track in all peer connections
    if (localStreamRef.current) {
      const cameraTrack = localStreamRef.current.getVideoTracks()[0];
      if (cameraTrack) {
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(cameraTrack);
        });
      }
    }
    setIsScreenSharing(false);
  }, []);

  // ── Cleanup: close all peer connections and stop media ───────────────────
  const cleanup = useCallback(() => {
    Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
    peerConnectionsRef.current = {};

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }

    setLocalStream(null);
    setRemoteStreams({});
  }, []);

  // ── Wire up socket events ─────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // Server sends list of existing participants when we join
    const handleRoomJoined = async ({ participants: existingParticipants }) => {
      setConnectionStatus("connected");
      const participantMap = {};
      existingParticipants.forEach((p) => {
        participantMap[p.socketId] = p.name;
      });
      setParticipants(participantMap);

      // Initialize local stream first, then create offers
      try {
        await initLocalStream();
        // Send offers to all existing participants
        for (const participant of existingParticipants) {
          await createOffer(participant.socketId, participant.name);
        }
      } catch (err) {
        console.error("[WebRTC] Init failed:", err);
      }
    };

    // New participant joined — they'll send us an offer
    const handleParticipantJoined = ({ socketId, name }) => {
      setParticipants((prev) => ({ ...prev, [socketId]: name }));
      toast(`${name} joined the call`, { icon: "👋" });
    };

    const handleParticipantLeft = ({ socketId, name }) => {
      removePeer(socketId);
      toast(`${name} left the call`, { icon: "👋" });
    };

    const handleMediaChange = ({ socketId, audioEnabled, videoEnabled }) => {
      // Could update UI indicators for muted participants
      console.log(`[Media] ${socketId}: audio=${audioEnabled}, video=${videoEnabled}`);
    };

    socket.on("room-joined", handleRoomJoined);
    socket.on("participant-joined", handleParticipantJoined);
    socket.on("participant-left", handleParticipantLeft);
    socket.on("webrtc-offer", handleOffer);
    socket.on("webrtc-answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("participant-media-change", handleMediaChange);

    return () => {
      socket.off("room-joined", handleRoomJoined);
      socket.off("participant-joined", handleParticipantJoined);
      socket.off("participant-left", handleParticipantLeft);
      socket.off("webrtc-offer", handleOffer);
      socket.off("webrtc-answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("participant-media-change", handleMediaChange);
    };
  }, [
    socket,
    initLocalStream,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    removePeer,
  ]);

  // If no other participants, still init local stream
  useEffect(() => {
    if (socket && roomId && userName) {
      initLocalStream().catch(() => {});
    }
  }, [socket, roomId, userName, initLocalStream]);

  return {
    localStream,
    remoteStreams,
    audioEnabled,
    videoEnabled,
    isScreenSharing,
    connectionStatus,
    participants,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    cleanup,
  };
};
