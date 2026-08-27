---
title: "Yarn，JavaScript 包管理器的另一条路线"
date: 2026-01-29
category: 技术
author: 霍玮放
description: yarn, npm, package-manager
---

# Yarn，JavaScript 包管理器的另一条路线

Facebook（现 Meta）在 2016 年联合 Google、Exponent 和 Tilde 发布 Yarn。当时 npm 的安装速度、缓存和可复现性仍有明显问题，Yarn 给出了另一套实现，也推动 npm 后续改进。

## 1. Yarn 当时解决了什么

早期 npm 安装速度较慢，对缓存和离线使用的支持有限。依赖解析还可能因为时间和环境不同而得到不同结果。

Yarn 使用并行下载、全局缓存和 `yarn.lock` 改善这些问题。开发者第一次安装依赖后，后续项目可以复用缓存；lock 文件则记录具体版本和来源，使团队更容易得到一致的依赖树。

## 2. Yarn 留下的几个重要设计

### `yarn.lock`

`yarn.lock` 固定依赖解析结果。npm 后来引入 `package-lock.json`，现在 lock 文件已经成为 JavaScript 项目的常规组成部分。

### 缓存和并行安装

Yarn 会缓存下载过的包，并发处理可并行的请求。它发布时的速度优势很明显，后来 npm 和其他包管理器也吸收了类似思路。

### Workspaces

Workspaces 让一个仓库可以管理多个 package，并处理它们之间的本地引用。这为 JavaScript Monorepo 提供了更统一的工作流。

## 3. Classic 与 Berry

Yarn v1 通常称为 Classic。它使用传统 `node_modules`，兼容性较好，也仍存在于许多老项目中。

Yarn v2 及后续版本称为 Berry。Berry 引入 Plug'n'Play（PnP），通过 `.pnp.cjs` 记录模块位置，绕过传统 `node_modules` 查找。项目可以获得更严格、更快的依赖解析，也可能遇到依赖旧式目录结构的工具。

Berry 支持 `nodeLinker: node-modules`，需要兼容传统生态时可以继续生成 `node_modules`。

## 4. 现在怎样选择

维护已有 Yarn 项目时，继续使用与 lock 文件匹配的 Yarn 大多最稳妥。新项目则可以根据团队经验、Monorepo 需求、部署环境和工具兼容性，在 npm、pnpm、Yarn 与 Bun 之间选择。

Yarn 最重要的影响，是把可复现安装、缓存和工作区能力推成了包管理器的常规要求。今天选不选 Yarn，已经不影响这段贡献。
