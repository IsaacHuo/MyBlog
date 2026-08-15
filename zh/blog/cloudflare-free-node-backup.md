---
title: Cloudflare 免费节点搭建方案备份
date: 2026-05-15
category: 技术
description: 对零度博客 Cloudflare 免费节点搭建文章的备份摘要，保留来源、关键思路和后续查阅入口。
tags:
  - Cloudflare
  - VPN
  - 备份
---

# Cloudflare 免费节点搭建方案备份

> 这篇是外部文章的备份摘要，不做全文转载。后续如果要实际操作，应优先阅读原文和对应开源项目文档。

## 来源

- 原文标题，2026 最强 Cloudflare 免费节点！永久可用+免费域名｜10分钟搭建｜解锁 ChatGPT / Gemini ！
- 原文链接 [零度博客](https://www.freedidi.com/23618.html)
- 原文发布时间，2026-04-02
- 备份时间，2026-05-15

## 核心思路

原文介绍的是一种基于 Cloudflare Pages、Worker KV 和开源代理面板的轻量部署方案。大致流程是先准备一个可托管到 Cloudflare 的域名，然后在 Cloudflare 中创建 KV 命名空间和 Pages 项目，再上传开源程序包、配置环境变量、绑定 KV 与自定义域，最后通过后台生成节点或订阅地址并导入客户端。

这类方案的关键依赖有三个。

- **域名**，用于接入 Cloudflare 和绑定 Pages 自定义域。
- **Cloudflare Pages / KV**，承载 Web 面板、配置存储和部署入口。
- **客户端订阅**，将生成的 VLESS、Trojan 等协议配置导入到对应代理客户端。

## 操作脉络

1. 准备免费域名，并把域名接入 Cloudflare。
2. 在 Cloudflare 后台创建 Worker KV 命名空间。
3. 创建 Pages 项目，上传开源程序包完成部署。
4. 在 Pages 设置中添加生产环境变量，例如后台管理员密码。
5. 给 Pages 绑定 KV 命名空间，确保面板可以保存配置。
6. 给 Pages 配置自定义域，使用 CNAME 指向 Pages 分配的地址。
7. 访问后台，生成节点链接或自适应订阅地址。
8. 将订阅导入 V2Ray、Clash、Sing-box、Surge 等客户端。

## 原文提到的能力

- 支持 VLESS、Trojan 等常见协议。
- 提供可视化管理面板，可修改配置并查看运行状态。
- 支持 Cloudflare Workers / Pages 部署路径。
- 可生成适配不同客户端的订阅。
- 支持 ProxyIP、链式代理和优选 API 等进阶配置。
- 覆盖 Windows、Android、iOS、macOS 和软路由等常见使用环境。

## 注意事项

- Cloudflare、域名服务商和开源项目都可能调整规则，实际可用性需要以当前页面和项目文档为准。
- 不要在公开仓库提交后台密码、订阅链接、节点配置、Token 或其它私密凭据。
- 如果只是自用，建议记录自己的域名、KV 名称、Pages 项目名和部署包版本，方便后续排查。
- 这类方案涉及网络连接与代理服务，使用前应确认符合所在地区的法律法规和服务条款。

## 备份结论

这篇文章适合作为 Cloudflare Pages + KV 代理面板搭建方案的索引。值得留下的是部署路径、依赖关系和原文入口，而不是固定某一次截图或具体节点配置，因为这些细节最容易随时间失效。
