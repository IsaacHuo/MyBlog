---
title: "PolyBot / Polymarket Predictor，本地预测市场研究系统"
date: 2026-06-30
author: 霍玮放
description: "面向 Polymarket 的本地优先研究与 paper-trading 系统，围绕 15 分钟 BTC/ETH 市场、新闻信号、虚拟组合和风控默认值构建。"
editLink: true
outline: [2, 3]
---

# PolyBot / Polymarket Predictor，本地预测市场研究系统

PolyBot 是我为 Polymarket 研究和模拟交易构建的本地优先系统。当前阶段明确以 paper / shadow 模式为主，通过本地仪表盘观察市场、策略、虚拟订单和组合表现，不开放真实交易。

## 项目定位

这个项目关心的是“先研究、先模拟、再验证”的预测市场工作流。它面向个人 Mac 的研究与风控沙盒，用来持续观察 BTC/ETH 15 分钟市场、新闻信号和策略表现，并不追求直接上线自动交易。

系统默认关闭 live trading，仪表盘启动也会强制进入 `SHADOW` 模式。真实 CLOB 交易能力被放在后续迁移门禁之后，只有完成长时间 paper/shadow 验证、Mock 测试和合规检查后才会考虑启用。

## 已实现能力

当前守护进程包含几条主要循环。

- 新闻采集与 LLM 市场研究信号。
- DeepSeek 预测生成，用于 `llm_news_edge` 策略。
- BTC/ETH 15 分钟市场扫描与候选市场展示。
- paper broker、虚拟订单、虚拟持仓和结算状态。
- heartbeat、kill switch 和 live safety 相关基础设施。

当前重点策略是 `reverse_15m_grid`。它扫描 Gamma 的 15 分钟事件，过滤 BTC/ETH up/down 市场，读取 outcome token orderbook，并在虚拟账户中提交、撮合、过期和结算 paper-only limit order。

## 技术实现

PolyBot 使用 Python 构建，核心包括 Typer CLI、FastAPI + Jinja2/HTMX 本地仪表盘、SQLite WAL 数据库、macOS Keychain 凭据边界、市场数据客户端、策略注册、paper broker 和风险状态管理。

仪表盘默认只绑定 `127.0.0.1:8080`，提供 Start/Stop 控制、策略矩阵、组合比较、候选市场、虚拟订单、持仓、NO_TRADE / NO_FILL 诊断和日志查看。数据和日志保存在本地 `data/` 目录，方便复盘。

## 工程收获

这个项目让我把“交易想法”拆成了可观察的工程系统。市场数据、信号、策略、订单、风控、日志和操作界面必须彼此隔离，又要能在一个本地流程里联动。相比直接追求收益，PolyBot 更强调可复盘、可暂停、默认安全和长期模拟证据。

## 链接

- **GitHub 仓库** [IsaacHuo/polymarket-predictor](https://github.com/IsaacHuo/polymarket-predictor)
