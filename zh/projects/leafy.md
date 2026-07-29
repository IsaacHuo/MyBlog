---
title: "MyLeafy：以课表为核心的校园 iOS 应用"
date: 2026-07-01
author: 霍玮放
description: "面向高校学习与校园生活的原生 iOS 应用，目前主要服务北京林业大学，以课表和学业数据为核心连接教务、社区与校园工具。"
editLink: true
outline: [2, 3]
---

# MyLeafy：以课表为核心的校园 iOS 应用

MyLeafy 是我独立开发的校园 iOS 应用，目前主要服务北京林业大学。它从课表出发，把成绩、考试、培养方案、空教室、学习记录、校园社区和共享课表放进同一个原生客户端。iOS App、Supabase 后端、官网和运营后台均由我独立完成，目前已服务 5000+ 用户。

仓库、Xcode target 和部分历史类型仍使用 `leafy` / `Leafy`，对外产品名称统一为 MyLeafy。项目已经引入校园能力配置，完整的教务适配目前集中在北京林业大学。

项目入口：[GitHub 仓库](https://github.com/IsaacHuo/MyLeafy) · [文档中心](https://github.com/IsaacHuo/MyLeafy/tree/main/docs) · [项目总览](https://github.com/IsaacHuo/MyLeafy/blob/main/docs/product/overview.md) · [App 产品设计](https://github.com/IsaacHuo/MyLeafy/blob/main/docs/design/app-design.md) · [架构说明](https://github.com/IsaacHuo/MyLeafy/blob/main/docs/engineering/architecture.md) · [UI 风格规范](https://github.com/IsaacHuo/MyLeafy/blob/main/docs/design/ui-style-guide.md) · [Supabase 接入](https://github.com/IsaacHuo/MyLeafy/blob/main/docs/engineering/supabase.md) · [运营后台](https://github.com/IsaacHuo/MyLeafy/blob/main/docs/engineering/admin-console.md)

<div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; align-items: flex-start;">
  <img src="/project-images/myleafy/calendar.jpg" alt="MyLeafy 课表展示" width="220" loading="lazy" style="max-width: 100%; border-radius: 16px;">
  <img src="/project-images/myleafy/grade.jpg" alt="MyLeafy 成绩展示" width="220" loading="lazy" style="max-width: 100%; border-radius: 16px;">
  <img src="/project-images/myleafy/xuefen.jpg" alt="MyLeafy 学分展示" width="220" loading="lazy" style="max-width: 100%; border-radius: 16px;">
  <img src="/project-images/myleafy/zongsu.jpg" alt="MyLeafy 综素测算展示" width="220" loading="lazy" style="max-width: 100%; border-radius: 16px;">
  <img src="/project-images/myleafy/sharecal.jpg" alt="MyLeafy 共享课表展示" width="220" loading="lazy" style="max-width: 100%; border-radius: 16px;">
  <img src="/project-images/myleafy/community.jpg" alt="MyLeafy 社区展示" width="220" loading="lazy" style="max-width: 100%; border-radius: 16px;">
  <img src="/project-images/myleafy/color.jpg" alt="MyLeafy 主题色展示" width="220" loading="lazy" style="max-width: 100%; border-radius: 16px;">
</div>

## 产品结构

当前公开版本由四个根 Tab 组成：

| Tab | 主要内容 |
|---|---|
| **课表** | 全学期周课表、课程详情、备注、提醒、考试与日程投射、课表背景、分享和 Widget |
| **社区** | 帖子、图片与附件、评论、点赞、收藏、投票、通知、公告、举报和屏蔽 |
| **校园** | 成绩、考试、培养方案、空教室、学习空间、体育、职业规划、考研信息和结构化评价 |
| **我的** | 社区资料、个人内容、共享课表、外观与显示设置、数据管理、反馈和退出登录 |

课表是最高频入口。用户打开 App 后，可以先确认今天的课程和地点，再进入成绩、考试、教室、学习记录等更具体的任务。“校园”页负责容纳不断扩展的工具，根导航因此保持稳定。

MyLeafy AI 的客户端、后端和商品配置仍保留在项目中。2.9 build 22 暂时隐藏了公开入口和购买流程，当前公开版本集中完善免费功能、稳定性和审核合规。

## 数据边界

MyLeafy 同时连接学校系统、本机存储和 Supabase。三类数据各有明确来源：

| 数据 | 来源与处理方式 |
|---|---|
| 课表、成绩、考试、教学计划、培养方案、空教室 | 来自北京林业大学强智教务系统，由 App 在用户登录后读取并缓存在本机 |
| 课程备注、提醒、学习资料、任务、体测等个人记录 | 默认保存在本机 SwiftData 或 App 私有目录 |
| 社区内容、通知、公告、共享授权、评价与运营配置 | 保存在 Supabase，并通过用户会话、RLS、校园范围和资源所有权控制访问 |

学校教务系统仍是学业数据的权威来源。MyLeafy 保存最近一次成功获取的数据，学校服务暂时不可用时仍可查看缓存。需要多人协作或跨设备的数据再按需进入远程后端，共享课表也只上传用户主动发布的字段。

## 课表与时间

北林教务系统主要返回 HTML 页面，页面入口、Cookie 行为和结构都可能变化。MyLeafy 使用 `URLSession`、显式 Cookie 管理和 SwiftSoup 完成教务访问与解析，必要时通过 `WKWebView` 复现浏览器访问路径。

课表固定保留 20 周容器，实际课程周次完全以教务响应为准。学期查询参数和首周日期由远程运行配置提供，正常换学期无需发布新版 App。页面支持周次切换、重叠课程布局、课程备注、提醒、考试与个人日程投射、年度视图、照片或纯色背景、小组件和深链跳转。

日程能力围绕课表继续扩展：自定义安排在当前学期范围内投射到课表，范围外显示为倒计时；考试和重要日期按规则生成提醒。用户仍从熟悉的时间界面出发，无需在多个日历页面之间反复切换。

为了减少复杂课表网格的渲染开销，课程布局、提醒、考试和日期信息会提前生成不可变的展示快照。这个方案来自一次真实的 iPhone 卡顿与 SwiftData 生命周期排查，也让我更明确地区分了数据计算、持久化和 SwiftUI 渲染的职责。

## 校园与学习

“校园”页把分散的学生事务按任务组织起来：

- 教学培养：成绩、成绩分析、考试、荣誉记录、综合测评、教学计划和培养方案。
- 时间日程：年度视图、校历、考试、自定义日程和倒计时。
- 空闲教室：按日期与节次查询空教室、查看指定教室占用并记录专注时间。
- 学习空间：管理学习项目、资料、任务和记录。
- 校园工具：体育记录、场馆信息、职业规划、考研信息、结构化评价，以及按校园配置开放的扩展功能。

不同校园只显示已经适配的入口。北京林业大学拥有完整的教务连接和主要社区能力，自定义校园可以继续使用部分本地学习与日程工具。首页横幅、入口状态和校园内容可以通过运营后台按校园配置，更新这些信息无需重新发布客户端。

## 社区与共享

社区建立在 Supabase 上，教务身份和社区会话分别管理。同一教务身份可以在不同设备继承同一份社区资料和内容。

帖子支持文本、最多 4 张图片，以及最多 2 个 PDF、XLSX、DOCX 或 Markdown 附件。普通帖草稿按账号保存在本机，发布前完成压缩、类型检查和上传校验；所有资源准备完成后，帖子才进入公开状态。分享卡以 JPEG 在本机生成，不会因为分享动作额外上传用户内容。

评论最多两层，通知通过 Realtime 更新。举报进入后台处理流程，屏蔽会让对应用户的帖子、评论和通知在当前账号下不可见。后台还负责公告、校园横幅、内容治理、目录维护、角色权限和审计。

共享课表使用一次性邀请码和只读授权。用户可以主动发布、查看共享关系并随时撤销，成绩、备注和提醒不进入共享数据。

## MyLeafy AI

MyLeafy AI 目前没有公开入口，项目中保留的实现包括：

- 默认使用服务端 Flash 额度，也支持用户自备 DeepSeek API Key；自备 Key 保存在 Keychain，并由设备直连模型服务。
- 在用户允许的范围内读取课表、考试等有限本机上下文。
- 通过受控工具进行联网研究，优先检索北林官网，并可读取网页、带文本层的 PDF 和有限范围的 XLSX。
- 将报告、清单、表格和流程等复杂结果生成 Artifact，进入独立阅读页查看和导出。
- 仅准备导航、提醒或日程等可检查动作，不直接修改学校数据或代替用户发布社区内容。

这部分会在功能完整性、额度验签和审核流程稳定后再恢复公开入口。

## 设计与技术架构

MyLeafy 以 SwiftUI 构建页面和导航，最低支持 iOS 17。所有系统版本使用原生 `TabView`，iOS 26 自然采用系统 Liquid Glass 外观，低版本保留稳定的原生体验。课表支持浅色、深色、主题色、显示密度、照片和纯色背景；个性化背景只保存在本机，也不会出现在分享图或 Widget 中。

| 范围 | 技术 |
|---|---|
| iOS UI | SwiftUI |
| 本地持久化 | SwiftData、Keychain、App 私有文件 |
| 教务网络与解析 | URLSession、HTTPCookieStorage、WKWebView、SwiftSoup |
| 业务后端 | Supabase Auth、PostgreSQL、Storage、Realtime、Edge Functions |
| 运营后台 | React、React-admin、MUI、ECharts、Vite、TypeScript |
| 边缘代理 | Cloudflare Pages Functions |
| 自动化检查 | GitHub Actions、Vitest、Playwright、XCTest |

客户端按 Presentation、Application、Domain 和 Data 分层。学校数据、本机数据和 MyLeafy 云端数据拥有各自的权威来源；跨用户、高权限和管理操作必须经过服务端认证、参数校验与审计。运营后台通过 Cloudflare Pages Functions 访问管理能力，高权限会话保存在 HttpOnly Cookie 中，浏览器端无法读取服务端密钥。

## 当前重点

项目已经形成 iOS、Supabase 和 Web 管理三端架构。现阶段的重点是提高教务解析稳定性和故障恢复质量，统一校园能力配置，连接课表、日程与学习空间，并继续收紧身份绑定、共享、导出和管理操作的安全边界。

这个项目让我经历了一个产品从数据源、客户端、后端权限、运营工具到 App Store 审核的完整链路。很多工程边界来自真实问题：教务页面变化促成了多路径解析，课表卡顿和崩溃促成了值类型展示快照，社区内容增长促成了上传校验、后台权限和审计。它们比单独完成一个页面更接近真实的软件开发。
