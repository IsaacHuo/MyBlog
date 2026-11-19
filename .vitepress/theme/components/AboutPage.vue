<template>
  <div class="home">
    <!-- Hero: oversized name, vertical note, seal stamp (zhibi.fun hero) -->
    <section class="hero">
      <div class="hero-meta zb-meta">
        <span>{{ isZh ? '霍玮放 / 个人博客' : 'HUO WEIFANG / PERSONAL BLOG' }}</span>
        <span>POSTS · PROJECTS · FRAGMENTS</span>
      </div>

      <div class="hero-art">
        <p class="vertical-note">
          {{ isZh ? '写代码，做产品，观察技术。' : 'Code, products, technology.' }}
        </p>

        <h1
          class="hero-title"
          :class="{ 'hero-title-en': !isZh }"
        >
          <template v-if="isZh">
            <span>霍</span><span>玮</span><span>放</span>
          </template>
          <template v-else>
            <span>Huo</span><span>Weifang</span>
          </template>
        </h1>

        <div class="hero-side">
          <span>{{ isZh ? '希望能借由 AI，抵达更远的创造。' : 'Exploring what AI makes possible.' }}</span>
          <span>{{ isZh ? '这里存放了一些正在做的项目。' : 'Here are some projects I am working on.' }}</span>
        </div>

        <span
          class="art-stamp zb-stamp"
          aria-hidden="true"
        >{{ isZh ? '进行中' : 'Building' }}</span>
      </div>

      <div class="hero-bottom zb-meta">
        <a
          class="scroll-link"
          href="#recent"
        >{{ isZh ? '向下探索' : 'Scroll to explore' }}<b aria-hidden="true">↓</b></a>
        <span>{{ isZh ? '用代码和 AI，把想法做成能用的东西。' : 'Turning ideas into useful things with code and AI.' }}</span>
      </div>
    </section>

    <!-- Latest posts as tilted paper cards (zhibi.fun card table) -->
    <section
      v-if="recentPosts.length"
      id="recent"
      class="section"
    >
      <div class="zb-label">
        <span>01 / {{ isZh ? '最近的文章' : 'Recent posts' }}</span>
        <a :href="withBase(isZh ? '/zh/blog/' : '/en/blog/')">{{ isZh ? '全部文章' : 'All posts' }} →</a>
      </div>
      <div class="section-heading">
        <h2>{{ isZh ? '最近在想的事。' : 'On my mind lately.' }}</h2>
        <p>{{ isZh ? '技术笔记、产品思考与生活随想。' : 'Tech notes, product thinking and life.' }}</p>
      </div>
      <div class="card-table">
        <a
          v-for="post in recentPosts"
          :key="post.url"
          class="paper-card"
          :href="withBase(post.url)"
        >
          <span class="card-top">
            <span>{{ post.frontmatter.category || (isZh ? '文章' : 'Post') }}</span>
            <time :datetime="String(post.frontmatter.date)">{{ formatDate(post.frontmatter.date) }}</time>
          </span>
          <span
            class="card-word"
            aria-hidden="true"
          >{{ firstGlyph(post.frontmatter.title) }}</span>
          <span class="card-title">{{ post.frontmatter.title }}</span>
          <span
            v-if="post.frontmatter.description"
            class="card-copy"
          >{{ post.frontmatter.description }}</span>
          <span class="card-foot">{{ isZh ? '读下去' : 'Read on' }} →</span>
        </a>
      </div>
    </section>

    <!-- Projects as a flip-book (zhibi.fun book section) -->
    <section
      id="projects"
      class="section book-section"
    >
      <div class="zb-label">
        <span>{{ recentPosts.length ? '02' : '01' }} / {{ isZh ? '项目' : 'Projects' }}</span>
        <a :href="withBase(isZh ? '/zh/projects/' : '/en/projects/')">{{ isZh ? '全部项目' : 'View all' }} →</a>
      </div>
      <ProjectBook :is-zh="isZh" />
    </section>

    <!-- Closing: big glyph + contact list (zhibi.fun closing grid) -->
    <section class="section closing">
      <div class="zb-label">
        <span>{{ recentPosts.length ? '03' : '02' }} / {{ isZh ? '联系我' : 'Contact me' }}</span>
        <span>{{ isZh ? '欢迎交流' : 'Say hello' }}</span>
      </div>
      <div class="closing-grid">
        <div>
          <p
            class="closing-mark"
            aria-hidden="true"
          >
            {{ isZh ? '嗨' : 'Hi.' }}
          </p>
          <p class="closing-copy">
            {{ isZh ? '有想法、有问题，或者只是想打个招呼，都欢迎联系我。' : 'Ideas, questions, or just hello — get in touch.' }}
          </p>
        </div>
        <dl>
          <div>
            <dt>{{ isZh ? '邮箱' : 'Email' }}</dt>
            <dd>
              <button
                type="button"
                class="copy-button"
                :aria-label="isZh ? `复制邮箱 ${emailAddress}` : `Copy email ${emailAddress}`"
                @click="copyEmail"
              >
                {{ emailAddress }}
              </button>
              <span
                class="copy-status"
                :class="{ visible: emailCopyState !== 'idle' }"
                aria-live="polite"
              >{{ emailCopyStatusText }}</span>
            </dd>
          </div>
          <div>
            <dt>GitHub</dt>
            <dd>
              <a
                :href="githubUrl"
                target="_blank"
                rel="noopener noreferrer"
              >IsaacHuo ↗</a>
            </dd>
          </div>
          <div>
            <dt>{{ isZh ? '小红书' : 'Xiaohongshu' }}</dt>
            <dd>
              <a
                :href="xiaohongshuUrl"
                target="_blank"
                rel="noopener noreferrer"
              >{{ isZh ? '霍玮放' : 'Huo Weifang' }} ↗</a>
            </dd>
          </div>
          <div>
            <dt>{{ isZh ? '邮件' : 'Mail' }}</dt>
            <dd>
              <a :href="mailtoHref">{{ isZh ? '打开邮件' : 'Open mail' }} ↗</a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useData, withBase } from 'vitepress'
import { computed, onBeforeUnmount, ref } from 'vue'
import { data as blogPosts } from '../data/blogPosts.data.js'
import ProjectBook from './ProjectBook.vue'

type BlogPost = { url: string; frontmatter: Record<string, any> }

const { site, page } = useData()
const isZh = computed(() => site.value.lang === 'zh-Hant' || page.value.relativePath.startsWith('zh/'))
const emailAddress = 'huoweifang@foxmail.com'
const xiaohongshuUrl = 'https://www.xiaohongshu.com/user/profile/6767de890000000018017ac0'
const githubUrl = 'https://github.com/IsaacHuo'
const emailCopyState = ref<'idle' | 'copied' | 'error'>('idle')
let copyStatusTimer: ReturnType<typeof setTimeout> | null = null

const mailtoHref = computed(() => {
  const subject = encodeURIComponent(isZh.value ? '来自博客首页的邮件' : 'Message from blog homepage')
  return `mailto:${emailAddress}?subject=${subject}`
})

const recentPosts = computed<BlogPost[]>(() => {
  if (!Array.isArray(blogPosts)) return []
  const prefix = isZh.value ? '/zh/blog/' : '/en/blog/'
  return (blogPosts as BlogPost[]).filter(post => post.url.startsWith(prefix)).slice(0, 4)
})

const emailCopyStatusText = computed(() => {
  if (emailCopyState.value === 'idle') return ''
  if (emailCopyState.value === 'error') return isZh.value ? '复制失败' : 'Copy failed'
  return isZh.value ? '已复制' : 'Copied'
})

function firstGlyph(title?: string) {
  const text = String(title || '').trim()
  const cjk = text.match(/[\u3400-\u9fff]/)
  return cjk ? cjk[0] : (text[0] || '·').toUpperCase()
}

function formatDate(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(isZh.value ? 'zh-Hant' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
}

const copyEmail = async () => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(emailAddress)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = emailAddress
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const copied = document.execCommand('copy')
      document.body.removeChild(textarea)
      if (!copied) throw new Error('Copy command failed')
    }
    emailCopyState.value = 'copied'
  } catch {
    emailCopyState.value = 'error'
  }
  if (copyStatusTimer) window.clearTimeout(copyStatusTimer)
  copyStatusTimer = window.setTimeout(() => {
    emailCopyState.value = 'idle'
    copyStatusTimer = null
  }, 1500)
}

onBeforeUnmount(() => {
  if (copyStatusTimer) window.clearTimeout(copyStatusTimer)
})
</script>

<style scoped>
.home {
  color: var(--ink);
}

.zb-meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: var(--muted);
  font-size: 0.9375rem;
  letter-spacing: 0.06em;
  line-height: 1.7;
}

/* Hero */
.hero {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--vp-nav-height));
  padding: 25px 5% 34px;
}

.hero-art {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 460px;
  align-items: center;
  justify-content: center;
}

.hero-title {
  margin: 0;
  font-size: clamp(150px, 24vw, 380px);
  font-weight: 400;
  line-height: 0.95;
  letter-spacing: -0.06em;
  white-space: nowrap;
  animation: heroIn 0.9s ease-out both;
}

.hero-title span { display: inline-block; }
.hero-title span:nth-child(2) { color: var(--marker); transform: translateY(0.08em); }

.hero-title-en {
  display: flex;
  flex-direction: column;
  font-size: clamp(76px, 13vw, 210px);
  font-style: italic;
  line-height: 0.95;
  letter-spacing: -0.03em;
}

.hero-title-en span:nth-child(2) { margin-left: 0.9em; transform: none; }

.vertical-note {
  position: absolute;
  left: 2%;
  top: 24%;
  margin: 0;
  font-size: 1.15rem;
  line-height: 2;
  letter-spacing: 0.2em;
  writing-mode: vertical-rl;
}

.hero-side {
  position: absolute;
  right: 2%;
  top: 30%;
  display: flex;
  flex-direction: column;
  gap: 22px;
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.8;
  letter-spacing: 0.12em;
  writing-mode: vertical-rl;
}

.hero-side span,
.vertical-note { white-space: nowrap; }

html[lang='en'] .vertical-note,
html[lang='en'] .hero-side {
  letter-spacing: 0.08em;
}

.art-stamp {
  position: absolute;
  right: 15%;
  bottom: 12%;
  font-size: 1.1rem;
}

.hero-bottom { align-items: flex-end; }

.scroll-link {
  color: var(--ink);
  text-decoration: none;
}

.scroll-link b {
  margin-left: 15px;
  font-size: 20px;
  font-weight: 400;
}

/* Sections */
.section {
  padding: 96px 8%;
}

.book-section :deep(.pb) { margin-top: 48px; }

.zb-label a {
  color: var(--ink);
  text-decoration: none;
}

.zb-label a:hover { color: var(--marker-deep); }

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin: 56px 0 56px;
}

.section-heading h2 {
  margin: 0;
  font-size: clamp(44px, 5.8vw, 82px);
  font-weight: 400;
  line-height: 1.25;
}

.section-heading p {
  margin: 0 0 6px;
  color: var(--muted);
  font-size: 1.15rem;
  line-height: 1.8;
}

/* Paper cards */
.card-table {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  align-items: start;
}

.paper-card {
  display: flex;
  flex-direction: column;
  min-height: 400px;
  padding: 19px 18px 16px;
  color: var(--ink-2);
  background: var(--paper-card);
  box-shadow: var(--card-shadow);
  text-decoration: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.paper-card:nth-child(1) { transform: rotate(-1.2deg); }
.paper-card:nth-child(2) { transform: rotate(0.7deg); margin-top: 22px; }
.paper-card:nth-child(3) { transform: rotate(-0.6deg); margin-top: 4px; }
.paper-card:nth-child(4) { transform: rotate(1deg); margin-top: 26px; }

.paper-card:hover {
  transform: rotate(0deg) translateY(-4px);
  box-shadow: 0 10px 26px rgb(57 67 55 / 14%);
}

.card-top {
  display: flex;
  min-height: 2.4rem;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0 8px;
  border: 1px solid #9e9f93;
  font-size: 0.875rem;
  letter-spacing: 0.04em;
}

.card-word {
  margin: 26px 0 10px;
  color: var(--ink);
  font-size: 94px;
  line-height: 1;
}

.card-title {
  color: var(--ink);
  font-size: 1.25rem;
  line-height: 1.55;
}

.card-copy {
  display: -webkit-box;
  margin-top: 10px;
  overflow: hidden;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.7;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

.card-foot {
  margin-top: auto;
  padding-top: 18px;
  color: var(--faint);
  font-size: 0.875rem;
  text-align: center;
}

/* Projects */
.project-grid {
  display: grid;
  margin-top: 40px;
}

.project-row {
  display: grid;
  grid-template-columns: 4rem minmax(0, 14rem) 1fr;
  align-items: baseline;
  gap: 1.5rem;
  padding: 22px 0;
  border-bottom: 1px solid var(--rule);
  color: var(--ink);
  text-decoration: none;
  transition: padding 0.25s ease, color 0.25s ease;
}

.project-row:hover {
  padding-left: 10px;
  color: var(--marker-deep);
}

.project-index {
  color: var(--faint);
  font-size: 0.95rem;
  font-variant-numeric: tabular-nums;
}

.project-row strong {
  font-size: 1.6rem;
  font-weight: 400;
}

.project-row small {
  color: var(--muted);
  font-size: 1.05rem;
}

/* Closing */
.closing-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15%;
  margin-top: 64px;
}

.closing-mark {
  margin: 0;
  font-size: clamp(100px, 14vw, 200px);
  line-height: 1;
}

.closing-copy {
  max-width: 26rem;
  margin: 28px 0 0;
  font-size: 1.4rem;
  line-height: 1.7;
}

.closing dl {
  align-self: end;
  margin: 0;
}

.closing dl div {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  padding: 17px 0;
  border-bottom: 1px solid var(--rule);
  font-size: 1rem;
}

.closing dt { color: var(--muted); }

.closing dd {
  position: relative;
  margin: 0;
  text-align: right;
}

.closing dd a,
.copy-button {
  padding: 0;
  border: 0;
  background: none;
  color: var(--ink);
  font: inherit;
  text-decoration: underline;
  text-decoration-color: var(--marker);
  text-underline-offset: 4px;
  cursor: pointer;
}

.closing dd a:hover,
.copy-button:hover { color: var(--marker-deep); }

.copy-status {
  position: absolute;
  right: 0;
  top: -1.4rem;
  color: var(--marker-deep);
  font-size: 0.85rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.copy-status.visible { opacity: 1; }

@keyframes heroIn {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1000px) {
  .card-table { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
  .paper-card:nth-child(n) { margin-top: 0; }
  .paper-card:nth-child(2n) { margin-top: 18px; }
}

@media (max-width: 900px) {
  .closing-grid { grid-template-columns: 1fr; gap: 45px; }
  .project-row { grid-template-columns: 3rem 1fr; }
  .project-row small { grid-column: 2; }
}

@media (max-width: 700px) {
  .hero { min-height: calc(100svh - var(--vp-nav-height)); padding: 22px 6%; }
  .hero-meta span:last-child,
  .hero-bottom > span:last-child { display: none; }
  .hero-art { min-height: 370px; }
  .hero-title { font-size: 30vw; }
  .hero-title-en { font-size: 19vw; }
  .vertical-note { left: 0; top: 8%; font-size: 0.95rem; }
  .hero-side { display: none; }
  .art-stamp { right: 10%; bottom: 10%; }
  .section { padding: 72px 6%; }
  .section-heading { display: block; margin: 40px 0; }
  .section-heading h2 { font-size: 38px; }
  .section-heading p { margin-top: 16px; }
  .card-table { grid-template-columns: 1fr; gap: 18px; }
  .paper-card { min-height: 0; padding: 20px; }
  .paper-card:nth-child(n) { margin-top: 0; transform: none; }
  .card-word { font-size: 4.5rem; }
  .project-row { gap: 0.4rem 1rem; }
  .project-row strong { font-size: 1.35rem; }
  .closing dl div { flex-wrap: wrap; }
}
</style>
