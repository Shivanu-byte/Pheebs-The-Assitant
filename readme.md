# Pheebs — Personal AI Assistant

Pheebs is a **local-first, voice-enabled personal AI assistant** designed to understand natural-language requests, reason about tasks, use tools and specialized agents, and execute workflows autonomously.

## Architecture

```text
User Voice
    ↓
   STT
    ↓
LangGraph + LLM
    ↓
Tools / Agents / n8n
    ↓
Final Response
    ↓
   TTS
    ↓
Voice Response
```

## Core Stack

| Component               | Technology                              |
| ----------------------- | --------------------------------------- |
| **UI**                  | TBD                                     |
| **Agent Orchestration** | LangGraph                               |
| **Automation**          | n8n                                     |
| **LLM**                 | TBD — Kimi / Qwen / DeepSeek / Nemotron |
| **STT**                 | Whisper / faster-whisper                |
| **TTS**                 | Chatterbox + IndicF5                    |
| **Voice**               | Locally stored Pheebs voice reference   |
| **Image Generation**    | Z-Image-Turbo                           |
| **Backend**             | FastAPI                                 |
| **Memory / DB**         | TBD                                     |

## Key Principles

* **Local-first:** Personal data and models run locally wherever possible.
* **Modular:** Models can be replaced without redesigning the system.
* **Agentic:** Pheebs can plan, use tools, delegate tasks and execute workflows.
* **Multimodal:** Voice, text, images and documents.
* **Indian-language support:** Hindi and major Indic languages are a priority.
* **Safe execution:** Confirmation required for sensitive or destructive actions.

## Development Roadmap

**Phase 1:** Voice → STT → LLM → TTS
**Phase 2:** Tools + n8n + LangGraph
**Phase 3:** Memory + personal integrations
**Phase 4:** Multi-agent workflows
**Phase 5:** Multimodal capabilities + advanced automation

> **Goal:** Build a local AI assistant that doesn't just answer questions—it **understands, plans, acts, and reports back.**
