import React from "react";

export function Shimmer({ children, className = "", ...props }) {
  return (
    <span className={`shimmer-badge ${className}`} {...props}>
      <span className="shimmer-text">{children}</span>
      <span className="shimmer-glimmer" aria-hidden="true" />
    </span>
  );
}
