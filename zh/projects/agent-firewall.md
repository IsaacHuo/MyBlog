---
title: "Agent-Firewall，OpenClaw Agent 安全壳"
date: 2026-05-15
author: 霍玮放
description: "包裹本地 OpenClaw runtime 的安全中间层，为 AI Agent 工具调用加入输入扫描、工具门控、人工审批和 Trace/Audit 证据链。"
editLink: true
outline: [2, 3]
---

# Agent-Firewall，OpenClaw Agent 安全壳

Agent-Firewall 是我围绕本地 OpenClaw runtime 构建的 AI Agent 安全中间层。它位于消息入口适配器和 OpenClaw/MCP/Internal 工具之间，在能力真正执行前加入输入扫描、运行时工具门控、人工审批、输出过滤和审计追踪。

![Agent-Firewall attack playground](/project-images/agent-firewall.png)

## 核心边界

这个项目的重心放在 Agent-Firewall 对 Agent 执行链路的控制上。Telegram 只是当前已经实现并验证的消息入口适配器，用来接入真实聊天流量；真正的安全边界在 Agent-Firewall 层。

受保护链路可以概括为下面的样子。

```text
Message ingress adapter
  -> apps/agent protected runtime
  -> apps/proxy-service /v1/scan
  -> Agent runtime gates
  -> OpenClaw skill / MCP provider
  -> post-tool gate
  -> trace + audit log
  -> reply channel
```

如果输入被拦截，或敏感工具需要确认，请求会暂停并生成 intervention。操作者可以在本地控制台的 Approvals / Audit 页面审批，通过后 runtime 会携带 `approved_intervention_id` 继续执行。

## 已验证流程

本地环境已经通过 allowlisted Telegram bot 验证过完整工具流。

```text
Telegram Bridge -> /agent/chat -> /v1/scan -> pre-tool gate
  -> OpenClaw provider -> post-tool gate -> Trace / Audit -> Telegram reply
```

已验证的状态包括。

- 普通 `openclaw_summarize` 请求通过扫描、pre-tool gate、OpenClaw provider、post-tool gate，并回到 Telegram。
- 高敏工具创建 `tool_confirmation` intervention，暂停执行，审批通过后继续。
- 工具输出会被 post-tool 扫描，PII 或疑似敏感内容会在最终回复和 trace preview 前被清洗。
- 可疑输入创建 `input_block` intervention，拒绝后不会重放，也不会执行工具。

## 控制台与服务

项目由三个主要服务组成。

- `apps/proxy-service`，Agent Control Plane、`/v1/scan`、interventions、runtime specs、trace metadata 和审计日志。
- `apps/agent`，受保护 runtime，负责执行图、工具计划、pre-tool/post-tool gate 和 OpenClaw provider 调用。
- `apps/frontend`，本地操作台，包含 Attack Playground、Approvals / Audit、Bot Agents、Skills & Hooks、Trace / Audit 和 Runtime Settings。

默认本地持久化使用 SQLite，数据库位于 `~/.openclaw/agent-firewall.sqlite`。默认路径不依赖 Docker、Redis 或 Langfuse。

## 工程意义

这个项目关注的是 AI Agent 走向真实工具环境时的控制问题。谁允许它调用工具，哪些工具必须人工确认，输入和输出如何扫描，一次执行能不能被审计复盘，这些都要在运行时回答。相比单纯调用模型，Agent-Firewall 更像一层可观察、可暂停、可回放的运行时安全控制面。

## 链接

- **GitHub 仓库** [huoweifang2/agent-firewall](https://github.com/huoweifang2/agent-firewall)
