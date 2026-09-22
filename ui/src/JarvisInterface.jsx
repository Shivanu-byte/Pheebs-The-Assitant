import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Conversation, ConversationContent } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";

const JarvisAtom = lazy(() => import("./JarvisAtom").then((m) => ({ default: m.JarvisAtom })));

const BACKEND_URL = "http://127.0.0.1:8000";

export function JarvisInterface() {
  const [phase, setPhase] = useState("idle");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Good evening. JARVIS is online. How may I assist?" }
  ]);
  const [error, setError] = useState("");
  const [time, setTime] = useState("");

  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Intl.DateTimeFormat("en", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date())
      );
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const testBackend = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/pheebs`);

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const data = await response.json();

      console.log("FastAPI response:", data);
      setMessages((m) => [
        ...m,
        { role: "assistant", text: `[Backend Test]: ${data.message || JSON.stringify(data)}` }
      ]);
    } catch (error) {
      console.error("Backend connection failed:", error);
      setError(`Backend error: ${error.message}`);
    }
  };

  useEffect(() => {
    testBackend();
  }, []);

  const toggleListening = async () => {
    // Second click → stop recording
    if (phase === "listening") {
      mediaRecorder.current?.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      audioChunks.current = [];

      const recorder = new MediaRecorder(stream);

      mediaRecorder.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Turn microphone off
        stream.getTracks().forEach((track) => track.stop());

        // Convert recording into a Blob
        const audioBlob = new Blob(audioChunks.current, {
          type: "audio/webm",
        });

        // Prepare multipart/form-data
        const formData = new FormData();

        formData.append("file", audioBlob, "voice.webm");

        try {
          setPhase("thinking");

          const response = await fetch(
            `${BACKEND_URL}/pheebs/voice`,
            {
              method: "POST",
              body: formData,
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.detail || "Voice upload failed"
            );
          }

          console.log("FastAPI response:", data);

          if (data.message) {
            setMessages((m) => [
              ...m,
              { role: "assistant", text: data.message }
            ]);
          }

          setPhase("idle");

        } catch (error) {
          console.error("Voice upload failed:", error);
          setError(error.message);
          setPhase("error");
        }
      };

      // Start recording
      recorder.start();

      setError("");
      setPhase("listening");

    } catch (error) {
      console.error("Microphone error:", error);

      setError(
        "Microphone access was denied or unavailable."
      );

      setPhase("error");
    }
  };

  const ask = async (prompt) => {
    const clean = prompt.trim();
    if (!clean || phase === "thinking") return;
    setError("");
    setMessages((m) => [...m, { role: "user", text: clean }, { role: "assistant", text: "" }]);
    setPhase("thinking");

    try {
      const response = await fetch(`${BACKEND_URL}/pheebs`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Assistant unavailable (${response.status})`);
      }

      const data = await response.json();
      setMessages((m) => [
        ...m.slice(0, -1),
        { role: "assistant", text: data.message || "Message processed." },
      ]);
      setPhase("idle");
    } catch (cause) {
      setPhase("error");
      const message = cause instanceof Error ? cause.message : "The assistant link failed.";
      setError(message);
      setMessages((m) => [
        ...m.slice(0, -1),
        { role: "assistant", text: "I’m unable to complete that request right now." },
      ]);
    }
  };

  const cyclePhaseForDemo = () => {
    const phases = ["idle", "listening", "thinking", "speaking"];
    setPhase((current) => phases[(phases.indexOf(current) + 1) % phases.length]);
  };

  const status =
    phase === "idle"
      ? "SYSTEM READY"
      : phase === "listening"
      ? "PHEEBS IS LISTENING (MIC ON)"
      : phase === "thinking"
      ? "SENDING TO FASTAPI..."
      : phase === "speaking"
      ? "RESPONDING"
      : "ATTENTION";

  return (
    <main className={`jarvis-shell phase-${phase}`}>
      <div className="jarvis-grid" aria-hidden="true" />
      <div
        className={`atom-stage phase-${phase}`}
        onClick={toggleListening}
        style={{ cursor: "pointer" }}
        title={phase === "listening" ? "Listening... Click arc reactor to stop and send to backend" : "Click arc reactor to turn on system mic"}
      >
        <Suspense fallback={<div className="atom-loading">INITIALIZING CORE</div>}>
          <JarvisAtom phase={phase} onAtomClick={toggleListening} />
        </Suspense>
      </div>

      <header className="jarvis-header">
        <div>
          <span className="brand-mark">J</span>
          <div>
            <h1>JARVIS</h1>
            <p>JUST A RATHER VERY INTELLIGENT SYSTEM</p>
          </div>
        </div>
        <div className="clock">
          <span>LOCAL TIME</span>
          <strong>{time}</strong>
        </div>
      </header>

      <aside className="telemetry telemetry-left" aria-label="Core diagnostics">
        <span>CORE STATUS</span>
        <strong>STABLE</strong>
        <i />
        <span>NEURAL LATENCY</span>
        <strong>18 MS</strong>
        <i />
        <span>VOICE CHANNEL</span>
        <strong>ACTIVE</strong>
      </aside>

      <aside className="telemetry telemetry-right" aria-label="Energy diagnostics">
        <span>ARC REACTOR</span>
        <strong>98.7%</strong>
        <i />
        <span>ORBITAL SYNC</span>
        <strong>NOMINAL</strong>
        <i />
        <span>SECURITY</span>
        <strong>ENCRYPTED</strong>
      </aside>

      <section className="assistant-console" aria-label="JARVIS conversation">
        <div className="status-line" onClick={cyclePhaseForDemo} style={{ cursor: "pointer" }} title="Click to test state cycle">
          <span className={`status-dot phase-${phase}`} />
          <span>{status}</span>
          {phase === "thinking" && <Shimmer className="ml-auto text-primary">Analyzing command</Shimmer>}
        </div>

        <Conversation className="transcript">
          <ConversationContent className="gap-2 p-0">
            {messages.slice(-2).map((message, index) => (
              <Message from={message.role} key={`${message.role}-${index}`} className="max-w-full">
                <MessageContent className={message.role === "user" ? "jarvis-user-message" : "jarvis-response"}>
                  {message.text ? (
                    <MessageResponse>{message.text}</MessageResponse>
                  ) : (
                    <Shimmer>Formulating response</Shimmer>
                  )}
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
        </Conversation>

        {error && <p className="error-readout" role="alert">{error}</p>}

        <div className="command-row">
          <PromptInput onSubmit={({ text }) => ask(text)} className="jarvis-prompt">
            <PromptInputTextarea
              placeholder="Enter a command…"
              aria-label="Command input"
              className="min-h-9 py-2"
            />
            <PromptInputFooter className="justify-between py-1">
              <span className="input-label">SECURE CHANNEL 01</span>
              <PromptInputSubmit
                status={phase === "thinking" ? "streaming" : phase === "error" ? "error" : "ready"}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </section>

      <div className="corner corner-tl" />
      <div className="corner corner-tr" />
      <div className="corner corner-bl" />
      <div className="corner corner-br" />
    </main>
  );
}
