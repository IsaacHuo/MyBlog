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
:global(.vp-doc h2[id]),
:global(.vp-doc h3[id]) {
  scroll-margin-top: var(--site-heading-scroll-offset, 6rem);
}

.custom-toc.desktop-toc {
  position: fixed;
  left: 50%;
  top: 150px;
  z-index: 2000;
  width: 240px;
  max-height: calc(100vh - 170px);
  margin-left: calc(var(--article-content-width) / 2 + 40px);
  padding: 1rem;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
  font-size: 0.9rem;
  scrollbar-gutter: stable;
  transition: opacity 0.3s ease;
}

.toc-header {
  margin-bottom: 0.8rem;
  padding-bottom: 0.5rem;
  color: var(--site-text, var(--vp-c-text-1));
  border-bottom: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-base);
  font-weight: 600;
}

.toc-content ul,
.mobile-toc-content ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.toc-content li,
.mobile-toc-content li {
  margin: 0;
  padding: 0;
}

.toc-content li {
  line-height: 1.4;
}

.toc-content a {
  display: block;
  margin-left: -12px;
  padding: 4px 0 4px 10px;
  color: var(--vp-c-text-1) !important;
  border-left: 2px solid transparent;
  text-decoration: none;
  transition: all 0.2s ease;
}

.toc-content a:hover {
  color: #4d74eb !important;
  background: var(--vp-c-bg-soft);
}

.toc-content li.active > a {
  color: #4d74eb !important;
  background: var(--vp-c-bg-soft);
  border-left-color: #4d74eb;
  font-weight: 500;
}

.toc-h3 a {
  padding-left: 1.5rem;
  font-size: 0.85em;
}

.mobile-toc-container {
  display: none;
}

.mobile-toc-btn,
.close-btn {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  cursor: pointer;
}

.mobile-toc-btn {
  position: fixed;
  right: calc(40px + env(safe-area-inset-right, 0px));
  bottom: calc(100px + env(safe-area-inset-bottom, 0px));
  z-index: 2005;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  padding: 0;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
  transition: all 0.3s ease;
}

.mobile-toc-btn svg {
  display: block;
  width: 24px;
  height: 24px;
}

.mobile-toc-btn:hover {
  background: var(--vp-c-bg-soft);
  box-shadow: 0 4px 12px rgb(0 0 0 / 20%);
  transform: translateY(-2px);
}

.mobile-toc-btn:focus-visible,
.close-btn:focus-visible,
.mobile-toc-content a:focus-visible,
.toc-content a:focus-visible {
  outline: 2px solid var(--site-focus-ring, var(--vp-c-brand-1));
  outline-offset: 3px;
}

.mobile-toc-overlay {
  position: fixed;
  inset: 0;
  z-index: 2100;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  padding-top: max(20px, env(safe-area-inset-top, 0px));
  padding-right: max(20px, env(safe-area-inset-right, 0px));
  padding-bottom: max(20px, env(safe-area-inset-bottom, 0px));
  padding-left: max(20px, env(safe-area-inset-left, 0px));
  background: rgb(0 0 0 / 50%);
  backdrop-filter: blur(2px);
}

.mobile-toc-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 320px;
  max-height: 70vh;
  overflow: hidden;
  background: var(--vp-c-bg);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgb(0 0 0 / 20%);
  animation: toc-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.mobile-toc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 1.1em;
  font-weight: 600;
}

.mobile-toc-content nav {
  padding: 16px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.mobile-toc-content a {
  display: block;
  padding: 8px 12px;
  color: var(--vp-c-text-1);
  border-left: 3px solid transparent;
  border-radius: 6px;
  font-size: 0.95em;
  text-decoration: none;
  transition: background 0.2s;
}

.mobile-toc-content a:hover,
.mobile-toc-content a:focus-visible {
  background: var(--vp-c-bg-soft);
}

.mobile-toc-content li.active > a {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border-left-color: var(--vp-c-brand-1);
  font-weight: 500;
}

.mobile-toc-content .toc-h3 a {
  padding-left: 24px;
  font-size: 0.9em;
  opacity: 0.9;
}

.close-btn {
  padding: 4px;
  color: var(--vp-c-text-2);
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
}

@keyframes toc-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toc-fade-enter-active,
.toc-fade-leave-active {
  transition: opacity 0.3s ease;
}

.toc-fade-enter-from,
.toc-fade-leave-to {
  opacity: 0;
}

@media (max-width: 1279px) {
  .custom-toc.desktop-toc {
    display: none;
  }

  .mobile-toc-container {
    display: block;
  }
}

@media (max-width: 768px) {
  .mobile-toc-btn {
    right: calc(20px + env(safe-area-inset-right, 0px));
    bottom: calc(80px + env(safe-area-inset-bottom, 0px));
    width: 45px;
    height: 45px;
  }
}

@media (prefers-reduced-motion: reduce) {
  :global(html) {
    scroll-behavior: auto !important;
  }

  .mobile-toc-btn,
  .close-btn,
  .toc-content a,
  .mobile-toc-content a,
  .mobile-toc-content,
  .toc-fade-enter-active,
  .toc-fade-leave-active {
    animation: none;
    transition: none;
  }

  .mobile-toc-btn:hover {
    transform: none;
  }
}

@media print {
  .custom-toc.desktop-toc,
  .mobile-toc-container {
    display: none !important;
  }
}
</style>
