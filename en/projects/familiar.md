---
title: "Familiar: A Native Personal AI Workspace for iPhone"
date: 2026-08-14
author: Isaac Huo
description: "A native, safe and inspectable personal AI workspace for iPhone, built around a single-Agent runtime, a composable tool abstraction, and a BYOK model layer that keeps data on-device."
editLink: true
outline: [2, 3]
---

# Familiar: A Native Personal AI Workspace for iPhone

Familiar is a personal AI workspace I built for iPhone. Chat is the primary entry point, and the model completes real tasks through native tools — Calendar, Reminders, documents, Maps, and Photos — turning the phone's system capabilities into a composable, governable execution surface.

The app is BYOK-only: users bring their own model API Key, model requests go directly from the device to the selected provider, and conversations, attachments, and tool records stay on the device without ever passing through a Familiar server. There is no account, subscription, or managed quota.

<p align="center"><img src="/project-images/familiar.png" width="112" alt="Familiar icon" loading="lazy"></p>

## Screenshots

<table>
  <tr>
    <td align="center"><img src="/project-images/familiar/chat.png" width="210" alt="Chat"></td>
    <td align="center"><img src="/project-images/familiar/drawer.png" width="210" alt="Drawer"></td>
  </tr>
  <tr>
    <td align="center"><img src="/project-images/familiar/settings.png" width="210" alt="Settings"></td>
    <td align="center"><img src="/project-images/familiar/permissions.png" width="210" alt="Permissions"></td>
  </tr>
  <tr>
    <td align="center"><img src="/project-images/familiar/storage.png" width="210" alt="Storage"></td>
    <td align="center"><img src="/project-images/familiar/tools.png" width="210" alt="Tools"></td>
  </tr>
</table>

*Chat · Drawer · Settings · Permissions · Storage · Tools*

## Design Choices

Familiar made a few contrarian choices up front to avoid the defaults of many AI apps at the time:

- **No Linux execution environment.** There is no iSH or Linux sandbox; the execution surface is iOS native frameworks themselves.
- **No Apple Intelligence dependency.** Everything is built on public system capabilities such as EventKit, Vision, MapKit, PDFKit, Photos, and Foundation.
- **Single Agent first.** Rather than starting with complex multi-agent orchestration, it focuses on one primary Agent that plans, calls tools, and executes, then extends through clear Tools.
- **Local first.** Conversation history, attachments, and tool records stay on-device; documents are converted locally before their converted text is sent to the model.

These choices give the product a clear identity: not squeezing a generic agent into a phone, but opening up the capabilities the phone already has.

## Single Agent and the Tool Abstraction

The core is a single-Agent Runtime that only knows three things: `ToolDefinition`, `ToolCall`, and `ToolResult`. The agent loop is bounded: iteration count, tool-result length, and context size are all limited, duplicate tool calls within a run are rejected, and a write can be submitted successfully only once per run.

Tools are the core abstraction. Calendar, Vision, PDF, and Maps are all just Tools registered in a Capability Registry — small, orthogonal, and composable. The current implementation registers eight tools: two device-information, two read-only Web (search and fetch), and four EventKit tools. New Apple frameworks or a remote MCP Server would arrive through adapters rather than changes to the kernel.

The UI is runtime-event driven: a timeline renders Agent events (model thinking, tool progress, approval, success, and failure) instead of each tool owning its own interface.

## Permission Model

Familiar's security boundaries are enforced by code, not by prompt. Current authorization behavior has five tiers:

| Operation | Default behavior |
|---|---|
| Read + low risk | Automatic |
| Reversible write | Structured confirmation, then an in-process one-shot Undo |
| Inferred write | Structured confirmation |
| Sensitive read | Permission or policy |
| Destructive / financial | Strong confirmation |

EventKit writes must show the target calendar, title, time, notes, and other fields for per-action confirmation before execution. The model cannot bypass HealthKit permissions, delete confirmations, or sensitive-data policy with a sentence. System entries — Share Extension, App Intent, and Deep Link — never grant write authority.

## Local Documents and Voice

Documents are processed on-device before reaching the model. Office, OpenDocument, RTF, EPUB, CSV, and PDF files are first copied to the app's private directory, then converted to Markdown by the embedded AnyDoc engine; scanned PDFs use Vision OCR for pages without a text layer. Only the converted text and filename enter the model request — original bytes, local paths, and security-scoped URLs are never sent to a provider.

Image handling is also a Tool rather than a forced pipeline: the Agent decides whether a task needs Vision OCR, barcode detection, or the multimodal model.

Voice input uses Apple Speech and `AVAudioEngine` to produce an editable text draft, and original recordings are not stored.

## System Entry

Familiar reaches the same draft and Runtime from many system entry points: a Share Extension stages text, web links, or documents into the App Group inbox; typed Deep Links only restore or prefill context; Siri and Shortcuts expose `Ask Familiar`, `Process with Familiar`, and `Open Familiar`; a protected on-device Spotlight index can reopen past conversations; and a launcher Widget and Control Center Control are available on the Home and Lock screens.

Answers render in a bundled local WebKit with support for Markdown, syntax highlighting, tables, block quotes, Mermaid, KaTeX, code copying, and safe external links.

## Provider Support

The model layer sits behind a small Provider abstraction, with each provider keeping its own Keychain item, endpoint configuration, and model-catalog policy:

| Protocol | Providers |
|---|---|
| OpenAI Chat | OpenAI, DeepSeek, Groq, xAI, OpenRouter, Qwen, Kimi, GLM, MiniMax, SiliconFlow, custom OpenAI-compatible |
| Anthropic Messages | Anthropic |
| Gemini generateContent | Gemini |

## Technical Architecture

Familiar is evolving toward six layers: System Entry, Agent Runtime, Capability Registry, Execution Policy, Native Layer, and State Layer. Current implementation covers system entry, a bounded sequential tool loop, structured EventKit approval, read-only Web, Project instructions and document resources, immutable input-context records, and summary Run/Step persistence.

| Area | Technology |
|---|---|
| UI | SwiftUI |
| Local persistence | SwiftData |
| Networking | URLSession, SSE streaming |
| Secrets | iOS Keychain |
| Rich content | Bundled WebKit with Markdown, Mermaid, and KaTeX resources |
| Native tools | EventKit |
| Documents | AnyDoc (Rust core), PDFKit, Vision |
| Voice input | Speech, AVFoundation |
| Photos | PhotosPicker |
| Website | Vue 3, Vite, GitHub Pages |

## Deliberate Scope Boundaries

Familiar explicitly leaves out what the current phase does not need: no iPad support, no account system, no subscription or managed quota, no Linux execution environment, no shell or arbitrary code execution, no multi-agent orchestration, no heavy RAG vector databases, no MCP Server (a client may arrive later), and no Core ML LLM or Apple Intelligence dependency. Project-scoped document resources are shipped; Artifact, a writable workspace, and resumable execution are the next layer.

## Links

- **GitHub Repository**: [IsaacHuo/Familiar](https://github.com/IsaacHuo/Familiar)
- **Website**: [https://isaachuo.github.io/familiar/](https://isaachuo.github.io/familiar/)
- **Privacy**: [https://isaachuo.github.io/familiar/privacy/](https://isaachuo.github.io/familiar/privacy/)
