---
title: "MyLeafy：以课表为核心的校园 iOS 应用"
date: 2026-08-15
author: 霍玮放
description: "面向高校学习与校园生活的原生 iOS 应用，目前主要服务北京林业大学，以课表和学业数据为核心连接教务、社区、日迹与校园工具。"
editLink: true
outline: [2, 3]
---

# MyLeafy：以课表为核心的校园 iOS 应用

MyLeafy 是我独立开发的校园 iOS 应用，目前主要服务北京林业大学。它从课表出发，把成绩、考试、培养方案、空教室、学习记录、校园社区、日迹和共享课表放进同一个原生客户端。iOS App、Supabase 后端、官网和运营后台均由我独立完成，目前已服务 5000+ 用户。

仓库、Xcode target 和部分历史类型仍使用 `leafy` / `Leafy`，对外产品名称统一为 MyLeafy。项目已经引入校园能力配置，北京林业大学拥有完整的教务适配和主要社区能力，其他校园只显示其明确支持的功能。

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

当前根导航由五个根 Tab 组成：

| Tab | 主要内容 |
|---|---|
| **课表** | 按学年浏览的周课表、课程详情、备注、提醒、考试与日程投射、课表背景、分享和 Widget |
| **社区** | 帖子、图片与附件、评论、点赞、收藏、投票、通知、公告、举报和屏蔽 |
| **日迹** | 随记、个人日程和推送，按校园身份保存在本机 |
| **校园** | 学校教学、自习安排、学习空间、体育、职业规划、考研信息和结构化评价 |
| **我的** | 社区资料、个人内容、共享课表、外观与显示设置、数据管理、反馈和退出登录 |

课表是最高频入口。用户打开 App 后，可以先确认今天的课程和地点，再进入成绩、考试、教室、学习记录等更具体的任务。“日迹”作为独立根 Tab，顶部直接提供随记、日程和推送；“校园”页负责容纳不断扩展的工具，根导航因此保持稳定。

## 数据边界

MyLeafy 同时连接学校系统、本机存储和 Supabase。三类数据各有明确来源：

| 数据 | 来源与处理方式 |
|---|---|
| 课表、成绩、考试、教学计划、培养方案、空教室 | 来自北京林业大学强智教务系统，由 App 在用户登录后读取并缓存在本机 |
| 课程备注、提醒、学习资料、任务、体测、随记、个人日程等个人记录 | 默认保存在本机 SwiftData 或 App 私有目录，随记和个人日程按校园身份隔离存储 |
| 社区内容、通知、公告、共享授权、评价与运营配置 | 保存在 Supabase，并通过用户会话、RLS、校园范围和资源所有权控制访问 |

学校教务系统仍是学业数据的权威来源。MyLeafy 保存最近一次成功获取的数据，学校服务暂时不可用时仍可查看缓存。需要多人协作或跨设备的数据再按需进入远程后端，共享课表也只上传用户主动发布的字段。

## 课表与时间

北林教务系统主要返回 HTML 页面，页面入口、Cookie 行为和结构都可能变化。MyLeafy 使用 `URLSession`、显式 Cookie 管理和 SwiftSoup 完成教务访问与解析，必要时通过 `WKWebView` 复现浏览器访问路径。

课表按单个学年浏览，范围从秋季学期首日到下一学年开始前一天；学校每次返回的单学期课表仍按 20 周保存，课程周次完全以教务响应为准。学期查询参数、首周日期和语义化学期时间线由远程运行配置提供，正常换学期无需发布新版 App。2026-2027-1 学年的首周为 9 月 7 日，运行配置已具备。页面支持周次切换、重叠课程布局、课程备注、提醒、考试与个人日程投射、年度视图、照片或纯色背景、小组件和深链跳转。

日程能力围绕课表继续扩展：自定义安排在当前学年内投射到课表，范围外显示为倒计时；考试和重要日期按规则生成提醒。用户仍从熟悉的时间界面出发，无需在多个日历页面之间反复切换。

为了减少复杂课表网格的渲染开销，课程布局、提醒、考试和日期信息会提前生成不可变的展示快照。这个方案来自一次真实的 iPhone 卡顿与 SwiftData 生命周期排查，也让我更明确地区分了数据计算、持久化和 SwiftUI 渲染的职责。

## 日迹：随记与日程

“日迹”是独立的根 Tab，顶部直接提供随记、日程和推送三个分区。随记是本机的卡片式记录：支持全文搜索、Tag 筛选、图片和语音转写，正文中的 `#标签` 会自动建立索引；输入器支持聚焦展开，长文本可以放大或缩小编辑。随记也可以转为个人日程，学校课程、考试和校历不进入随记与个人日程列表。

侧栏“记录”分组提供“记录日迹”和“每日回顾”。记录日迹按自然年展示每月随记数和记录天数，并提供近 30 天热力图、连续记录、星期/时段习惯、常用标签和里程碑，点按热力图日期可以查看当天随记。统计图片在本机生成，只包含聚合统计，不包含随记正文或标签名，通过系统分享且不上传。

随记、图片、回顾和统计只保存在当前校园身份的本机空间，不上传、不进入社区、Widget、日历导出或课表分享图。

## 校园与学习

“校园”页按领域组织学生事务，采用横向可滚动的一级领域导航：

- 学校教学：成绩、成绩分析、考试、校历、荣誉记录、综合测评、教学计划和培养方案。
- 自习安排：图书馆座位预约、按需更新的校园热力图，以及空闲教室这一内部工具；空闲教室支持按楼宇、日期和节次查询并查看指定教室占用。
- 学习空间：围绕学习项目组织资料、任务和专注记录；专注记录包含每段学习时间、地点和备注。
- 体育相关：阳光长跑、体测记录和体育场馆。
- 职业规划：简历管理、求职/升学任务和收藏链接。
- 考研信息：目标院校管理，以及招生简章、专业目录、复试线等可追溯来源。
- 评价相关：教师、课程、菜品等结构化评分，评分星级居中显示。
- 校园扩展：医疗事项、周末出行等特定校园工具。

不同校园只显示已经适配的领域。北京林业大学拥有完整的教务连接和主要社区能力，自定义校园可以继续使用部分本地学习与日程工具。首页横幅、入口状态和校园内容可以通过运营后台按校园配置，更新这些信息无需重新发布客户端。

## 社区与共享

社区建立在 Supabase 上，教务身份和社区会话分别管理。同一教务身份可以在不同设备继承同一份社区资料和内容。

帖子流支持分类筛选、近 7 天热门和全局/分类置顶；帖子支持文本、最多 4 张图片，以及最多 2 个 PDF、XLSX、DOCX 或 Markdown 附件，并支持匿名发布。普通帖草稿按账号保存在本机，发布前完成压缩、类型检查和上传校验；所有资源准备完成后，帖子才进入公开状态。分享卡以 JPEG 在本机生成，不会因为分享动作额外上传用户内容。

评论最多两层，通知通过 Realtime 更新。举报进入后台处理流程，屏蔽会让对应用户的帖子、评论和通知在当前账号下不可见。后台还负责公告、校园横幅、内容治理、目录维护、角色权限和审计。社区服务侧提供按内容类型开放的投票与搜索，通知邮箱只用于服务异常和重要消息联系。

共享课表使用一次性邀请码和只读授权。用户可以主动发布、查看共享关系并随时撤销，成绩、备注和提醒不进入共享数据。

## MyLeafy AI

MyLeafy AI 的客户端、后端和商品配置仍保留在项目中，当前没有公开入口。公开版本集中完善免费功能、稳定性和审核合规，AI 能力会在功能完整性、额度验签和审核流程稳定后再恢复入口。

## 设计与技术架构

MyLeafy 以 SwiftUI 构建页面和导航，最低支持 iOS 17。所有系统版本使用原生 `TabView`，iOS 26 通过可用性检查自然采用系统 Liquid Glass 外观，低版本保留稳定的原生体验。课表支持浅色、深色、主题色、显示密度、照片和纯色背景；个性化背景只保存在本机，也不会出现在分享图或 Widget 中。

| 范围 | 技术 |
|---|---|
| iOS UI | SwiftUI |
| 本地持久化 | SwiftData、Keychain、App 私有文件 |
| 教务网络与解析 | URLSession、HTTPCookieStorage、WKWebView、SwiftSoup |
| 系统服务 | WeatherKit、WidgetKit |
| 业务后端 | Supabase Auth、PostgreSQL、Storage、Realtime、Edge Functions |
| 运营后台 | React 18、React-admin 5、MUI、ECharts、Vite、TypeScript |
| 边缘代理 | Cloudflare Pages Functions |
| 自动化检查 | GitHub Actions、Vitest、Playwright、XCTest |

客户端按 Presentation、Application、Domain 和 Data 分层。学校数据、本机数据和 MyLeafy 云端数据拥有各自的权威来源；跨用户、高权限和管理操作必须经过服务端认证、参数校验与审计。运营后台通过 Cloudflare Pages Functions 访问管理能力，高权限会话保存在 HttpOnly Cookie 中，浏览器端无法读取服务端密钥。

## 当前重点

项目已经形成 iOS、Supabase 和 Web 管理三端架构。现阶段的重点是提高教务解析稳定性和故障恢复质量，统一不同校园的数据适配协议和能力配置，完善自习安排、学习空间、课表与日程之间的数据连接，并继续收紧身份绑定、共享、导出和管理操作的安全边界。

这个项目让我经历了一个产品从数据源、客户端、后端权限、运营工具到 App Store 审核的完整链路。很多工程边界来自真实问题：教务页面变化促成了多路径解析，课表卡顿和崩溃促成了值类型展示快照，社区内容增长促成了上传校验、后台权限和审计。它们比单独完成一个页面更接近真实的软件开发。
