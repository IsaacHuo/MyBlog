<template>
  <div class="blog-list-page">
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
  return site.value.lang === 'zh-CN' || page.value.relativePath.startsWith('zh/')
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
.blog-list-page {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 30px 15px;
  text-align: left;
}

.blog-tabs {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 40px;
}

.blog-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 48px;
}

.blog-column {
  min-width: 0;
}

.column-title {
  margin: 0 0 28px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  font-size: 22px;
  font-weight: 400;
  line-height: 1.4;
}

.tab-btn {
  background: none;
  border: none;
  font-size: 18px;
  font-family: inherit;
  color: var(--vp-c-text-3);
  cursor: pointer;
  padding: 6px 16px;
  transition: color 0.2s;
}

.tab-btn:hover {
  color: var(--vp-c-text-1);
}

.tab-btn.active {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.tab-divider {
  color: var(--vp-c-border);
  font-size: 18px;
  user-select: none;
}

.post-list {
  list-style: none;
  margin: 0;
  padding: 0;
  text-align: left;
}

.post-list-item {
  margin-bottom: 28px;
}

.post-meta {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
  color: var(--vp-c-text-3);
  font-size: 14px;
  line-height: 1.5;
}

.post-meta :deep(.view-count) {
  font-size: 14px;
  margin-top: 0;
}

.post-link {
  display: block;
  color: #4d74eb !important;
  font-size: 21px;
  line-height: 1.35;
  text-decoration: none;
}

.post-link:hover {
  color: var(--vp-c-text-1) !important;
  text-decoration: underline;
}

@media (max-width: 800px) {
  .blog-list-page {
    padding-right: 7.5px;
    padding-left: 7.5px;
  }

  .blog-tabs {
    display: flex;
  }

  .blog-columns {
    display: block;
  }

  .blog-column.mobile-hidden {
    display: none;
  }

  .column-title {
    display: none;
  }

  .post-link {
    font-size: 24px;
  }
}
</style>
