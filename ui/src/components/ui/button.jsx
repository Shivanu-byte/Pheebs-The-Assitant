import React from "react";

export function Button({
  type = "button",
  variant = "default",
  size = "default",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={`ui-btn ui-btn-${variant} ui-btn-${size} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
