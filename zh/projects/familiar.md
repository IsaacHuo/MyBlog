---
title: "Familiar，给 iPhone 的原生个人 AI 工作台"
date: 2026-08-14
author: 霍玮放
description: "为 iPhone 打造的原生、安全、可检查的个人 AI 工作台。单 Agent Runtime、Tool 抽象与 BYOK 模式，让设备原生能力成为可组合、可治理的执行面。"
editLink: true
outline: [2, 3]
---

# Familiar，给 iPhone 的原生个人 AI 工作台

Familiar 是我为 iPhone 开发的个人 AI 工作台。它以聊天为主要入口，让模型通过原生工具（日历、提醒、文档、地图、照片等）在设备上完成真实任务，把 iPhone 的系统能力转成一个可组合、可治理的执行面。

项目采用 BYOK 模式。用户使用自己的模型 API Key，模型请求从设备直接发送到所选 Provider，会话、附件和工具记录都保存在本机，不经过任何 Familiar 服务器。App 没有账户、没有订阅，也没有托管额度。

![Familiar](/project-images/familiar.png)

## 设计取舍

Familiar 从一开始就做了几个相反的取舍，来避开当时主流 AI App 的默认做法。

- **不用 Linux 执行环境**。Familiar 不引入 iSH 或 Linux 沙箱，执行面就是 iOS 原生框架本身。
- **不依赖 Apple Intelligence**。功能建立在 EventKit、Vision、MapKit、PDFKit、Photos 和 Foundation 这些公开系统能力上。
- **坚持单 Agent**。不从复杂多 Agent 编排开始，而是先做好一个能规划、能调用工具、能执行的主 Agent，用清晰的 Tools 扩展能力。
- **本地优先**。会话历史、附件和工具记录留在本机，文档在本机转换后才把转换后的文本发给模型。

这套取舍让产品的定位很清楚。Familiar 要做的是把手机本来就有的能力开放给 Agent。

## 单 Agent 与工具抽象

Familiar 的核心是一个单 Agent Runtime，它只认识三种东西，`ToolDefinition`、`ToolCall` 和 `ToolResult`。Agent 循环有界运行，限制迭代次数、工具结果长度和上下文大小；重复的工具调用会被拒绝，一次写入在一次运行内只能提交成功一次。

Tool 是最核心的抽象。Calendar、Vision、PDF、Maps 在架构上都是注册在 Capability Registry 里的 Tool，每个工具小而正交、可组合。当前实现注册了八个工具，包括两个设备信息、两个只读 Web（搜索与抓取）和四个 EventKit 工具。新增 Apple Framework 或远程 MCP Server，主要通过 Adapter 接入，而不是改内核。

运行时用事件驱动界面。时间线直接渲染 Agent 事件（模型思考、工具进度、审批、成功与失败），而不是每个工具自己造一套 UI。

## 权限模型

Familiar 的安全边界由代码强制，不靠提示词约束。当前授权行为分五级。

| 操作 | 默认行为 |
|---|---|
| 读取且低风险 | 自动执行 |
| 可逆写入 | 结构化确认，成功后提供进程内一次性 Undo |
| 推断式写入 | 结构化确认 |
| 敏感读取 | 权限或策略 |
| 破坏性/财务类 | 强确认 |

EventKit 的写入必须逐次展示目标日历、标题、时间、备注等字段，用户确认后才执行。模型不能用一句话绕过健康权限、删除确认或敏感数据策略。系统入口（Share Extension、App Intent、Deep Link）永远不会获得写入授权。

## 本地文档与语音

文档在进入模型前都在本机处理。Office、OpenDocument、RTF、EPUB、CSV 和 PDF 先复制到 App 私有目录，再由内置的 AnyDoc 引擎转换为 Markdown；扫描 PDF 在缺少文本层时用 Vision OCR 补识别。只有转换后的文本和文件名进入模型请求，原始字节、本地路径和 security-scoped URL 从不发送给 Provider。

图片处理也是 Tool，而不是固定管线，由 Agent 根据任务决定走 Vision OCR、条码识别还是多模态模型。

语音输入使用 Apple Speech 和 `AVAudioEngine` 生成可编辑的文字草稿，不保存原始录音。

## 系统入口

Familiar 从多个系统入口进入同一套草稿和 Runtime。Share Extension 把文本、网页链接或文档收进 App Group 收件箱；类型化 Deep Link 只恢复或预填上下文；Siri 与快捷指令提供 `Ask Familiar`、`Process with Familiar` 和 `Open Familiar`；受保护的本地 Spotlight 索引可以重新打开历史会话；桌面还有启动 Widget 和控制中心的 Control。

回答渲染使用内置的本地 WebKit，支持 Markdown、代码高亮、表格、引用、Mermaid、KaTeX、代码复制和安全外链。

## Provider 支持

模型层通过简单的 Provider 抽象接入多家服务，每个 Provider 拥有独立的 Keychain 存储、端点和模型目录策略。

| 协议 | Providers |
|---|---|
| OpenAI Chat | OpenAI、DeepSeek、Groq、xAI、OpenRouter、Qwen、Kimi、GLM、MiniMax、SiliconFlow、自定义 OpenAI-compatible |
| Anthropic Messages | Anthropic |
| Gemini generateContent | Gemini |

## 技术架构

Familiar 正在向六层架构演进，包括系统入口层、Agent Runtime、Capability Registry、执行策略层、原生层和状态层。当前实现覆盖系统入口、有界顺序工具循环、EventKit 结构化审批、只读 Web、项目指令与文档资源、不可变输入上下文记录和 Run/Step 摘要持久化。

| 范围 | 技术 |
|---|---|
| UI | SwiftUI |
| 本地持久化 | SwiftData |
| 网络 | URLSession、SSE 流式 |
| 密钥 | iOS Keychain |
| 富文本 | 内置 WebKit，打包 Markdown、Mermaid 与 KaTeX 资源 |
| 原生工具 | EventKit |
| 文档 | AnyDoc（Rust core）、PDFKit、Vision |
| 语音输入 | Speech、AVFoundation |
| 照片 | PhotosPicker |
| 官网 | Vue 3、Vite、GitHub Pages |

## 明确的边界

Familiar 明确不做当前阶段不必要的东西，包括 iPad 支持、账户系统、订阅或托管额度、Linux 执行环境、shell 或任意代码执行、多 Agent 编排、复杂 RAG 向量库、MCP Server（客户端可能后续加入），也不依赖 Core ML LLM 或 Apple Intelligence。Project 共享文档资源已经落地，Artifact、可写 Workspace 和可恢复执行是下一阶段能力。

## 链接

- **GitHub 仓库** [IsaacHuo/Familiar](https://github.com/IsaacHuo/Familiar)
- **官网** [https://isaachuo.github.io/familiar/](https://isaachuo.github.io/familiar/)
- **隐私说明** [https://isaachuo.github.io/familiar/privacy/](https://isaachuo.github.io/familiar/privacy/)
