import React, { createContext, useContext, useState, useRef } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

const PromptInputContext = createContext(null);

export function PromptInput({ onSubmit, className = "", children }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const clean = text.trim();
    if (!clean) return;
    onSubmit?.({ text: clean });
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <PromptInputContext.Provider value={{ text, setText, handleSubmit, textareaRef }}>
      <form onSubmit={handleSubmit} className={`prompt-input-form ${className}`}>
        {children}
      </form>
    </PromptInputContext.Provider>
  );
}

export function PromptInputTextarea({
  placeholder = "Enter a command…",
  className = "",
  rows = 1,
  ...props
}) {
  const ctx = useContext(PromptInputContext);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ctx?.handleSubmit();
    }
  };

  const handleChange = (e) => {
    ctx?.setText(e.target.value);
    // Auto-expand textarea slightly if needed
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <textarea
      ref={ctx?.textareaRef}
      value={ctx ? ctx.text : ""}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`prompt-input-textarea ${className}`}
      rows={rows}
      {...props}
    />
  );
}

export function PromptInputFooter({ className = "", children }) {
  return (
    <div className={`prompt-input-footer ${className}`}>
      {children}
    </div>
  );
}

export function PromptInputSubmit({ status = "ready", className = "", ...props }) {
  const isStreaming = status === "streaming";
  const isError = status === "error";

  return (
    <button
      type="submit"
      disabled={isStreaming}
      className={`prompt-submit-btn status-${status} ${className}`}
      aria-label="Send command"
      title="Send command"
      {...props}
    >
      {isStreaming ? (
        <Loader2 className="submit-icon animate-spin" size={16} />
      ) : (
        <ArrowUp className="submit-icon" size={16} />
      )}
    </button>
  );
}
