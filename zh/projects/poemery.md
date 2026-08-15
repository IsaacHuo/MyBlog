---
title: "Poemery，离线诗词阅读 iOS App"
date: 2026-06-28
author: 霍玮放
description: "面向中文诗词阅读的原生 iOS App，使用 SwiftUI、本地诗词库和 Apple Music 式信息架构组织离线阅读体验。"
editLink: true
outline: [2, 3]
---

# Poemery，离线诗词阅读 iOS App

Poemery 是我开发的原生 iOS 诗词阅读应用。它把唐诗、宋词、元曲和先秦经典整理为可浏览、可搜索、可收藏的本地诗词库，用更接近现代内容产品的信息架构承载传统文本。

## 产品哲学与定位

Poemery 的目标是做一个**轻量、离线、专注阅读**的诗词 App。它不依赖账号、订阅或云端同步，核心内容随 App Bundle 打包，用户可以在本机完成浏览、搜索、收藏和最近阅读。

### 信息架构，Apple Music 式的诗词体验

Poemery 在导航结构上参考了 Apple Music 的内容组织方式，但内容语义完全围绕诗词展开。

| Apple Music 概念 | Poemery 对应 | 页面 |
|---|---|---|
| Listen Now / Home | 继续阅读、推荐内容 | 主页 |
| Browse / New | 新诗单、新诗精选、题材浏览 | 新发现 |
| Library | 诗单、诗人、诗词、收藏、最近阅读 | 资料库 |
| Account | 本地阅读档案、偏好统计 | 我的 |
| Search | 系统级独立搜索入口 | 搜索 |

五个根 Tab 的分工很明确。主页负责个性化推荐和继续阅读；新发现负责探索新内容和题材；资料库是完整的诗库目录入口；我的承载本地阅读档案和偏好统计；搜索是独立系统入口，不藏在某个页面里。

### 设计原则

- **内容语义全部面向诗词歌赋**。作品称为"诗词"或"作品"，集合称为"诗单"或"合集"，作者称为"诗人/作者"，个人区称为"我的"。不照搬音乐 App 的术语。
- **明亮、纸感、低噪声**。大标题、留白、轻量玻璃容器、诗词卡片和可读性优先的中文排版。不追求厚重阴影和复杂装饰。
- **封面由数据生成**。每首作品和每个诗单都有本地生成的封面（`ArtworkStyle`），不依赖远程图片，保证离线场景下视觉一致。
- **阅读是核心**。整个 App 的跳转模型围绕"打开一首诗"和"继续阅读"展开，底部常驻当前阅读条。

## 内容与数据

### 数据规模

当前版本内置约 **12,000 首**诗词作品、**26 个**诗单合集和 **13 个**浏览分类。按朝代分布。

| 朝代 | 数量 | 主要体裁 |
|---|---|---|
| 唐 | 366 首 | 五绝、七绝、五律、七律、乐府 |
| 宋 | 280 首 | 词 |
| 元 | 11,055 条 | 曲 |
| 先秦 | 341 篇/首 | 诗经、论语、四书五经 |

诗单覆盖唐诗三百首、宋词三百首、元曲精选和先秦经典等来源，浏览分类包括五言绝句、七言律诗、宋词、元曲等 13 个题材入口。

### 上游数据与导入管线

数据来自开源仓库 [`chinese-poetry/chinese-poetry`](https://github.com/chinese-poetry/chinese-poetry)，固定 commit `99ebbef` 以保证数据可复现。上游使用 MIT License。

导入脚本 `Scripts/import_chinese_poetry.py` 要完成下面这些事。

1. 从固定 commit 的 GitHub raw URL 读取上游 JSON。
2. 校验每个上游源的期望数量（唐诗 366、宋词 280、元曲 11,057 等）。
3. 清洗标题、作者、正文段落的首尾空白；为缺失标题/作者设置兜底值（"无题""佚名"）。
4. 对元曲中部分标题带正文空段落的条目做修复，跳过无法修复的空正文条目。
5. 为每首作品生成稳定的 `Poem.id`，根据来源、作者、标题和正文计算 **SHA-256 摘要**。
6. 合并标签、推断唐诗体裁，生成指向固定 commit 的 `sourceURL`。
7. 根据来源和作品 id 生成 `ArtworkStyle`，用于本地封面视觉。
8. 生成诗单、分类和数据来源 notice。
9. 构建前校验，作品 ID 唯一、诗单引用有效、分类能命中作品。

最终输出为 `Poemery/PoemsSeed.json`（随 App Bundle 打包）和 `Poemery/ChinesePoetryNotice.txt`（上游版权说明）。

### 核心数据模型

`Poem`（作品）是核心模型，字段包括标题、作者、朝代、体裁、标签、正文行数组（`PoemLine`）、注解数组（`PoemAnnotation`）、来源链接和封面样式。派生属性 `fullText` 将正文按换行合并用于全文搜索，`displayArtist` 格式化为"朝代 · 作者"。

`PoemCollection`（诗单）包含标题、副标题、类型（`featured`/`chart`/`author` 等）、作品 ID 列表和强调色。`PoemCategory`（浏览分类）通过标签、朝代、体裁和作者进行匹配。

### 运行时加载与搜索

`PoemLibraryStore` 在初始化时从 App Bundle 读取 `PoemsSeed.json`，建立 `poemsByID` 字典。如果 JSON 缺失或解码失败，会回退到内置的最小数据集，一首《静夜思》，避免 App 白屏。

搜索基于本地 token 匹配。对用户输入做 trim、lowercase、按空格切分 token，在标题、作者、朝代、体裁、全文和 tags 中检索，所有 token 必须同时命中。搜索结果按诗词、作者、合集分组返回。当前不支持拼音搜索、繁简转换或语义检索。

### 用户本地数据

收藏（`poemery.favoritePoemIDs`）和最近阅读（`poemery.recentPoemIDs`）通过 `UserDefaults` 持久化，只保存作品 ID，显示时再通过 `PoemLibraryStore` 映射回 `Poem` 对象。最近阅读最多保留 20 条，新阅读移到队首。收藏和最近阅读均为本机本地状态，没有账号或云同步。

## 交互设计

### 阅读队列，统一的作品上下文

Poemery 的所有作品打开入口共享同一个模型。打开一首作品时必须带上一个 `ReadingQueue`。

无论用户从主页推荐、搜索结果、诗单详情还是资料库目录进入，系统都会创建一个阅读队列，包含当前作品所处的完整作品列表。队列来源可以是单首作品、整个诗单、某位作者的全部作品、搜索结果或资料库入口（"诗词""收藏""最近阅读"）。

队列是循环的，下一首超过末尾时回到第一首。如果当前队列不包含当前作品，系统会退回单首队列，避免状态不一致。

### 当前阅读条，底部的常驻阅读锚点

底部当前阅读条是 Poemery 最具辨识度的交互元素。它有两种状态。

- **有当前作品**，显示封面、标题、作者/队列信息，以及"下一首"按钮。点击作品区域直接打开详情页。
- **无当前作品**，显示"打开一首诗 / 当前阅读会显示在这里"的引导提示。

在 iOS 26 上，阅读条通过系统 `tabViewBottomAccessory` 实现，自动适配 expanded（完整信息）和 inline（压缩一行）两种放置模式。旧系统通过 `safeAreaInset` fallback，使用 `ultraThinMaterial` 材质。

### 诗词详情页，沉浸式阅读体验

详情页以阅读为中心，是一个沉浸式正文页。

- **compact hero**，小封面、标题、作者朝代体裁、标签、收藏按钮。
- **正文区**，`PoemTextSection` 渲染分行诗词正文。
- **横向滑动切换**，在正文区左滑下一首、右滑上一首，形成自然的翻页感。
- **底部工具栏**，上一首、当前队列位置（如"唐诗三 1 / 366"）、下一首。
- **收藏按钮**，右侧圆形按钮，点击切换收藏状态。
- **相关诗词**，按共享标签筛选的相关作品列表。
- **注解入口**，数据结构已就绪，正文行可关联 `PoemAnnotation`；当前导入数据中注解为空，后续补充即可启用。

### 搜索流程

搜索是独立的系统 Tab（iOS 26 上使用 `role: .search`），不藏在某个页面里。空搜索时显示"推荐搜索"；输入关键词后在诗词、作者、合集三类结果中展示。从新发现页点击题材入口会直接跳转到搜索 Tab 并填入题材名作为搜索词。向下拖动搜索页会收起搜索并回到上一个内容 Tab。

### 收藏与最近阅读

收藏和最近阅读均为纯本地操作。打开一首诗即触发最近阅读更新，详情页出现后也会刷新。最近阅读最多保留 20 条。资料库和"我的"页的收藏/最近阅读入口保证有可用的跳转目标，有数据则打开第一首，无数据则回退到诗库第一首作品。

## 技术实现

### 技术栈

| 层 | 技术 |
|---|---|
| iOS UI | SwiftUI（部署目标 iOS 17.0） |
| 数据驱动 | 本地 JSON seed（`PoemsSeed.json`），运行时加载到 `PoemLibraryStore` |
| 本地持久化 | `UserDefaults`（收藏、最近阅读） |
| 封面生成 | 本地 `ArtworkStyle` 生成，不依赖远程图片 |
| 字体 | 系统字体 + 自定义 `HYWenRunSongYun-U`（中文正文） |

### 设计系统

视觉系统集中定义在 `Poemery/Design/PoemeryTheme.swift`。

- **主题色**，朱红色 `accent`，用于选中态、重点按钮、收藏和分类强调。
- **背景层次**，`background`（纸白底色）、`surface`、`groupedBackground`（列表和卡片）。
- **文本层次**，`primaryText`、`secondaryText`、`tertiaryText` 三级明确区分。
- **自定义中文字体**，中文正文通过 `PoemeryTheme.chineseFont(...)` 使用 `HYWenRunSongYun-U`，增强传统文本的阅读质感。
- **动画**，`motion`（标准）和 `quickMotion`（快速）使用 SwiftUI smooth 动画，避免重型自定义动画。

玻璃材质通过 `AdaptiveGlassSurface` 和 `GlassContainerModifier` 封装。iOS 26 使用 `.glassEffect(...)`，低版本 fallback 到 `.ultraThinMaterial` 加描边和阴影。

### 跨版本适配策略

Poemery 的最低部署目标是 iOS 17，但充分利用了 iOS 26 的新能力。

| 能力 | iOS 26 | iOS 17-25 |
|---|---|---|
| 根导航 | 原生 `Tab` API + `role: .search` | 系统 `TabView` + `.tabItem` |
| 搜索入口 | 系统独立搜索 Tab（`tabViewSearchActivation`） | 系统 `TabView` 中的搜索 tab |
| 当前阅读条 | `tabViewBottomAccessory`（expanded/inline） | `safeAreaInset(edge: .bottom)` |
| 玻璃材质 | `.glassEffect(...)` / `GlassEffectContainer` | `.ultraThinMaterial` + 描边阴影 |
| 底栏行为 | `tabBarMinimizeBehavior(.onScrollDown)` | 标准 TabView 行为 |

核心原则是不在旧系统上复刻 iOS 26 形态，而是保留稳定可用的 fallback。页面在不同系统版本上可能有不同的视觉表现，但交互逻辑保持一致。

### 共享组件体系

Poemery 建立了一套共享组件来维持视觉一致性。

- `ScreenHeader`，页面大标题和副标题。
- `FeaturedCarousel` / `FeaturedCollectionCard`，横向推荐诗单轮播。
- `PoemShelf` / `CompactPoemCard`，横向作品 shelf。
- `PoemListSection` / `PoemListRow`，列表型作品入口。
- `CategoryTile`，题材入口卡片。
- `PoemArtwork`，用 `ArtworkStyle` 生成本地封面。
- `PaperTexture`，轻量纸纹装饰。
- `EmptyLibraryState`，空状态组件。

## 工程收获

### 借成熟 IA 做内容产品

Poemery 最有价值的决策之一是参考了 Apple Music 的信息架构来做诗词 App。它解决了一个根本问题。当你有 12,000 首诗词时，怎么组织才能让用户自然地浏览、发现和继续阅读？

Apple Music 经过十年打磨的分层模型（Home 个性化推荐、Browse 探索新内容、Library 完整目录、Search 独立检索）刚好契合内容型产品的核心需求。Poemery 把这一结构翻译成诗词语境后，主页推荐诗单、横向 shelf 展示最近阅读、资料库承载完整诗库、独立搜索入口等设计就自然成立了。它借用的是别人验证过的内容组织方式，然后在自己熟悉的领域里重新实现。

### 离线优先的数据自洽

12,000 首作品全部随 App Bundle 打包，意味着用户的每一次浏览、搜索、收藏、最近阅读都是毫秒级的本地操作。没有 loading spinner，没有网络超时，没有"刷新试试"。

代价是数据管线必须严格自洽。导入脚本的 9 步流程，从上游 JSON 清洗到 SHA-256 ID 生成、从体裁推断到构建前校验，每一步都在保证打包进去的 12,000 条数据没有坏数据。一首元曲的空正文、一个缺失的作者名、一个失效的诗单引用，都可能在用户端变成 crash 或白屏。

### 跨版本适配的务实哲学

Poemery 在 iOS 26 上用了原生的 Liquid Glass 和底栏 API，在旧系统上保持 `TabView` + `safeAreaInset` fallback。关键原则是不在旧系统上复刻新系统形态，这避免了大量的兼容 hack。用户在 iOS 17 上看到的 Poemery 和 iOS 26 上的视觉不同，但交互逻辑完全一致。这是一种务实的分层，底层的行为规则统一，表现层随系统能力自然演进。

### 阅读状态机比想象中复杂

阅读队列的循环、当前阅读条的 expanded/inline 适配、打开作品时队列不匹配的兜底、最近阅读 20 条上限的去重插入，这些细节单独看都简单，组合在一起时状态转换很容易出现"当前显示的诗不在当前队列里"或"最近阅读里出现重复 ID"的情况。`ReadingSessionStore` 保持小规模、只依赖 `UserDefaults` 且只存 ID 的设计，反而让状态推理变得简单。

## 链接

- **GitHub 仓库** [IsaacHuo/poem](https://github.com/IsaacHuo/poem)
