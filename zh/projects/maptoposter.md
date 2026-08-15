---
title: "MapToPoster，城市地图海报生成器"
date: 2025-01-20
author: 霍玮放
description: "基于 OpenStreetMap 数据生成可定制、可打印的城市地图海报。"
editLink: true
outline: [2, 3]
---

# MapToPoster，城市地图海报生成器

MapToPoster 是一个开源地图可视化工具。用户输入城市或地址后，系统获取 OpenStreetMap 路网数据，并生成可定制的城市地图海报。

项目聚焦地图的视觉表达。它保留道路、水系与绿地等结构，移除常规导航地图中的标签和交互信息，输出适合展示、打印和二次编辑的静态作品。

![MapToPoster 生成效果](/project-images/maptoposter.png)

## 核心能力

- 支持城市关键词搜索及国家、省份、城市级联选择。
- 提供 17 种以上的配色预设。
- 支持 4 到 30 km 地图半径、常用画幅比例和图层显隐调整。
- 导出高分辨率 PNG 或可编辑 SVG。
- 使用本地行政区划数据补充中国城市检索。

## 技术实现

项目使用 Python 构建。`OSMnx` 获取并处理 OpenStreetMap 路网数据，Nominatim 与本地数据完成位置检索，`Matplotlib` 负责图层绘制、样式控制和文件导出。

整个流程走完位置解析、地理数据获取、道路分级与图层整理、主题渲染，最后导出 PNG 或 SVG。

## 本地运行

```bash
git clone https://github.com/IsaacHuo/maptoposter.git
cd maptoposter
uv sync
uv run python app.py
```

启动后访问 `http://localhost:7860`。

## 项目链接

- [GitHub 仓库](https://github.com/IsaacHuo/maptoposter)
- [在线演示](https://huggingface.co/spaces/isaachwf/MapToPoster)

项目基于 [originalankur/maptoposter](https://github.com/originalankur/maptoposter) 继续开发。
