import React, { useState, useRef, useEffect } from "react";

/**
 * ChatPanel
 * Real-time chat sidebar with typing indicators, auto-scroll, and timestamps.
 */

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatPanel = ({
  messages,
  typingUsers,
  onSendMessage,
  onTyping,
  onStopTyping,
  onClose,
  mySocketId,
}) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // Focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
    onStopTyping();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (e.target.value) {
      onTyping();
    } else {
      onStopTyping();
    }
  };

  const typingNames = Object.values(typingUsers);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-blue-100 dark:border-slate-700/60">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-blue-100 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div>
          <h3 className="font-display font-semibold text-slate-800 dark:text-white text-sm">
            Room Chat
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {messages.length} messages
          </p>
        </div>
        <button
          onClick={onClose}
          className="btn-icon w-8 h-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <XIcon />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-blue-400">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No messages yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Be the first to say hello!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === mySocketId;
            const showName = i === 0 || messages[i - 1].senderId !== msg.senderId;

            return (
              <div
                key={i}
                className={`flex flex-col animate-slide-up ${isMe ? "items-end" : "items-start"}`}
              >
                {showName && !isMe && (
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1 ml-1">
                    {msg.senderName}
                  </span>
                )}
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm"
                  }`}
                >
                  {msg.message}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-600 mt-1 mx-1">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {typingNames.length > 0 && (
          <div className="flex items-end gap-2">
            <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2.5 rounded-2xl rounded-bl-sm">
              <div className="flex items-center gap-1">
                <span className="typing-dot w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full" />
                <span className="typing-dot w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full" />
                <span className="typing-dot w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full" />
              </div>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">
              {typingNames.join(", ")} {typingNames.length === 1 ? "is" : "are"} typing
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-blue-100 dark:border-slate-700/60 bg-white dark:bg-slate-900">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 input-field resize-none text-sm py-2 min-h-[40px] max-h-24"
            style={{ overflowY: inputValue.split("\n").length > 2 ? "auto" : "hidden" }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="btn-icon w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
          >
            <SendIcon />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatPanel;
