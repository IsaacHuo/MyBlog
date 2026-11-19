<template>
  <div class="fragments-page zb-page">
    <header class="fragments-header">
      <h1>{{ isZh ? '片段' : 'Fragments' }}</h1>
      <p>
        {{ isZh
          ? '一份个人数字剪贴簿。'
          : 'A personal digital scrapbook.'
        }}
      </p>
    </header>

    <div
      v-if="fragments.length > 0"
      class="fragment-list"
    >
      <article
        v-for="(fragment, index) in fragments"
        :key="fragment.id || `${fragment.date}-${fragment.title || fragment.text}-${index}`"
        class="fragment-item"
      >
        <div class="fragment-meta">
          <span>
            <time
              v-if="fragment.date"
              :datetime="fragment.date"
            >{{ formatDate(fragment.date) }}</time>
            <span v-if="fragment.type"> · {{ fragment.type }}</span>
          </span>
        </div>
        <div
          v-if="fragment.visualEmoji"
          class="fragment-visual"
        >
          <span aria-hidden="true">{{ fragment.visualEmoji }}</span>
          <small v-if="fragment.visualText">{{ fragment.visualText }}</small>
        </div>
        <img
          v-if="fragment.image"
          :src="fragment.image"
          :alt="fragment.title || fragment.text || ''"
          loading="lazy"
        >
        <h2 v-if="fragment.title">
          {{ fragment.title }}
        </h2>
        <p v-if="fragment.text">
          {{ fragment.text }}
        </p>
        <p
          v-if="fragment.status"
          class="fragment-status"
        >
          <span aria-hidden="true" />{{ fragment.status }}
        </p>
        <ul
          v-if="fragment.tags?.length"
          class="fragment-tags"
          :aria-label="isZh ? '标签' : 'Tags'"
        >
          <li
            v-for="tag in fragment.tags"
            :key="tag"
          >
            {{ tag }}
          </li>
        </ul>
        <a
          v-if="fragment.link"
          :href="resolveLink(fragment.link)"
          :target="isExternalUrl(fragment.link) ? '_blank' : undefined"
          :rel="isExternalUrl(fragment.link) ? 'noopener noreferrer' : undefined"
        >
          {{ fragment.linkText || (isZh ? '查看链接' : 'Open link') }} ↗
        </a>
      </article>
    </div>

    <section
      v-else
      class="fragments-empty"
    >
      <p>{{ isZh ? '这里会慢慢出现：' : 'This space will gradually collect:' }}</p>
      <ul>
        <li
          v-for="item in fragmentKinds"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

type FragmentItem = {
  id?: string
  date?: string
  type?: string
  title?: string
  text?: string
  image?: string
  link?: string
  linkText?: string
  visualEmoji?: string
  visualText?: string
  status?: string
  tags?: string[]
}

const { frontmatter, page, site } = useData()
const isZh = computed(() => site.value.lang === 'zh-Hant' || page.value.relativePath.startsWith('zh/'))
const fragments = computed<FragmentItem[]>(() => Array.isArray(frontmatter.value.fragments)
  ? frontmatter.value.fragments
  : [])

const fragmentKinds = computed(() => isZh.value
  ? [
      '一张照片和一句说明',
      '最近在读、在听、在看',
      '正在做什么',
      '简短想法和学习记录',
      '收藏的网站、工具和设计',
      '尚未成熟的小实验',
      '旅行或校园生活记录'
    ]
  : [
      'A photo with a short note',
      'Recently read, heard, or watched',
      'What I am working on',
      'Short thoughts and learning notes',
      'Saved websites, tools, and design',
      'Small unfinished experiments',
      'Travel and campus life'
    ])

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(isZh.value ? 'zh-Hant' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

function isExternalUrl(url: string) {
  return /^(?:https?:)?\/\//i.test(url.trim())
}

function resolveLink(url: string) {
  return isExternalUrl(url) ? url : withBase(url)
}
</script>

<style scoped>
.fragments-page { color: var(--ink); }

.fragments-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 3rem;
  padding-top: 14px;
  border-top: 1px solid var(--rule-strong);
}

.fragments-header h1 {
  margin: 1.5rem 0 0;
  font-size: clamp(44px, 5.8vw, 76px);
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: 0;
}

.fragments-header p {
  margin: 0 0 6px;
  color: var(--muted);
  font-size: 1.1rem;
}

.fragment-list {
  columns: 2 300px;
  column-gap: 22px;
}

.fragment-item {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin-bottom: 26px;
  padding: 18px 18px 20px;
  break-inside: avoid;
  background: var(--paper-card);
  box-shadow: var(--card-shadow);
  transition: transform 0.3s ease;
}

.fragment-item:nth-child(3n + 1) { transform: rotate(-0.8deg); }
.fragment-item:nth-child(3n + 2) { transform: rotate(0.6deg); }
.fragment-item:nth-child(3n) { transform: rotate(-0.3deg); }
.fragment-item:hover { transform: rotate(0deg); }

.fragment-meta {
  display: flex;
  min-height: 2.2rem;
  align-items: center;
  padding: 0 8px;
  border: 1px solid #9e9f93;
  color: var(--muted);
  font-size: 0.8125rem;
  letter-spacing: 0.04em;
}

.fragment-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 1.25rem 0;
  background: var(--paper-soft);
  font-size: 3rem;
  line-height: 1;
}

.fragment-visual small { color: var(--muted); font-size: 0.875rem; }

.fragment-item img {
  width: 100%;
  height: auto;
  border: 6px solid var(--paper);
  box-shadow: 0 1px 3px rgb(57 67 55 / 12%);
}

.fragment-item h2 {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 1.3rem;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0;
}

.fragment-item p {
  margin: 0;
  color: var(--ink-2);
  font-size: 1rem;
  line-height: 1.8;
}

.fragment-item .fragment-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--marker-deep);
  font-size: 0.875rem;
}

.fragment-status span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--marker);
}

.fragment-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.fragment-tags li {
  margin: 0;
  padding: 0.1rem 0.55rem;
  border-radius: 999px;
  background: var(--marker-soft);
  color: var(--ink-2);
  font-size: 0.8125rem;
}

.fragment-item a {
  align-self: flex-start;
  color: var(--ink);
  font-size: 0.9375rem;
  text-decoration: underline;
  text-decoration-color: var(--marker);
  text-underline-offset: 4px;
}

.fragment-item a:hover { color: var(--marker-deep); }

.fragments-empty {
  padding: 28px 30px;
  background: var(--paper-card);
  box-shadow: var(--card-shadow);
  transform: rotate(-0.5deg);
}

.fragments-empty p { margin: 0 0 1rem; color: var(--muted); }

.fragments-empty ul {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.fragments-empty li {
  margin: 0;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--rule);
  font-size: 1.05rem;
}

.fragments-empty li::before {
  margin-right: 0.6rem;
  color: var(--marker);
  content: '—';
}

@media (max-width: 767px) {
  .fragments-header { display: block; }
  .fragments-header p { margin-top: 0.75rem; }
  .fragment-list { columns: 1; }
  .fragment-item:nth-child(n),
  .fragments-empty { transform: none; }
}
</style>
