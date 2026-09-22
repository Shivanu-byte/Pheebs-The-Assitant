import React from "react";

export function Message({ from = "assistant", className = "", children, ...props }) {
  return (
    <div className={`message-wrapper message-${from} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function MessageContent({ className = "", children, ...props }) {
  return (
    <div className={`message-bubble ${className}`} {...props}>
      {children}
    </div>
  );
}

export function MessageResponse({ className = "", children, ...props }) {
  return (
    <div className={`message-response-text ${className}`} {...props}>
      {children}
    </div>
  );
}
