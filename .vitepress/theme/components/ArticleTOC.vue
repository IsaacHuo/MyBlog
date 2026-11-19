<template>
  <div
    v-if="headers.length"
    class="custom-toc desktop-toc"
  >
    <div class="toc-header">
      {{ copy.title }}
    </div>
    <nav
      class="toc-content"
      :aria-label="copy.navigationLabel"
    >
      <ul>
        <li
          v-for="header in headers"
          :key="header.slug"
          :class="{
            active: activeId === header.slug,
            'toc-h2': header.level === 2,
            'toc-h3': header.level === 3
          }"
        >
          <a
            :href="`#${header.slug}`"
            :aria-current="activeId === header.slug ? 'location' : undefined"
            @click.prevent="scrollToHeader(header.slug)"
          >
            {{ header.title }}
          </a>
        </li>
      </ul>
    </nav>
  </div>

  <div
    v-if="headers.length"
    class="mobile-toc-container"
  >
    <button
      ref="mobileButton"
      class="mobile-toc-btn"
      type="button"
      :aria-label="copy.openLabel"
      :aria-expanded="isMobileOpen"
      aria-controls="mobile-article-toc"
      @click="openMobileToc"
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M3 6h18M3 10h18M3 14h18M3 18h18" />
      </svg>
    </button>

    <Transition name="toc-fade">
      <div
        v-if="isMobileOpen"
        id="mobile-article-toc"
        ref="mobileDialog"
        class="mobile-toc-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-article-toc-title"
        @click.self="closeMobileToc"
        @keydown="handleDialogKeydown"
      >
        <div class="mobile-toc-content">
          <div class="mobile-toc-header">
            <span id="mobile-article-toc-title">{{ copy.title }}</span>
            <button
              ref="closeButton"
              class="close-btn"
              type="button"
              :aria-label="copy.closeLabel"
              @click="closeMobileToc"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <nav :aria-label="copy.navigationLabel">
            <ul>
              <li
                v-for="header in headers"
                :key="header.slug"
                :class="{
                  active: activeId === header.slug,
                  'toc-h2': header.level === 2,
                  'toc-h3': header.level === 3
                }"
              >
                <a
                  :href="`#${header.slug}`"
                  :aria-current="activeId === header.slug ? 'location' : undefined"
                  @click.prevent="selectMobileHeader(header.slug)"
                >
                  {{ header.title }}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onContentUpdated, useData } from 'vitepress'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

interface TocHeader {
  title: string
  slug: string
  level: number
}

const { lang } = useData()
const headers = ref<TocHeader[]>([])
const activeId = ref('')
const isMobileOpen = ref(false)
const mobileButton = ref<HTMLButtonElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const mobileDialog = ref<HTMLElement | null>(null)

const copy = computed(() => lang.value.toLowerCase().startsWith('zh')
  ? {
      title: '目录',
      navigationLabel: '文章目录',
      openLabel: '打开文章目录',
      closeLabel: '关闭文章目录'
    }
  : {
      title: 'Contents',
      navigationLabel: 'Table of contents',
      openLabel: 'Open table of contents',
      closeLabel: 'Close table of contents'
    })

let headingElements: HTMLElement[] = []
let updateFrame: number | null = null
let backgroundLocked = false
let previousBodyOverflow = ''
let previousHtmlOverflow = ''

function extractHeaders(): TocHeader[] {
  return Array.from(document.querySelectorAll<HTMLElement>('.vp-doc h2[id], .vp-doc h3[id]'))
    .map(element => ({
      title: Array.from(element.childNodes)
        .filter(node => !(node instanceof HTMLElement && node.matches('.header-anchor, .ignore-header')))
        .map(node => node.textContent ?? '')
        .join('')
        .trim(),
      slug: element.id,
      level: Number(element.tagName.slice(1))
    }))
    .filter(header => header.title)
}

async function refreshHeaders() {
  await nextTick()
  if (typeof window === 'undefined') return

  if (isMobileOpen.value) closeMobileToc()
  headers.value = extractHeaders()
  headingElements = headers.value
    .map(header => document.getElementById(header.slug))
    .filter((element): element is HTMLElement => element !== null)
  scheduleActiveHeadingUpdate()
}

function getActivationLine() {
  const navBottom = document.querySelector<HTMLElement>('.VPNav')?.getBoundingClientRect().bottom ?? 0
  return Math.max(navBottom, 0) + 24
}

function updateActiveHeading() {
  updateFrame = null
  if (isMobileOpen.value && window.innerWidth >= 1280) closeMobileToc()

  if (!headingElements.length) {
    activeId.value = ''
    return
  }

  const pageBottom = window.scrollY + window.innerHeight
  const documentBottom = document.documentElement.scrollHeight
  if (pageBottom >= documentBottom - 2) {
    activeId.value = headingElements[headingElements.length - 1].id
    return
  }

  const activationLine = getActivationLine()
  let nextActiveId = headingElements[0].id

  for (const heading of headingElements) {
    if (heading.getBoundingClientRect().top > activationLine) break
    nextActiveId = heading.id
  }

  activeId.value = nextActiveId
}

function scheduleActiveHeadingUpdate() {
  if (updateFrame !== null) return
  updateFrame = window.requestAnimationFrame(updateActiveHeading)
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function scrollToHeader(slug: string) {
  const element = document.getElementById(slug)
  if (!element) return

  activeId.value = slug
  element.scrollIntoView({
    block: 'start',
    behavior: prefersReducedMotion() ? 'auto' : 'smooth'
  })
  window.history.pushState(null, '', `#${slug}`)
}

function openMobileToc() {
  isMobileOpen.value = true
}

function closeMobileToc() {
  isMobileOpen.value = false
}

function selectMobileHeader(slug: string) {
  scrollToHeader(slug)
  closeMobileToc()
}

function lockBackgroundScroll() {
  if (backgroundLocked) return
  previousBodyOverflow = document.body.style.overflow
  previousHtmlOverflow = document.documentElement.style.overflow
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
  backgroundLocked = true
}

function unlockBackgroundScroll() {
  if (!backgroundLocked) return
  document.body.style.overflow = previousBodyOverflow
  document.documentElement.style.overflow = previousHtmlOverflow
  backgroundLocked = false
}

function handleDialogKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeMobileToc()
    return
  }

  if (event.key !== 'Tab' || !mobileDialog.value) return

  const focusable = Array.from(
    mobileDialog.value.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]')
  )
  if (!focusable.length) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const activeElement = document.activeElement

  if (event.shiftKey && (activeElement === first || !mobileDialog.value.contains(activeElement))) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(isMobileOpen, async isOpen => {
  if (isOpen) {
    lockBackgroundScroll()
    await nextTick()
    closeButton.value?.focus()
    return
  }

  unlockBackgroundScroll()
  await nextTick()
  mobileButton.value?.focus()
})

onContentUpdated(refreshHeaders)

onMounted(() => {
  refreshHeaders()
  window.addEventListener('scroll', scheduleActiveHeadingUpdate, { passive: true })
  window.addEventListener('resize', scheduleActiveHeadingUpdate, { passive: true })
})

onUnmounted(() => {
  unlockBackgroundScroll()
  if (updateFrame !== null) window.cancelAnimationFrame(updateFrame)
  window.removeEventListener('scroll', scheduleActiveHeadingUpdate)
  window.removeEventListener('resize', scheduleActiveHeadingUpdate)
})
</script>

<style scoped>
.custom-toc {
  position: fixed;
  top: calc(var(--vp-nav-height) + 48px);
  right: max(24px, calc((100vw - var(--nav-content-width)) / 2));
  z-index: 10;
  display: none;
  width: 220px;
  max-height: calc(100vh - var(--vp-nav-height) - 96px);
  overflow-y: auto;
  padding-top: 12px;
  border-top: 1px solid var(--rule-strong);
  color: var(--muted);
  scrollbar-width: thin;
}

@media (min-width: 1280px) {
  .custom-toc { display: block; }
  .mobile-toc-container { display: none; }
}

.toc-header {
  margin-bottom: 0.75rem;
  color: var(--muted);
  font-size: 0.875rem;
  letter-spacing: 0.12em;
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

li { margin: 0; }

li a {
  display: block;
  padding: 0.3rem 0 0.3rem 12px;
  border-left: 2px solid transparent;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.55;
  text-decoration: none;
  transition: color 0.2s ease, border-color 0.2s ease;
}

li.toc-h3 a { padding-left: 26px; font-size: 0.85rem; }

li a:hover { color: var(--ink); }

li.active a {
  border-left-color: var(--marker);
  color: var(--ink);
}

li a:focus-visible { outline: 2px solid var(--site-focus-ring); outline-offset: 1px; }

.mobile-toc-btn {
  position: fixed;
  right: 20px;
  bottom: 76px;
  z-index: 30;
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 1px solid var(--rule-strong);
  border-radius: 50%;
  background: var(--paper-card);
  box-shadow: var(--card-shadow);
  color: var(--ink);
  cursor: pointer;
}

.mobile-toc-btn svg { width: 20px; height: 20px; }
.mobile-toc-btn:hover { color: var(--marker-deep); border-color: var(--marker); }
.mobile-toc-btn:focus-visible { outline: 2px solid var(--site-focus-ring); outline-offset: 2px; }

.mobile-toc-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgb(34 35 31 / 35%);
}

.mobile-toc-content {
  width: 100%;
  max-width: 560px;
  max-height: 70vh;
  overflow-y: auto;
  padding: 18px 22px 28px;
  background: var(--paper);
  box-shadow: 0 -8px 30px rgb(34 35 31 / 18%);
}

.mobile-toc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--rule);
  color: var(--ink);
  font-size: 1.05rem;
  letter-spacing: 0.08em;
}

.close-btn {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 0;
  background: none;
  color: var(--muted);
  font-size: 1.6rem;
  cursor: pointer;
}

.close-btn:hover { color: var(--ink); }
.close-btn:focus-visible { outline: 2px solid var(--site-focus-ring); }

.mobile-toc-content li a { padding-top: 0.55rem; padding-bottom: 0.55rem; font-size: 1rem; }

.toc-fade-enter-active,
.toc-fade-leave-active { transition: opacity 0.2s ease; }
.toc-fade-enter-from,
.toc-fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .toc-fade-enter-active,
  .toc-fade-leave-active { transition: none; }
}
</style>
