<template>
  <div class="projects-list-page">
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
const isZh = computed(() => site.value.lang === 'zh-CN' || page.value.relativePath.startsWith('zh/'))

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
    return new Intl.DateTimeFormat(isZh.value ? 'zh-CN' : 'en-US', {
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
.projects-list-page,
.projects-list-page *,
.projects-list-page a,
.projects-list-page a * {
  font-family: inherit !important;
}

.projects-list-page {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 30px 15px;
}

.project-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.project-list-item {
  margin-bottom: 30px;
}

.project-meta {
  display: block;
  margin-bottom: 2px;
  color: var(--vp-c-text-3);
  font-size: 14px;
  line-height: 1.5;
}

.project-link {
  display: block;
  color: #4d74eb !important;
  font-size: 24px;
  line-height: 1.35;
  text-decoration: none;
}

.project-link:hover {
  color: var(--vp-c-text-1) !important;
  text-decoration: underline;
}

.project-description {
  color: var(--vp-c-text-2);
  font-size: 16px;
  line-height: 1.5;
  margin-top: 4px;
}

.empty-state {
  text-align: center;
  padding: var(--space-3xl) 0;
  color: var(--vp-c-text-2);
  font-size: var(--vp-font-size-lg);
}

@media (max-width: 800px) {
  .projects-list-page {
    padding-right: 7.5px;
    padding-left: 7.5px;
  }
}
</style>
