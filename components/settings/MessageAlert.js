// components/settings/MessageAlert.jsx
"use client";

import { memo, useEffect } from "react";

const MessageAlert = memo(function MessageAlert({ message, onClose }) {
  // Auto-close for success messages
  useEffect(() => {
    if (message.type === "success" && message.text) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message.text) return null;

  const alertStyles = {
    success: "bg-green-200 border-green-200 text-green-700 ",
    error: "bg-red-200 border-red-200 text-red-700 ",
    info: "bg-blue-200 border-blue-200 text-blue-700 ",
  };

  return (
    <div
      className={`mb-6 p-4 rounded-xl border ${
        alertStyles[message.type] || alertStyles.info
      }`}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <p>{message.text}</p>
        <button
          onClick={onClose}
          className="text-lg hover:opacity-70 ml-4"
          aria-label="Close message"
        >
          ✕
        </button>
      </div>
    </div>
  );
});

export default MessageAlert;
