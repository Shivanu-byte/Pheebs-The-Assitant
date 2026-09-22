import React, { Component } from "react";
import { JarvisInterface } from "./JarvisInterface";
import "./App.css";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("UI Error Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: "#ff5555", padding: 32, fontFamily: "monospace", background: "#020610", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <h2 style={{ letterSpacing: 2, marginBottom: 12 }}>SYSTEM DIAGNOSTIC ALERT</h2>
          <pre style={{ color: "#ffaa00", background: "rgba(255,255,255,0.05)", padding: 16, borderRadius: 8, maxWidth: 600, overflowX: "auto" }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 20, padding: "10px 24px", background: "#ff7700", border: "none", color: "#fff", cursor: "pointer", borderRadius: 6, fontWeight: 700, letterSpacing: 1 }}
          >
            REBOOT INTERFACE
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <JarvisInterface />
    </ErrorBoundary>
  );
}

export default App;