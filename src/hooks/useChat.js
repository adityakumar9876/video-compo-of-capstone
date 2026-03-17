/**
 * useChat Hook
 * Manages real-time chat via Socket.io.
 * Features: message history, typing indicators, auto-scroll.
 */

import { useState, useEffect, useCallback, useRef } from "react";

export const useChat = (socket, roomId, userName) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({}); // { socketId: name }
  const [unreadCount, setUnreadCount] = useState(0);
  const typingTimeoutRef = useRef(null);
  const isChatOpenRef = useRef(false);

  // Track if chat panel is open to reset unread count
  const setChatOpen = useCallback((open) => {
    isChatOpenRef.current = open;
    if (open) setUnreadCount(0);
  }, []);

  // Send a chat message
  const sendMessage = useCallback(
    (text) => {
      if (!text.trim() || !socket) return;
      socket.emit("chat-message", { roomId, message: text.trim() });
    },
    [socket, roomId]
  );

  // Emit typing indicator (debounced)
  const sendTyping = useCallback(() => {
    if (!socket) return;
    socket.emit("typing-start", { roomId });

    // Auto-stop typing after 2 seconds of inactivity
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing-stop", { roomId });
    }, 2000);
  }, [socket, roomId]);

  const stopTyping = useCallback(() => {
    if (!socket) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit("typing-stop", { roomId });
  }, [socket, roomId]);

  // Wire up socket events
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      setMessages((prev) => [...prev, data]);
      if (!isChatOpenRef.current) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    const handleTypingStart = ({ socketId, name }) => {
      setTypingUsers((prev) => ({ ...prev, [socketId]: name }));
    };

    const handleTypingStop = ({ socketId }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    };

    socket.on("chat-message", handleMessage);
    socket.on("user-typing", handleTypingStart);
    socket.on("user-stopped-typing", handleTypingStop);

    return () => {
      socket.off("chat-message", handleMessage);
      socket.off("user-typing", handleTypingStart);
      socket.off("user-stopped-typing", handleTypingStop);
    };
  }, [socket]);

  return {
    messages,
    typingUsers,
    unreadCount,
    sendMessage,
    sendTyping,
    stopTyping,
    setChatOpen,
  };
};
