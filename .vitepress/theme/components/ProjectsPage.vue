<template>
  <div class="projects-list-page zb-page">
    <header class="zb-page-head">
      <div class="zb-label">
        <span>{{ isZh ? '项目' : 'Projects' }}</span>
        <span>{{ projects.length }} {{ isZh ? '个' : 'items' }}</span>
      </div>
      <h1>{{ isZh ? '正在做的事。' : 'Things in progress.' }}</h1>
      <p>{{ isZh ? '一些用心打磨的作品。' : 'Work made with care.' }}</p>
    </header>
    <ul
      v-if="projects.length > 0"
      class="project-list"
    >
      <li
        v-for="project in projects"
        :key="project.url"
        class="project-list-item"
      >
        <time
          v-if="project.date"
          class="project-meta"
          :datetime="String(project.date)"
        >
          {{ formatDate(project.date) }}
        </time>
        <a
          class="project-link"
          :href="resolveProjectUrl(project.url)"
          :target="isExternalUrl(project.url) ? '_blank' : undefined"
          :rel="isExternalUrl(project.url) ? 'noopener noreferrer' : undefined"
        >
          {{ project.title }}
          <span
            v-if="isExternalUrl(project.url)"
            class="visually-hidden"
          >{{ isZh ? '（在新窗口打开）' : ' (opens in a new window)' }}</span>
        </a>
        <p
          v-if="project.description"
          class="project-description"
        >
          {{ project.description }}
        </p>
      </li>
    </ul>

    <div
      v-else
      class="empty-state"
    >
      <p>{{ isZh ? '暂无项目...' : 'No projects yet...' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useData, withBase } from 'vitepress'
import { computed } from 'vue'

const { site, page, frontmatter } = useData()
const isZh = computed(() => site.value.lang === 'zh-Hant' || page.value.relativePath.startsWith('zh/'))

const projects = computed(() => {
  return Array.isArray(frontmatter.value.thoughts)
    ? frontmatter.value.thoughts.filter(project => project?.title && project?.url)
    : []
})

function resolveProjectUrl(url: string) {
  if (isExternalUrl(url)) return url
  return withBase(url)
}

function isExternalUrl(url: string) {
  return /^(?:https?:)?\/\//i.test(String(url).trim())
}

function formatDate(value?: string) {
  if (!value) return ''

  try {
    return new Intl.DateTimeFormat(isZh.value ? 'zh-Hant' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(value))
  } catch {
    return value
  }
}
</script>

<style scoped>
.projects-list-page { color: var(--ink); }

.project-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.project-list-item {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 20px 22px 22px;
  background: var(--paper-card);
  box-shadow: var(--card-shadow);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.project-list-item:nth-child(4n + 1) { transform: rotate(-0.6deg); }
.project-list-item:nth-child(4n + 2) { transform: rotate(0.5deg); margin-top: 14px; }
.project-list-item:nth-child(4n + 3) { transform: rotate(0.4deg); }
.project-list-item:nth-child(4n + 4) { transform: rotate(-0.5deg); margin-top: 14px; }

.project-list-item:hover,
.project-list-item:focus-within {
  transform: rotate(0deg) translateY(-3px);
  box-shadow: 0 10px 26px rgb(57 67 55 / 14%);
}

.project-meta {
  align-self: flex-start;
  padding: 0.1rem 0.6rem;
  border: 1px solid #9e9f93;
  color: var(--muted);
  font-size: 0.8125rem;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
}

.project-link {
  color: var(--ink);
  font-size: 1.45rem;
  line-height: 1.45;
  text-decoration: none;
}

/* Stretch the link over the whole card */
.project-link::after {
  position: absolute;
  inset: 0;
  content: '';
}

.project-link:hover { color: var(--marker-deep); }
.project-link:focus-visible { outline: none; }
.project-list-item:has(.project-link:focus-visible) { outline: 2px solid var(--site-focus-ring); outline-offset: 3px; }

.project-description {
  margin: 0;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.75;
}

.empty-state {
  padding: 3rem 0;
  color: var(--muted);
  text-align: center;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 767px) {
  .project-list { grid-template-columns: 1fr; gap: 18px; }
  .project-list-item:nth-child(n) { margin-top: 0; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .project-list-item { transition: none; }
}
</style>
