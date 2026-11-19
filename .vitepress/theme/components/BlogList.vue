<template>
  <div class="blog-list-page zb-page">
    <header class="zb-page-head">
      <div class="zb-label">
        <span>{{ isZh ? '文章' : 'Writing' }}</span>
        <span>{{ filteredPosts.length }} {{ isZh ? '篇' : 'posts' }}</span>
      </div>
      <h1>{{ isZh ? '想清楚，再动手。' : 'Think it through, then build.' }}</h1>
      <p>{{ isZh ? '技术笔记、产品思考与生活随想。' : 'Tech notes, product thinking and essays.' }}</p>
    </header>
    <nav
      class="blog-tabs"
      :aria-label="isZh ? '文章分类' : 'Post categories'"
    >
      <button
        id="blog-tab-tech"
        class="tab-btn"
        :class="{ active: activeTab === 'tech' }"
        type="button"
        :aria-pressed="activeTab === 'tech'"
        aria-controls="blog-panel-tech"
        @click="activeTab = 'tech'"
      >
        {{ isZh ? '技术' : 'Tech' }}
      </button>
      <span
        class="tab-divider"
        aria-hidden="true"
      >|</span>
      <button
        id="blog-tab-life"
        class="tab-btn"
        :class="{ active: activeTab === 'life' }"
        type="button"
        :aria-pressed="activeTab === 'life'"
        aria-controls="blog-panel-life"
        @click="activeTab = 'life'"
      >
        {{ isZh ? '随笔' : 'Essays' }}
      </button>
    </nav>

    <div class="blog-columns">
      <section
        id="blog-panel-tech"
        class="blog-column"
        :class="{ 'mobile-hidden': activeTab !== 'tech' }"
      >
        <h2 class="column-title">
          {{ isZh ? '技术' : 'Tech' }}
        </h2>
        <ul class="post-list">
          <li
            v-for="post in techPosts"
            :key="post.url"
            class="post-list-item"
          >
            <span class="post-meta">
              <time :datetime="String(post.frontmatter.date)">{{ formatDate(post.frontmatter.date) }}</time>
              <ViewCounter
                :id="postViewId(post.url)"
                :legacy-ids="legacyPostViewIds(post.url)"
                :is-zh="isZh"
                readonly
                class="inline-vc"
              />
            </span>
            <a
              class="post-link"
              :href="withBase(post.url)"
            >
              {{ post.frontmatter.title }}
            </a>
          </li>
        </ul>
      </section>

      <section
        id="blog-panel-life"
        class="blog-column"
        :class="{ 'mobile-hidden': activeTab !== 'life' }"
      >
        <h2 class="column-title">
          {{ isZh ? '随笔' : 'Essays' }}
        </h2>
        <ul class="post-list">
          <li
            v-for="post in lifePosts"
            :key="post.url"
            class="post-list-item"
          >
            <span class="post-meta">
              <time :datetime="String(post.frontmatter.date)">{{ formatDate(post.frontmatter.date) }}</time>
              <ViewCounter
                :id="postViewId(post.url)"
                :legacy-ids="legacyPostViewIds(post.url)"
                :is-zh="isZh"
                readonly
                class="inline-vc"
              />
            </span>
            <a
              class="post-link"
              :href="withBase(post.url)"
            >
              {{ post.frontmatter.title }}
            </a>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData, withBase } from 'vitepress'
import { data as blogPosts } from '../data/blogPosts.data.js'

const { page, site } = useData()
type BlogPost = { url: string; frontmatter: Record<string, any> }

const activeTab = ref<'tech' | 'life'>('tech')

const isZh = computed(() => {
  return site.value.lang === 'zh-Hant' || page.value.relativePath.startsWith('zh/')
})

const filteredPosts = computed(() => {
  if (!Array.isArray(blogPosts)) return []

  return blogPosts.filter((post: BlogPost) => {
    if (!post.frontmatter.title) return false
    return isZh.value
      ? post.url.startsWith('/zh/blog/')
      : post.url.startsWith('/en/blog/')
  })
})

const techPosts = computed(() => {
  return filteredPosts.value.filter(
    (post: BlogPost) => normalizeCategory(post) === 'tech'
  )
})

const lifePosts = computed(() => {
  return filteredPosts.value.filter(
    (post: BlogPost) => normalizeCategory(post) === 'life'
  )
})

function postViewId(url: string): string {
  // /zh/blog/slug 或 /en/blog/slug → zh/blog/slug
  return normalizePostPath(url)
}

function legacyPostViewIds(url: string): string[] {
  return [`${postViewId(url)}.md`]
}

function normalizePostPath(url: string): string {
  return url
    .replace(/^\//, '')
    .replace(/\.html$/, '')
    .replace(/\.md$/, '')
    .replace(/\/$/, '')
}

function normalizeCategory(post: BlogPost): 'tech' | 'life' | 'unknown' {
  const category = String(post.frontmatter.category || '').trim().toLowerCase()
  if (['生活', '随笔', 'life', 'essay', 'essays'].includes(category)) return 'life'
  if (['技术', 'tech', 'technology'].includes(category)) return 'tech'
  if (!category && post.url.startsWith('/en/blog/')) return 'tech'
  return 'unknown'
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
.blog-list-page {
  color: var(--ink);
}

.blog-tabs {
  display: none;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.tab-btn {
  padding: 0.35rem 1rem;
  border: 1px solid var(--rule-strong);
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font: inherit;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.tab-btn.active {
  border-color: var(--marker);
  background: var(--marker-soft);
  color: var(--ink);
}

.tab-btn:focus-visible { outline: 2px solid var(--site-focus-ring); outline-offset: 2px; }

.tab-divider { color: var(--faint); }

.blog-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4rem;
}

.column-title {
  display: flex;
  justify-content: space-between;
  margin: 0 0 0.5rem;
  padding: 14px 0 0;
  border-top: 1px solid var(--rule-strong);
  color: var(--muted);
  font-size: 0.9375rem;
  font-weight: 400;
  letter-spacing: 0.08em;
  line-height: 1.6;
}

.post-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.post-list-item {
  display: grid;
  gap: 0.35rem;
  padding: 1.25rem 0;
  border-bottom: 1px solid var(--rule);
  transition: padding 0.25s ease;
}

.post-list-item:hover { padding-left: 10px; }

.post-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  color: var(--faint);
  font-size: 0.875rem;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
}

.inline-vc { color: var(--faint); font-size: 0.875rem; }

.post-link {
  color: var(--ink);
  font-size: 1.35rem;
  line-height: 1.55;
  text-decoration: none;
  transition: color 0.2s ease;
}

.post-link:hover { color: var(--marker-deep); }

.post-link:focus-visible { outline: 2px solid var(--site-focus-ring); outline-offset: 3px; }

@media (max-width: 767px) {
  .blog-tabs { display: flex; }
  .blog-columns { grid-template-columns: 1fr; gap: 0; }
  .blog-column.mobile-hidden { display: none; }
  .column-title { display: none; }
  .post-link { font-size: 1.2rem; }
}
</style>
