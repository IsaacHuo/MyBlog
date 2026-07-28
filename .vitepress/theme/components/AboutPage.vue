<template>
  <div class="about-layout">
    <div class="about-content">
      <div class="about-avatar">
        <a
          href="https://www.xiaohongshu.com/user/profile/6767de890000000018017ac0"
          target="_blank"
          class="avatar-link"
        >
          <img
            src="/avatar.jpg"
            :alt="isZh ? '霍玮放' : 'Huo Weifang'"
            class="avatar-image"
          >
        </a>
      </div>
      <p class="about-intro">
        <template v-if="isZh">
          写代码，做产品，观察技术。
        </template>
        <template v-else>
          Building products, writing code, watching technology.
        </template>
      </p>
      <p class="about-description">
        <template v-if="isZh">
          这里存放了一些文章、一些项目，<br>也收集一些不成篇的片段。
        </template>
        <template v-else>
          Here are essays and projects,<br>alongside fragments that do not need to become either.
        </template>
      </p>
      <p class="about-description">
        <template v-if="isZh">
          希望能借由 AI，抵达更远的创造。
        </template>
        <template v-else>
          Exploring what AI makes possible.
        </template>
      </p>

      <div class="home-showcase">
        <section class="showcase-section">
          <div class="showcase-heading">
            <h2>{{ isZh ? '项目' : 'Projects' }}</h2>
            <a :href="withBase(isZh ? '/zh/projects/' : '/en/projects/')">
              {{ isZh ? '全部项目' : 'View all' }}
            </a>
          </div>
          <div class="showcase-list">
            <a
              v-for="project in featuredProjects"
              :key="project.url"
              class="showcase-item"
              :href="withBase(project.url)"
            >
              <span>
                <strong>{{ project.title }}</strong>
                <small>{{ project.description }}</small>
              </span>
            </a>
          </div>
        </section>

        <section class="showcase-section">
          <div class="showcase-heading">
            <h2>{{ isZh ? '最新笔记' : 'Latest notes' }}</h2>
            <a :href="withBase(isZh ? '/zh/blog/' : '/en/blog/')">
              {{ isZh ? '全部文章' : 'View all' }}
            </a>
          </div>
          <div class="showcase-list">
            <a
              v-for="note in latestNotes"
              :key="note.url"
              class="showcase-item"
              :href="withBase(note.url)"
            >
              <span>
                <strong>{{ note.frontmatter.title }}</strong>
                <small>{{ formatDate(note.frontmatter.date) }}</small>
              </span>
            </a>
          </div>
        </section>
      </div>

      <div class="about-contact">
        <h3>{{ isZh ? '联系我' : 'Contact me' }}</h3>
        <div class="contact-body">
          <div class="contact-links">
            <span class="mail-copy-control">
              <button
                type="button"
                class="contact-icon-link contact-icon-button"
                :aria-label="isZh ? `复制邮箱 ${emailAddress}` : `Copy email ${emailAddress}`"
                @click="copyEmail"
              >
                <svg
                  class="contact-icon"
                  viewBox="0 0 256 256"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="m228.44 89.34l-96-64a8 8 0 0 0-8.88 0l-96 64A8 8 0 0 0 24 96v104a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V96a8 8 0 0 0-3.56-6.66M128 41.61l81.91 54.61l-67 47.78h-29.8l-67-47.78ZM40 200v-88.47l65.9 47a8 8 0 0 0 4.65 1.49h34.9a8 8 0 0 0 4.65-1.49l65.9-47V200Z"
                  />
                </svg>
              </button>
              <span
                class="copy-status"
                :class="{ visible: emailCopyState === 'copied' }"
                aria-live="polite"
              >
                {{ emailCopyStatusText }}
              </span>
            </span>

            <a
              class="contact-icon-link"
              :href="xiaohongshuUrl"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="isZh ? '小红书' : 'Xiaohongshu'"
              :title="isZh ? '小红书' : 'Xiaohongshu'"
            >
              <svg
                class="contact-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M22.405 9.879c.002.016.01.02.07.019h.725a.797.797 0 0 0 .78-.972a.794.794 0 0 0-.884-.618a.795.795 0 0 0-.692.794c0 .101-.002.666.001.777m-11.509 4.808c-.203.001-1.353.004-1.685.003a2.5 2.5 0 0 1-.766-.126a.025.025 0 0 0-.03.014L7.7 16.127a.025.025 0 0 0 .01.032c.111.06.336.124.495.124c.66.01 1.32.002 1.981 0q.017 0 .023-.015l.712-1.545a.025.025 0 0 0-.024-.036zM.477 9.91c-.071 0-.076.002-.076.01l-.01.08c-.027.397-.038.495-.234 3.06c-.012.24-.034.389-.135.607c-.026.057-.033.042.003.112c.046.092.681 1.523.787 1.74c.008.015.011.02.017.02c.008 0 .033-.026.047-.044q.219-.282.371-.606c.306-.635.44-1.325.486-1.706c.014-.11.021-.22.03-.33l.204-2.616l.022-.293c.003-.029 0-.033-.03-.034zm7.203 3.757a1.4 1.4 0 0 1-.135-.607c-.004-.084-.031-.39-.235-3.06a.4.4 0 0 0-.01-.082c-.004-.011-.052-.008-.076-.008h-1.48c-.03.001-.034.005-.03.034l.021.293q.114 1.473.233 2.946c.05.4.186 1.085.487 1.706c.103.215.223.419.37.606c.015.018.037.051.048.049c.02-.003.742-1.642.804-1.765c.036-.07.03-.055.003-.112m3.861-.913h-.872a.126.126 0 0 1-.116-.178l1.178-2.625a.025.025 0 0 0-.023-.035l-1.318-.003a.148.148 0 0 1-.135-.21l.876-1.954a.025.025 0 0 0-.023-.035h-1.56q-.017 0-.024.015l-.926 2.068c-.085.169-.314.634-.399.938a.5.5 0 0 0-.02.191a.46.46 0 0 0 .23.378a1 1 0 0 0 .46.119h.59c.041 0-.688 1.482-.834 1.972a.5.5 0 0 0-.023.172a.47.47 0 0 0 .23.398c.15.092.342.12.475.12l1.66-.001q.017 0 .023-.015l.575-1.28a.025.025 0 0 0-.024-.035m-6.93-4.937H3.1a.032.032 0 0 0-.034.033c0 1.048-.01 2.795-.01 6.829c0 .288-.269.262-.28.262h-.74c-.04.001-.044.004-.04.047c.001.037.465 1.064.555 1.263c.01.02.03.033.051.033c.157.003.767.009.938-.014c.153-.02.3-.06.438-.132c.3-.156.49-.419.595-.765c.052-.172.075-.353.075-.533q.003-3.495-.007-6.991a.03.03 0 0 0-.032-.032zm11.784 6.896q-.002-.02-.024-.022h-1.465c-.048-.001-.049-.002-.05-.049v-4.66c0-.072-.005-.07.07-.07h.863c.08 0 .075.004.075-.074V8.393c0-.082.006-.076-.08-.076h-3.5c-.064 0-.075-.006-.075.073v1.445c0 .083-.006.077.08.077h.854c.075 0 .07-.004.07.07v4.624c0 .095.008.084-.085.084c-.37 0-1.11-.002-1.304 0c-.048.001-.06.03-.06.03l-.697 1.519s-.014.025-.008.036s.013.008.058.008q2.622.003 5.243.002c.03-.001.034-.006.035-.033zm4.177-3.43q0 .021-.02.024c-.346.006-.692.004-1.037.004q-.021-.003-.022-.024q-.006-.651-.01-1.303c0-.072-.006-.071.07-.07l.733-.003c.041 0 .081.002.12.015c.093.025.16.107.165.204c.006.431.002 1.153.001 1.153m2.67.244a1.95 1.95 0 0 0-.883-.222h-.18c-.04-.001-.04-.003-.042-.04V10.21q.001-.198-.025-.394a1.8 1.8 0 0 0-.153-.53a1.53 1.53 0 0 0-.677-.71a2.2 2.2 0 0 0-1-.258c-.153-.003-.567 0-.72 0c-.07 0-.068.004-.068-.065V7.76c0-.031-.01-.041-.046-.039H17.93s-.016 0-.023.007q-.008.008-.008.023v.546c-.008.036-.057.015-.082.022h-.95c-.022.002-.028.008-.03.032v1.481c0 .09-.004.082.082.082h.913c.082 0 .072.128.072.128v1.148s.003.117-.06.117h-1.482c-.068 0-.06.082-.06.082v1.445s-.01.068.064.068h1.457c.082 0 .076-.006.076.079v3.225c0 .088-.007.081.082.081h1.43c.09 0 .082.007.082-.08v-3.27c0-.029.006-.035.033-.035l2.323-.003a.7.7 0 0 1 .28.061a.46.46 0 0 1 .274.407c.008.395.003.79.003 1.185c0 .259-.107.367-.33.367h-1.218c-.023.002-.029.008-.028.033q.276.655.57 1.303a.05.05 0 0 0 .04.026c.17.005.34.002.51.003c.15-.002.517.004.666-.01a2 2 0 0 0 .408-.075c.59-.18.975-.698.976-1.313v-1.981q.001-.191-.034-.38c0 .078-.029-.641-.724-.998"
                />
              </svg>
            </a>
            <a
              class="contact-icon-link"
              :href="githubUrl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              title="GitHub"
            >
              <svg
                class="contact-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M12 .297c-6.63 0-12 5.373-12 12c0 5.303 3.438 9.8 8.205 11.385c.6.113.82-.258.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998c.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.96-.267 1.98-.399 3-.405c1.02.006 2.04.138 3 .405c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22c0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                />
              </svg>
            </a>
          </div>

          <form
            class="mail-compose"
            :class="isZh ? 'mail-compose-zh' : 'mail-compose-en'"
            @submit.prevent="sendEmail"
          >
            <textarea
              v-model="mailBody"
              rows="1"
              :placeholder="isZh ? '联系我...' : 'Write your message...'"
            />
            <button type="submit">
              {{ isZh ? '发送邮件' : 'Send email' }}
            </button>
          </form>

          <p class="contact-note">
            {{ isZh
              ? '我正在找寻实习，如您需要，可以给您发送我的简历。'
              : 'I am currently looking for an internship and can share my resume if needed.'
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useData, withBase } from 'vitepress'
import { computed, ref } from 'vue'
import { data as blogPosts } from '../data/blogPosts.data.js'

type BlogPost = {
  url: string
  frontmatter: Record<string, any>
}

const { site, page } = useData()
const isZh = site.value.lang === 'zh-CN' || page.value.relativePath.startsWith('zh/')
const emailAddress = 'huoweifang@foxmail.com'
const xiaohongshuUrl = 'https://www.xiaohongshu.com/user/profile/6767de890000000018017ac0'
const githubUrl = 'https://github.com/IsaacHuo'
const mailBody = ref('')
const emailCopyState = ref<'idle' | 'copied'>('idle')

const emailCopyStatusText = computed(() => isZh ? '已复制' : 'Copied')

const featuredProjects = computed(() => isZh
  ? [
      {
        title: 'MyLeafy',
        description: '以课表为核心的校园 iOS 应用',
        url: '/zh/projects/leafy'
      },
      {
        title: 'MapToPoster',
        description: '城市地图海报生成器',
        url: '/zh/projects/maptoposter'
      }
    ]
  : [
      {
        title: 'MyLeafy',
        description: 'A timetable-centered campus iOS app',
        url: '/en/projects/leafy'
      },
      {
        title: 'MapToPoster',
        description: 'A city map poster generator',
        url: '/en/projects/maptoposter'
      }
    ])

const latestNotes = computed(() => {
  const localePrefix = isZh ? '/zh/blog/' : '/en/blog/'
  return (blogPosts as BlogPost[])
    .filter((post) => post.url.startsWith(localePrefix))
    .slice(0, 2)
})

const formatDate = (value?: string) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(isZh ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const sendEmail = () => {
  const subject = encodeURIComponent(isZh ? '来自博客首页的邮件' : 'Message from blog homepage')
  const body = encodeURIComponent(mailBody.value.trim())
  window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`
}

const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(emailAddress)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = emailAddress
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }

  emailCopyState.value = 'copied'
  window.setTimeout(() => {
    emailCopyState.value = 'idle'
  }, 1500)
}
</script>

<style scoped>
.about-layout,
.about-layout *,
.about-layout a,
.about-layout a * {
  font-family: inherit !important;
}

.about-layout {
  /* 单列容器，和内容最大宽度保持一致 */
  display: block;
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: calc(var(--space-3xl) + var(--space-lg)) var(--space-lg) var(--space-3xl);
}


.about-content h1 {
  font-size: var(--vp-font-size-3xl);
  font-weight: 700;
  margin-bottom: var(--space-xl);
  color: var(--vp-c-text-1);
}

/* 头像浮动到右侧，让正文自然环绕 */
.about-avatar {
  float: right;
  width: 220px;
  height: 220px;
  margin-left: var(--space-xl);
  margin-bottom: var(--space-md);
  shape-outside: circle(50%);
  -webkit-shape-outside: circle(50%);
  clip-path: circle(50% at 50% 50%);
}

.about-avatar .avatar-link {
  display: block;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 50%;
}

.about-avatar .avatar-link:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.about-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--vp-c-border);
  transition: border-color 0.3s ease;
}

.about-avatar .avatar-link:hover img {
  border-color: var(--vp-c-brand-1);
}

.welcome-message {
  font-size: var(--vp-font-size-xl);
  line-height: 1.7;
  color: var(--vp-c-text-1);
  margin-bottom: var(--space-lg);
}

.about-intro,
.about-description {
  font-size: var(--vp-font-size-lg);
  line-height: 1.7;
  color: var(--vp-c-text-1);
  margin-bottom: var(--space-lg);
}

.about-intro {
  font-family: inherit !important;
}

.about-intro a,
.about-intro :deep(a),
.about-description :deep(a) {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  transition: color 0.3s ease;
  font-family: inherit !important;
}

.about-intro a:hover,
.about-intro :deep(a:hover),
.about-description :deep(a:hover) {
  color: var(--vp-c-brand-2);
  text-decoration: underline;
}

.about-intro strong,
.about-description strong {
  font-weight: normal;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

.about-intro :deep(strong),
.about-description :deep(strong) {
  font-weight: normal !important;
  text-decoration: underline !important;
  text-decoration-thickness:0.5px !important;
  text-underline-offset: 3px !important;
}

.home-showcase {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-xl);
  clear: both;
  padding-top: var(--space-xl);
}

.showcase-section {
  min-width: 0;
}

.showcase-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-sm);
}

.showcase-heading h2 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 20px;
  font-weight: 400;
  line-height: 1.4;
}

.showcase-heading a {
  flex: 0 0 auto;
  font-size: 14px;
  text-decoration: none;
}

.showcase-list {
  border-top: 1px solid var(--vp-c-divider);
}

.showcase-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  padding: 13px 0;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1) !important;
  text-decoration: none;
}

.showcase-item > span:first-child {
  min-width: 0;
}

.showcase-item strong,
.showcase-item small {
  display: block;
}

.showcase-item strong {
  color: var(--vp-c-text-1);
  font-size: 17px;
  font-weight: 400;
  line-height: 1.45;
}

.showcase-item small {
  margin-top: 2px;
  color: var(--vp-c-text-3);
  font-size: 13px;
  line-height: 1.45;
}

.showcase-item:hover {
  color: #4d74eb !important;
}

.showcase-item:hover strong {
  color: #4d74eb;
}

.about-contact {
  margin-top: var(--space-2xl);
  margin-bottom: var(--space-xl);
  clear: both; /* 后续区块不受浮动影响 */
}

.about-contact h3 {
  font-size: 20px;
  font-weight: 400 !important;
  margin-bottom: var(--space-md);
  color: var(--vp-c-text-1);
  display: inline-block;
  border: 2px solid var(--vp-c-text-1);
  border-radius: 35px; /* 胶囊形状的大圆角 */
  padding: 2px 10px;
}

.contact-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  align-items: flex-start;
}

.contact-links {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mail-copy-control {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.contact-icon-link {
  color: #4d74eb !important;
  text-decoration: none;
}

.contact-icon-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.contact-icon-button {
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.contact-icon {
  display: block;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
}

.contact-icon-link:hover {
  color: #3a5bc7 !important;
  text-decoration: none;
}

.copy-status {
  position: absolute;
  left: 50%;
  top: calc(100% + 8px);
  transform: translateX(-50%) translateY(-2px);
  padding: 5px 8px;
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  color: #4d74eb;
  font-size: var(--vp-font-size-sm);
  font-weight: 400 !important;
  line-height: 1;
  opacity: 0;
  pointer-events: none;
  white-space: nowrap;
  transition: opacity 0.18s ease, transform 0.18s ease;
  z-index: 2;
}

.copy-status.visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.mail-compose {
  display: flex;
  width: var(--mail-compose-width);
  min-width: 240px;
  max-width: 100%;
  min-height: 38px;
  border: 1px solid #4d74eb;
  border-radius: 14px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  box-shadow: 0 0 0 1px rgba(77, 116, 235, 0.08);
}

.mail-compose-en {
  --mail-compose-width: 510px;
}

.mail-compose-zh {
  --mail-compose-width: 330px;
}

.mail-compose textarea {
  flex: 1;
  min-width: 0;
  height: 38px;
  min-height: 38px;
  border: 0;
  padding: 8px 12px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: var(--vp-font-size-md);
  line-height: 1.4;
  outline: none;
  overflow-y: auto;
  resize: vertical;
  scrollbar-width: none;
}

.mail-compose textarea::-webkit-scrollbar {
  display: none;
}

.mail-compose textarea::placeholder {
  color: var(--vp-c-text-3);
}

.mail-compose button {
  flex: 0 0 auto;
  border: 0;
  padding: 0 14px;
  background: #4d74eb;
  color: #ffffff;
  font-size: var(--vp-font-size-md);
  cursor: pointer;
  white-space: nowrap;
}

.mail-compose button:hover {
  background: #3a5bc7;
}

.contact-note {
  margin: calc(var(--space-xs) * -1) 0 0;
  color: #6b7280;
  font-size: var(--vp-font-size-sm);
  font-weight: 400 !important;
  line-height: 1.5;
}

:global(.dark) .contact-note {
  color: #9ca3af;
}

@media (max-width: 768px) {
  .about-layout {
    padding-top: var(--space-3xl);
  }

  .about-avatar {
    float: none;
    width: 160px;
    height: 160px;
    margin: 0 auto var(--space-lg) auto;
    shape-outside: none;
  }

  .about-contact {
    margin-top: var(--space-xl);
  }

  .home-showcase {
    grid-template-columns: 1fr;
    gap: var(--space-xl);
    padding-top: var(--space-md);
  }

  .mail-compose {
    flex-direction: row;
    width: 100%;
    min-width: 0;
    max-width: none;
  }

  .mail-compose button {
    padding: 12px 16px;
  }
}
</style>
