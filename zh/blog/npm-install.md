---
title: npm install，历史、原理与选择缘由
date: 2026-01-29
category: 技术
author: 霍玮放
description: npm, nodejs, engineering
---


# npm install，历史、原理与选择缘由

我一直想弄清 `npm install` 到底做了什么。一行命令可以解析依赖、下载文件、校验内容并执行安装脚本，背后涉及的问题比界面上看到的多。

- npm 是怎么把文件下载下来的？
- npm 是怎么选择 package 依赖的？
- npm 下载的是什么形式？
- 为什么选择 npm 而不是别的？
- npm 有什么优势和不足？

下面按历史、安装流程和工具选择整理。

## 1. 历史演变

npm 通常展开为 Node Package Manager，由 Isaac Z. Schlueter 在 2010 年发布，用来解决 [Node.js](nodejs.md) 模块共享和管理的问题。此前，开发者往往需要手动下载代码或使用各自的脚本。

### npm v1 与 v2，嵌套依赖

早期 npm 采用嵌套式依赖管理。如果 A 依赖 B，B 依赖 C，目录结构会变成下面这样。

```
node_modules
└── A
    └── node_modules
        └── B
            └── node_modules
                └── C
```

这种方式逻辑简单，不同包也可以使用不同版本的依赖。问题是目录很深，Windows 过去的路径长度限制尤其麻烦；相同版本的包还可能被复制多次。

### npm v3，扁平化安装

npm v3 会尽量把依赖提升（Hoisting）到顶层 `node_modules`，遇到版本冲突时再保留嵌套版本。目录深度和重复文件因此减少，但项目也可能意外访问 `package.json` 中没有声明、只是被其他依赖提升上来的包。这就是幽灵依赖。

### npm v5，lock 文件

[语义化版本 SemVer](SemVer.md) 中的 `^` 和 `~` 允许依赖更新，因此相同的 `package.json` 可能在不同时间解析出不同版本。npm v5 引入 `package-lock.json`，记录整棵依赖树的确切版本和完整性[哈希](hash.md)。

### npm v7 以后

后续版本加入了 Workspaces、自动安装 `peerDependencies` 等能力，也持续改善依赖解析和安装性能。

## 2. npm install 的原理与细节

执行 `npm install` 后，npm 大致会经历以下流程。

### 1. 构建依赖树

npm 首先读取项目的 `package.json` 和 `package-lock.json`（如果存在）。

- 如果有 lock 文件，它会尽量遵循锁定版本。
- 如果没有，它会根据 `package.json` 中的 SemVer 规则（如 `^1.0.0`）向 Registry 查询满足条件的最新版本。
- 它会计算理想的依赖树，决定哪些包可以放在顶层，哪些版本冲突需要保留嵌套。

### 2. 检查缓存

下载前，npm 会检查本地缓存（通常在 `~/.npm`），并使用完整性哈希验证内容。缓存命中时可以复用已有数据，减少网络请求。

### 3. 下载与解压

如果缓存未命中，npm 会向配置的 Registry（默认为 `registry.npmjs.org`）发起请求，下载包的 Tarball（`.tgz` 压缩包）。下载后，会校验完整性（Shasum/Integrity），然后解压到 `node_modules` 的对应位置。

### 4. 链接命令行文件

许多包（如 `webpack`、`eslint`）包含可执行文件。npm 会自动查找这些包 `package.json` 中的 `bin` 字段，并在 `node_modules/.bin/` 目录下创建符号链接（Symlink，在 Windows 上是 cmd/ps1 脚本）。这使得我们可以直接在 `scripts` 中运行这些命令，而不用输入完整路径。

### 5. 执行生命周期脚本

安装过程中会自动触发特定的脚本，如 `preinstall`、`install`、`postinstall`。这常用于编译原生模块（使用 `node-gyp`）或执行一些构建准备工作。

## 3. 为什么 npm 能下载

这归功于 **npm Registry** 和 **HTTP 协议**。

### 集中式仓库

npm Registry 保存包的版本、依赖和压缩包地址。

1. 发布者运行 `npm publish`，代码会被打包成 Tarball，并连同版本、依赖和作者等元数据上传。
2. Registry 保存这些元数据。
3. 安装时，npm 通过 HTTP 请求取得 JSON 元数据，解析 `tarball` 地址，再下载对应文件。

### 全球 CDN

Registry 通过 CDN 分发包文件，减少不同地区访问源站的延迟。实际下载速度还取决于网络、镜像和本地缓存。

## 4. 为什么选择 npm

选择 npm 最直接的理由，是它随 Node.js 一起安装，团队通常无需增加一套工具。Yarn、[pnpm](pnpm.md) 和 [Bun](bun.md) 也各有适用场景。

### 1. 默认可用

npm 随 Node.js 分发。对普通项目来说，使用现成工具可以减少环境配置和团队约定。

### 2. 生态兼容

JavaScript 生态中的主流框架、工具和库大多发布到 npm Registry。使用其他包管理器时，通常也还是从同一个 Registry 获取包。

### 3. 安全工具

- 2FA 可以降低发布账号被盗的风险。
- `npm audit` 会对照漏洞数据库检查依赖树。
- Provenance 用于记录和验证包的构建来源。

这些机制能降低一部分风险，无法代替依赖审查、最小权限和及时更新。

### 4. 维护成本较低

npm 已经支持 lock 文件、缓存和 Workspaces。对没有特殊磁盘占用或 Monorepo 要求的项目，它通常足够用。

## 怎样选择

`npm install` 会解析依赖、读取缓存、下载并校验包、建立命令链接，还可能执行安装脚本。理解这条流程后，排查 lock 文件冲突、缓存问题和供应链风险会容易很多。

新项目可以先使用 npm。磁盘占用、Monorepo 或特定工作流出现明确问题时，再比较 pnpm、Yarn 和 Bun，判断迁移收益是否足够。

## 参考资料

- [npm 官方文档](https://docs.npmjs.com/)
