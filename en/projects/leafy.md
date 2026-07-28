---
title: "MyLeafy: A Timetable-Centered Campus iOS App"
date: 2026-07-01
author: Isaac Huo
description: "A native iOS app for university study and campus life, currently focused on Beijing Forestry University and centered on timetables and academic data."
editLink: true
outline: [2, 3]
---

# MyLeafy: A Timetable-Centered Campus iOS App

MyLeafy is a campus iOS app I built independently, currently focused on Beijing Forestry University. It starts with the timetable and brings grades, exams, degree requirements, empty classrooms, learning records, campus community, and timetable sharing into one native client. I built the iOS app, Supabase backend, public website, and operations console, and the product now serves more than 5,000 users.

The repository, Xcode target, and some historical types still use `leafy` or `Leafy`; the public product name is MyLeafy. The project now has campus capability configuration, while its complete academic-system integration remains focused on Beijing Forestry University.

<div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; align-items: flex-start;">
  <img src="/project-images/myleafy/calendar.jpg" alt="MyLeafy timetable showcase" width="220" loading="lazy" style="max-width: 100%; border-radius: 16px;">
  <img src="/project-images/myleafy/grade.jpg" alt="MyLeafy grades showcase" width="220" loading="lazy" style="max-width: 100%; border-radius: 16px;">
  <img src="/project-images/myleafy/xuefen.jpg" alt="MyLeafy credit tracking showcase" width="220" loading="lazy" style="max-width: 100%; border-radius: 16px;">
  <img src="/project-images/myleafy/zongsu.jpg" alt="MyLeafy comprehensive evaluation showcase" width="220" loading="lazy" style="max-width: 100%; border-radius: 16px;">
  <img src="/project-images/myleafy/sharecal.jpg" alt="MyLeafy shared timetable showcase" width="220" loading="lazy" style="max-width: 100%; border-radius: 16px;">
  <img src="/project-images/myleafy/community.jpg" alt="MyLeafy community showcase" width="220" loading="lazy" style="max-width: 100%; border-radius: 16px;">
  <img src="/project-images/myleafy/color.jpg" alt="MyLeafy theme color showcase" width="220" loading="lazy" style="max-width: 100%; border-radius: 16px;">
</div>

## Product Structure

The current public build has four root tabs:

- **Timetable** covers the full-semester weekly grid, course details, notes, reminders, exams, schedules, backgrounds, sharing, and widgets.
- **Community** covers posts, media and documents, comments, likes, bookmarks, polls, notifications, announcements, reporting, and blocking.
- **Campus** groups grades, exams, degree requirements, empty classrooms, learning spaces, sports, career planning, graduate-school information, and structured ratings.
- **Profile** manages community identity, personal content, shared timetables, appearance, display settings, data, support, and logout.

The timetable is the highest-frequency entry point. Campus tools are grouped by task so the root navigation stays compact as the product grows.

Leafy AI remains in the source, backend, and product configuration. Its public navigation and purchase flow are hidden in version 2.9 build 22 while the current release focuses on free features, stability, and review compliance.

## Data Boundaries

The university academic system remains the authority for timetables, grades, exams, teaching plans, degree requirements, and classroom availability. MyLeafy reads this data after the user signs in and keeps the latest successful local cache.

Personal notes, reminders, learning materials, tasks, and fitness records stay in SwiftData or the app's private files by default. Supabase stores MyLeafy's own multi-user data, including community content, notifications, announcements, timetable-sharing permissions, ratings, and runtime configuration. Access is constrained by user sessions, row-level security, campus scope, and resource ownership.

Shared timetables contain only the fields a user explicitly publishes. A local timetable cache never becomes public automatically.

## Timetable and Time

The Beijing Forestry University academic system exposes HTML pages rather than a stable API. MyLeafy uses URLSession, explicit cookie management, and SwiftSoup for access and parsing, with WKWebView available when the browser path must be reproduced.

The timetable keeps a fixed 20-week container, while actual course occurrences come entirely from the university response. Runtime configuration supplies semester query parameters and the first-week date, so an ordinary semester rollover does not require an App Store release.

The interface supports week switching, overlapping courses, course notes, reminders in empty periods, exam and schedule projection, a yearly view, photo or solid-color backgrounds, widgets, and deep links. Course layout and time overlays are precomputed into display snapshots to keep the complex SwiftUI grid responsive.

## Campus, Community, and Sharing

The Campus tab organizes academic records, calendars, classroom search, learning projects, documents, tasks, focus records, sports, career planning, graduate-school information, and ratings. Capability configuration hides entries that a campus does not support.

The community runs on Supabase, with the university session kept separate from the community session. Posts support text, up to four images, and up to two PDF, XLSX, DOCX, or Markdown attachments. Local draft persistence and upload queues make publication recoverable; the post becomes visible only after its media passes validation. Comments are limited to two levels, notifications use Realtime, and moderation actions are handled through the operations console.

Timetable sharing uses one-time invitations and read-only authorization. Users control publication and can revoke a relationship at any time.

## Leafy AI

Leafy AI currently has no public entry point. The retained implementation includes a server-backed Flash service, optional DeepSeek BYOK stored in Keychain, consent-based access to bounded local academic context, source-backed web research, and Artifact pages for reports, lists, tables, and diagrams.

AI actions are limited to preparing navigations, reminders, or schedules for review. They cannot directly alter university records or publish community content on a user's behalf.

## Architecture and Operations

MyLeafy is built with SwiftUI and supports iOS 17 and later. All supported versions use the native TabView; iOS 26 naturally adopts the system Liquid Glass appearance. SwiftData and Keychain handle local persistence, while Supabase Auth, PostgreSQL, Storage, and Edge Functions support remote product data.

The repository also contains a React-admin operations console built with React, MUI, ECharts, Vite, and TypeScript. Cloudflare Pages Functions proxy management requests, keeping high-privilege sessions in HttpOnly cookies and server credentials out of browser JavaScript. Automated checks cover the iOS app, backend contracts, and web console through XCTest, Vitest, Playwright, and GitHub Actions.

## Current Focus

The project now spans an iOS client, a Supabase backend, and a web operations system. Current work prioritizes academic-parser resilience, clear recovery paths, campus capability configuration, tighter links between timetables and learning workflows, and stronger boundaries around identity, sharing, exports, and administration.

MyLeafy taught me how product architecture grows from real failures. Changing university pages led to multi-path parsing, a timetable performance incident led to display snapshots, and community growth led to explicit permissions and audit trails. Owning that path from data source to App Store review has been more valuable than building any isolated screen.

## Links

- [GitHub repository](https://github.com/IsaacHuo/MyLeafy)
- [Documentation center](https://github.com/IsaacHuo/MyLeafy/tree/main/docs)
- [Product overview](https://github.com/IsaacHuo/MyLeafy/blob/main/docs/product/overview.md)
- [Architecture](https://github.com/IsaacHuo/MyLeafy/blob/main/docs/engineering/architecture.md)
