import React from "react";

export function Conversation({ className = "", children, ...props }) {
  return (
    <div className={`conversation-container ${className}`} {...props}>
      {children}
    </div>
  );
}

export function ConversationContent({ className = "", children, ...props }) {
  return (
    <div className={`conversation-content-list ${className}`} {...props}>
      {children}
    </div>
  );
}
