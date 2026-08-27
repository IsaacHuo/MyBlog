<template>
  <section
    ref="container"
    class="comments-wrapper"
    :aria-busy="status === 'loading'"
    aria-labelledby="comments-title"
  >
    <h2
      id="comments-title"
      class="comments-title"
    >
      {{ messages.title }}
    </h2>

    <p
      v-if="status === 'loading'"
      class="comments-status comments-loading"
      role="status"
      aria-live="polite"
    >
      {{ messages.loading }}
    </p>
    <div
      v-else-if="status === 'error'"
      class="comments-status comments-error"
      role="alert"
    >
      <span>{{ messages.error }}</span>
      <button
        class="comments-retry"
        type="button"
        @click="initializeGiscus(true)"
      >
        {{ messages.retry }}
      </button>
    </div>

    <div
      ref="giscusHost"
      class="giscus-host"
    />
    <noscript>
      <p class="comments-status">{{ messages.noscript }}</p>
    </noscript>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

const { isDark, lang, page } = useData()
const container = ref<HTMLElement | null>(null)
const giscusHost = ref<HTMLElement | null>(null)
const status = ref<LoadStatus>('idle')

const isChinese = computed(() => {
  return /^zh(?:-|$)/i.test(lang.value) || page.value.relativePath.startsWith('zh/')
})

const giscusLang = computed(() => isChinese.value ? 'zh-CN' : 'en')
const giscusTheme = computed(() => isDark.value ? 'dark' : 'light')
const messages = computed(() => isChinese.value
  ? {
      title: '评论',
      loading: '评论加载中...',
      error: '评论加载失败，请稍后重试。',
      retry: '重试',
      noscript: '请启用 JavaScript 以加载评论。'
    }
  : {
      title: 'Comments',
      loading: 'Loading comments...',
      error: 'Comments failed to load. Please try again later.',
      retry: 'Retry',
      noscript: 'Enable JavaScript to load comments.'
    })

const giscusBaseConfig: Record<string, string> = {
  'data-repo': 'IsaacHuo/MyBlog',
  'data-repo-id': 'R_kgDOO6P-Dg',
  'data-category': 'Announcements',
  'data-category-id': 'DIC_kwDOO6P-Ds4Cy4z-',
  'data-mapping': 'pathname',
  'data-strict': '0',
  'data-reactions-enabled': '1',
  'data-emit-metadata': '0',
  'data-input-position': 'bottom',
  'data-loading': 'lazy'
}

let activeConfigKey = ''
let hasEnteredViewport = false
let isMounted = false
let loadGeneration = 0
let loadTimeout: ReturnType<typeof setTimeout> | null = null
let intersectionObserver: IntersectionObserver | null = null
let hostObserver: MutationObserver | null = null
let observedFrame: HTMLIFrameElement | null = null

function clearLoadTimeout() {
  if (loadTimeout) {
    clearTimeout(loadTimeout)
    loadTimeout = null
  }
}

function updateGiscusTheme() {
  const script = giscusHost.value?.querySelector<HTMLScriptElement>('script[src="https://giscus.app/client.js"]')
  script?.setAttribute('data-theme', giscusTheme.value)

  const frame = giscusHost.value?.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
  frame?.contentWindow?.postMessage({
    giscus: {
      setConfig: { theme: giscusTheme.value }
    }
  }, 'https://giscus.app')
}

function connectGiscusFrame() {
  const frame = giscusHost.value?.querySelector<HTMLIFrameElement>('iframe.giscus-frame') ?? null
  if (!frame || frame === observedFrame) return

  observedFrame = frame
  updateGiscusTheme()
  frame.addEventListener('load', () => {
    if (frame !== observedFrame) return
    clearLoadTimeout()
    status.value = 'ready'
    updateGiscusTheme()
  }, { once: true })
}

function initializeGiscus(force = false) {
  if (!isMounted || !hasEnteredViewport || !giscusHost.value) return

  const configKey = `${page.value.relativePath}|${giscusLang.value}`
  if (!force && configKey === activeConfigKey && giscusHost.value.childNodes.length > 0) return

  activeConfigKey = configKey
  observedFrame = null
  const generation = ++loadGeneration
  clearLoadTimeout()
  status.value = 'loading'
  giscusHost.value.replaceChildren()

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.async = true
  script.crossOrigin = 'anonymous'

  Object.entries(giscusBaseConfig).forEach(([key, value]) => {
    script.setAttribute(key, value)
  })
  script.setAttribute('data-lang', giscusLang.value)
  script.setAttribute('data-theme', giscusTheme.value)

  script.addEventListener('load', connectGiscusFrame, { once: true })
  script.addEventListener('error', () => {
    if (generation !== loadGeneration) return
    clearLoadTimeout()
    status.value = 'error'
  }, { once: true })

  giscusHost.value.appendChild(script)
  loadTimeout = setTimeout(() => {
    if (generation === loadGeneration && status.value === 'loading') {
      status.value = 'error'
    }
  }, 15000)
}

watch(
  [() => page.value.relativePath, giscusLang],
  () => initializeGiscus(),
  { flush: 'post' }
)

watch(giscusTheme, updateGiscusTheme, { flush: 'post' })

onMounted(() => {
  isMounted = true
  hostObserver = new MutationObserver(connectGiscusFrame)
  if (giscusHost.value) {
    hostObserver.observe(giscusHost.value, { childList: true, subtree: true })
  }

  if ('IntersectionObserver' in window && container.value) {
    intersectionObserver = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return
      hasEnteredViewport = true
      intersectionObserver?.disconnect()
      initializeGiscus()
    }, { rootMargin: '300px 0px' })
    intersectionObserver.observe(container.value)
  } else {
    hasEnteredViewport = true
    initializeGiscus()
  }
})

onBeforeUnmount(() => {
  isMounted = false
  loadGeneration += 1
  clearLoadTimeout()
  intersectionObserver?.disconnect()
  hostObserver?.disconnect()
})
</script>

<style scoped>
.comments-wrapper {
  margin-top: var(--space-3xl);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--vp-c-border);
  max-width: 100%;
}

.comments-title,
.comments-loading {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.comments-status {
  margin: 0 0 1rem;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.comments-error {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.comments-retry {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--vp-c-brand-1);
  font: inherit;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 0.15em;
  cursor: pointer;
}

.comments-retry:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}

.giscus-host,
:deep(.giscus),
:deep(.giscus-frame) {
  max-width: 100%;
}
</style>
