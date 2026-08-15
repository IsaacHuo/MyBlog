---
title: 计算机术语缩写全称收集
date: 2026-01-25
category: 技术
author: 霍玮放
description: 
---

> 我习惯先查计算机缩写的英文全称。名字不能代替完整定义，但经常能提示这个概念最初要解决的问题。

计算机领域到处是缩写。只记中文译名，很容易把彼此相关的概念学成零散词条。这份清单保留英文全称，再用一两句话解释名称与用途之间的关系。

## 1. Web 开发基础 (Frontend & Web)

Web 是缩写词用得最广泛的地方，理解这些全称能帮你理清网页是如何构建和交互的。

*   `HTML`（**HyperText Markup Language**），超文本标记语言。“超文本”意味着链接，能跳转；“标记”意味着结构。它是结构语言，不属于编程语言。
*   `CSS`（**Cascading Style Sheets**），层叠样式表。“层叠”（Cascading）解释了多条规则应用到同一元素时如何决定结果。优先级会受到来源、重要性、层、特指度和定义顺序等因素影响。
*   `DOM`（**Document Object Model**），文档对象模型。把 HTML 文档转换成编程语言（如 JS）可以操作的“对象”树结构。
*   `JSON`（**JavaScript Object Notation**），JavaScript 对象表示法。一种轻量级的数据交换格式，源于 JS 的对象语法，但现在语言无关。
*   `AJAX`（**Asynchronous JavaScript and XML**），异步 JavaScript 和 XML。虽然现在我们多用 JSON 代替 XML，但这个术语依然代表了“不刷新页面的情况下与服务器通信”的技术。
*   `SPA`（**Single Page Application**），单页应用程序。整个应用只有一个 HTML 页面，通过 JS 动态更新内容，提供类似原生应用的体验。
*   `SEO`（**Search Engine Optimization**），搜索引擎优化。让 Google 或百度能更好地理解（抓取）你的网站内容。
*   `npm`（**Node Package Manager**），Node 包管理器。世界上最大的软件注册表。虽然现在官方有时玩梗说它不代表任何东西，但历史上它确实是为了管理 Node.js 模块而诞生的。

## 2. 网络与协议 (Network & Protocols)

这些缩写定义了数据如何在互联网上流动。全称往往直接揭示了它们所在的 OSI 模型层级或功能。

*   `HTTP`（**HyperText Transfer Protocol**），超文本传输协议。Web 的基石。
*   `URL`（**Uniform Resource Locator**），统一资源定位符。它描述资源的位置和访问方式，是 URI 的一种。
*   `DNS`（**Domain Name System**），域名系统。互联网的电话簿，把人类可读的 `google.com` 翻译成机器可读的 IP 地址。
*   `TCP / IP`（**Transmission Control Protocol / Internet Protocol**），传输控制协议 / 互联网协议。IP 负责寻址和分组传递，TCP 在其上提供有序、可靠的字节流。
*   `REST`（**Representational State Transfer**），表现层状态转换。一种软件架构风格。资源（Resource）以某种形式（Representation，如 JSON）在客户端和服务器之间传递（Transfer），从而改变状态（State）。
*   `API`（**Application Programming Interface**），应用程序编程接口。软件之间对话的契约。
*   `CORS`（**Cross-Origin Resource Sharing**），跨域资源共享。浏览器的一种安全机制，全称告诉我们它是为了控制不同“源”（Origin）之间如何共享资源。

## 3. 后端与数据库 (Backend & Database)

*   `CRUD`（**Create, Read, Update, Delete**），增删改查。几乎所有数据驱动应用的最基本操作。
*   `SQL`（**Structured Query Language**），结构化查询语言。用于管理关系型数据库的标准语言。
*   `NoSQL`（**Not Only SQL**），Not Only SQL。这是覆盖多类非关系型数据库的宽泛称呼，各种数据库的数据模型、一致性和扩展方式差异很大。
*   `ORM`（**Object-Relational Mapping**），对象关系映射。把代码中的“对象”自动映射到数据库中的“关系表”，让你不用写 SQL 就能操作数据库。
*   `MVC`（**Model-View-Controller**），模型-视图-控制器。一种经典的架构模式，将业务逻辑（Model）、界面展示（View）和用户输入处理（Controller）分离。

## 4. 运维与基础设施 (DevOps & Infrastructure)

*   `CI / CD`（**Continuous Integration / Continuous Delivery or Deployment**），持续集成 / 持续交付（或部署）。“持续”意味着频繁、自动化。代码一提交就自动测试（CI），测试通过就自动准备发布（CD）。
*   `IaaS / PaaS / SaaS`（**Infrastructure as a Service / Platform as a Service / Software as a Service**），基础设施即服务（如 AWS EC2）、平台即服务（如 Vercel、Heroku）、软件即服务（如 Gmail、Notion）。核心在于“X 即服务”，你为服务付费，而不必自己维护 X。
*   `SSH`（**Secure Shell**），安全外壳协议。用于在不安全的网络上安全地操作远程计算机。
*   `VPN`（**Virtual Private Network**），虚拟专用网络。在公网上建立一条加密的、私有的隧道。

## 5. 安全 (Security)

全称通常描述了攻击的方式或防御的机制。

*   `XSS`（**Cross-Site Scripting**），跨站脚本攻击。为了不与 CSS 混淆缩写为 XSS。核心是攻击者往别人的网站里注入恶意脚本（Scripting）。
*   `CSRF`（**Cross-Site Request Forgery**），跨站请求伪造。攻击者诱导用户的浏览器去访问一个他们已登录的网站，伪造（Forgery）用户意愿发送请求。
*   `DDOS`（**Distributed Denial of Service**），分布式拒绝服务攻击。利用大量的“肉鸡”（Distributed）同时访问，耗尽目标服务器资源，使其无法提供服务（Denial of Service）。
*   `SSL / TLS`（**Secure Sockets Layer / Transport Layer Security**），安全套接层 / 传输层安全。HTTPS 中的 "S"。TLS 是 SSL 的继任者，虽然大家习惯叫 SSL，但现在用的技术其实是 TLS。

## 6. 其他常见缩写

*   `GUI / CLI`（**Graphical User Interface / Command Line Interface**），图形用户界面 / 命令行界面。
*   `IDE`（**Integrated Development Environment**），集成开发环境。比如 VS Code、WebStorm。集成了编辑、调试、构建等功能。
*   `SDK`（**Software Development Kit**），软件开发工具包。第三方提供的“工具箱”，帮你快速集成他们的功能（如微信登录 SDK）。
*   `UUID`（**Universally Unique Identifier**），通用唯一识别码。保证在时间和空间上的唯一性，不用担心 ID 冲突。

---

> 这份清单会继续更新。查出全称只是起点，下一步还要回到协议、代码或官方文档，确认它在具体上下文中的含义。
