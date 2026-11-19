<template>
  <Layout :class="{ 'is-article-page': isContentPage, 'is-project-page': isProjectPage }">
    <template
      v-if="isContentPage"
      #doc-after
    >
      <div class="article-meta-container">
        <span class="article-seal zb-stamp">{{ isZh ? '終' : 'Fin' }}</span>
        <span class="article-sign">{{ isZh ? '感謝閱讀。' : 'Thanks for reading.' }}</span>
        <span class="article-meta-line">
          <span>{{ articleMetaText }}</span>
          <ViewCounter
            :id="pageViewId"
            :key="pageViewId"
            :legacy-ids="legacyPageViewIds"
            :is-zh="isZh"
          />
        </span>
      </div>
      <div class="article-comments-section">
        <Comments />
      </div>
    </template>
    <template
      v-if="isContentPage"
      #doc-before
    >
      <p class="article-eyebrow zb-label">
        <span>{{ articleKind }}</span>
        <span>{{ articleMetaText }}</span>
      </p>
    </template>
    <template #nav-bar-content-before>
      <HeaderClock />
    </template>
    <!-- 回到顶部按钮 -->
    <template #layout-bottom>
      <BackToTop />
      <ArticleTOC v-if="isContentPage" />
    </template>
    <template #nav-bar-content-after>
      <a
        :class="['custom-language-link', languageLink.className]"
        :href="languageLink.href"
        :aria-label="languageLink.label"
        :title="languageLink.label"
        @click="handleLanguageClick"
      >
        {{ languageLink.text }}
      </a>
    </template>
    <template #nav-screen-content-after>
      <a
        :class="['custom-language-link', 'nav-screen-language-link', languageLink.className]"
        :href="languageLink.href"
        :aria-label="languageLink.label"
        :title="languageLink.label"
        @click="handleLanguageClick"
      >
        {{ languageLink.text }}
      </a>
    </template>
  </Layout>
</template>

<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { computed } from 'vue'
import BackToTop from './components/BackToTop.vue'
import Comments from './components/Comments.vue'
import ArticleTOC from './components/ArticleTOC.vue'
import HeaderClock from './components/HeaderClock.vue'

const { Layout } = DefaultTheme
const { frontmatter, page, lang } = useData()

const localizedPageModules = import.meta.glob('../../{zh,en}/**/*.md')
const availableLocalizedPages = new Set(
  Object.keys(localizedPageModules).map(path => path.replace(/^\.\.\/\.\.\//, ''))
)

const isContentPage = computed(() => {
  const path = page.value.relativePath || ''
  return (path.indexOf('blog/') !== -1 || path.indexOf('projects/') !== -1) &&
         path.indexOf('index.md') === -1
})

const isProjectPage = computed(() => {
  const path = page.value.relativePath || ''
  return path.indexOf('projects/') !== -1 && path.indexOf('index.md') === -1
})

const isZh = computed(() => lang.value === 'zh-Hant')

const pageRelativePath = computed(() => page.value.relativePath || '')
const pageViewId = computed(() => toCanonicalViewId(pageRelativePath.value))
const legacyPageViewIds = computed(() => {
  const path = pageRelativePath.value
  if (!path || path === pageViewId.value) return []
  return [path]
})

const toCanonicalViewId = (path) => {
  return (path || '').replace(/^\//, '').replace(/\.md$/, '').replace(/\/$/, '')
}

const switchLocalePath = (relativePath, targetLocale) => {
  const path = relativePath || ''
  const withoutLocale = path.replace(/^(zh|en)\//, '')
  const requestedPage = `${targetLocale}/${withoutLocale || 'index.md'}`
  const targetPage = availableLocalizedPages.has(requestedPage)
    ? requestedPage
    : `${targetLocale}/index.md`

  return `/${targetPage.replace(/index\.md$/, '').replace(/\.md$/, '')}`
}

const languageLink = computed(() => {
  const targetLocale = isZh.value ? 'en' : 'zh'
  const path = page.value.relativePath || ''
  const withoutLocale = path.replace(/^(zh|en)\//, '')
  const hasTranslation = availableLocalizedPages.has(`${targetLocale}/${withoutLocale}`)
  const fallbackLabel = isZh.value
    ? 'This page has no English translation. Go to the English homepage.'
    : '此页面暂无中文翻译，前往中文首页。'

  return isZh.value
    ? {
        text: 'EN',
        href: switchLocalePath(path, 'en'),
        className: 'language-link-en',
        label: hasTranslation ? 'Read this page in English' : fallbackLabel
      }
    : {
        text: '中文',
        href: switchLocalePath(path, 'zh'),
        className: 'language-link-zh',
        label: hasTranslation ? '阅读此页面的中文版' : fallbackLabel
      }
})

const handleLanguageClick = (event) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
  event.preventDefault()
  window.location.assign(languageLink.value.href)
}

const articleKind = computed(() => {
  if (isProjectPage.value) return isZh.value ? '項目 / PROJECT' : 'PROJECT'
  const category = frontmatter.value.category
  if (category) return isZh.value ? `${category} / ESSAY` : String(category).toUpperCase()
  return isZh.value ? '文章 / ESSAY' : 'ESSAY'
})

const articleMetaText = computed(() => {
  if (!isContentPage.value) return ''
  const parts = []
  if (frontmatter.value.date) {
    parts.push(formatArticleDate(frontmatter.value.date))
  }
  if (frontmatter.value.author) {
    parts.push(frontmatter.value.author)
  }
  return parts.join(' · ')
})

const formatArticleDate = (value) => {
  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat(isZh.value ? 'zh-Hant' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  } catch {
    return value
  }
}

</script>

<style>
.article-eyebrow {
  margin: 0 0 0.5rem !important;
  font-size: 0.9375rem;
}

.article-meta-container {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  column-gap: 18px;
  align-items: center;
  margin-top: 3.5rem;
  padding-top: 1.75rem;
  border-top: 1px solid var(--rule-strong);
  color: var(--muted);
  font-size: 0.95rem;
}

.article-seal {
  grid-row: 1 / 3;
  font-size: 1.3rem;
}

.article-sign {
  color: var(--ink);
  font-size: 1.15rem;
  letter-spacing: 0.06em;
}

.article-meta-line {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
}

.article-meta-container :deep(.view-count) {
  margin-top: 0;
  font-size: 0.95rem;
}

.article-comments-section {
  margin-top: 2rem;
  padding-top: 1rem;
}
</style>
