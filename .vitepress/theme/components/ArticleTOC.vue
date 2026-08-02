<template>
  <!-- Desktop TOC -->
  <div
    v-if="headers && headers.length > 0"
    class="custom-toc desktop-toc"
  >
    <div class="toc-header">
      目录
    </div>
    <nav class="toc-content">
      <ul>
        <li 
          v-for="header in headers" 
          :key="header.slug"
          :class="{ 
            'active': activeId === header.slug,
            'toc-h2': header.level === 2,
            'toc-h3': header.level === 3
          }"
        >
          <a 
            :href="`#${header.slug}`" 
            @click.prevent="scrollToHeader(header.slug)"
          >
            {{ header.title }}
          </a>
        </li>
      </ul>
    </nav>
  </div>

  <!-- Mobile TOC Button & Overlay -->
  <div
    v-if="headers && headers.length > 0"
    class="mobile-toc-container"
  >
    <button 
      class="mobile-toc-btn" 
      aria-label="打开目录" 
      @click="toggleMobileToc"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line
          x1="21"
          y1="10"
          x2="3"
          y2="10"
        />
        <line
          x1="21"
          y1="6"
          x2="3"
          y2="6"
        />
        <line
          x1="21"
          y1="14"
          x2="3"
          y2="14"
        />
        <line
          x1="21"
          y1="18"
          x2="3"
          y2="18"
        />
      </svg>
    </button>

    <Transition name="fade">
      <div
        v-if="isMobileOpen"
        class="mobile-toc-overlay"
        @click="closeMobileToc"
      >
        <div
          class="mobile-toc-content"
          @click.stop
        >
          <div class="mobile-toc-header">
            <span>目录</span>
            <button
              class="close-btn"
              @click="closeMobileToc"
            >
              &times;
            </button>
          </div>
          <nav>
            <ul>
              <li 
                v-for="header in headers" 
                :key="header.slug"
                :class="{ 
                  'active': activeId === header.slug,
                  'toc-h2': header.level === 2,
                  'toc-h3': header.level === 3
                }"
              >
                <a 
                  :href="`#${header.slug}`" 
                  @click.prevent="scrollToHeader(header.slug); closeMobileToc()"
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
import { onContentUpdated } from 'vitepress'
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

interface TocHeader {
  title: string
  slug: string
  level: number
}

const headers = ref<TocHeader[]>([])
const activeId = ref('')
const isMobileOpen = ref(false)
let observer: IntersectionObserver | null = null
let observerFrame: number | null = null

function toggleMobileToc() {
  isMobileOpen.value = !isMobileOpen.value
}

function closeMobileToc() {
  isMobileOpen.value = false
}

function extractHeaders(): TocHeader[] {
  if (typeof document === 'undefined') return []

  return Array.from(document.querySelectorAll<HTMLElement>('.vp-doc h2, .vp-doc h3'))
    .filter(element => element.id)
    .map(element => ({
      title: Array.from(element.childNodes)
        .filter(node => !(node instanceof HTMLElement && node.matches('.header-anchor, .ignore-header')))
        .map(node => node.textContent ?? '')
        .join('')
        .trim(),
      slug: element.id,
      level: Number(element.tagName.substring(1))
    }))
}

async function refreshHeaders() {
  await nextTick()
  headers.value = extractHeaders()
  activeId.value = ''
  closeMobileToc()

  if (observerFrame !== null) {
    window.cancelAnimationFrame(observerFrame)
  }
  observerFrame = window.requestAnimationFrame(() => {
    setupObserver()
    observerFrame = null
  })
}

// VitePress fills the rendered headings after page data is loaded. Its official
// content hook also runs after client-side route changes.
onContentUpdated(refreshHeaders)

function scrollToHeader(slug: string) {
  const element = document.getElementById(slug)
  if (element) {
    const offset = 80 // Adjust for fixed header
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
    const offsetPosition = elementPosition - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
    activeId.value = slug
    // Update URL hash without jumping
    history.pushState(null, "", `#${slug}`)
  }
}

function setupObserver() {
  if (observer) observer.disconnect()

  const options = {
    root: null,
    rootMargin: '-100px 0px -60% 0px',
    threshold: 0
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activeId.value = entry.target.id
      }
    })
  }, options)

  headers.value.forEach(header => {
    const el = document.getElementById(header.slug)
    if (el) observer?.observe(el)
  })
}

onMounted(() => {
  refreshHeaders()
  window.addEventListener('scroll', onScroll)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
  if (observerFrame !== null) window.cancelAnimationFrame(observerFrame)
  window.removeEventListener('scroll', onScroll)
})

// Fallback scroll handler for better accuracy
function onScroll() {
  // Simple check if at bottom
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
    if (headers.value.length > 0) {
      activeId.value = headers.value[headers.value.length - 1].slug
    }
  }
}

</script>

<style scoped>
/* Desktop TOC Styles */
.custom-toc.desktop-toc {
  position: fixed;
  left: 50%;
  margin-left: 390px; /* 700px content / 2 + 40px gap */
  top: 150px;
  width: 240px;
  max-height: calc(100vh - 170px);
  overflow-y: auto;
  padding: 1rem;
  background: var(--vp-c-bg);
  border-radius: 12px;
  border: 1px solid var(--vp-c-border);
  font-size: 0.9rem;
  z-index: 2000;
  transition: opacity 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.toc-header {
  font-weight: 600;
  margin-bottom: 0.8rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-base);
}

.toc-content ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.toc-content li {
  margin: 0;
  padding: 0;
  line-height: 1.4;
}

.toc-content a {
  display: block;
  padding: 4px 0;
  color: var(--vp-c-text-1) !important;
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 2px solid transparent;
  padding-left: 10px;
  margin-left: -12px; /* Align border with container edge */
}

.toc-content a:hover {
  color: #4D74EB !important;
  background: var(--vp-c-bg-soft);
}

.toc-content li.active > a {
  color: #4D74EB !important;
  border-left-color: #4D74EB;
  font-weight: 500;
  background: var(--vp-c-bg-soft);
}

.toc-h3 a {
  padding-left: 24px;
  font-size: 0.85em;
}

/* Mobile TOC Components */
.mobile-toc-container {
  display: none; /* Hidden by default on desktop */
}

.mobile-toc-btn {
  position: fixed;
  bottom: calc(100px + env(safe-area-inset-bottom)); /* Above BackToTop + Safe Area */
  right: 40px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 2005; /* Increased z-index */
  transition: all 0.3s ease;
}

.mobile-toc-btn:hover {
  background: var(--vp-c-bg-soft);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.mobile-toc-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(2px);
}

.mobile-toc-content {
  background: var(--vp-c-bg);
  width: 100%;
  max-width: 320px;
  max-height: 70vh;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.mobile-toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-weight: 600;
  font-size: 1.1em;
}

.mobile-toc-content nav {
  overflow-y: auto;
  padding: 16px;
}

.mobile-toc-content ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-toc-content li {
  margin: 0;
  padding: 0;
}

.mobile-toc-content a {
  display: block;
  padding: 8px 12px;
  color: var(--vp-c-text-1);
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.95em;
  transition: background 0.2s;
  border-left: 3px solid transparent;
}

.mobile-toc-content a:hover {
  background: var(--vp-c-bg-soft);
}

.mobile-toc-content li.active > a {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-left-color: var(--vp-c-brand-1);
  font-weight: 500;
}

.mobile-toc-content .toc-h3 a {
  padding-left: 24px;
  font-size: 0.9em;
  opacity: 0.9;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: var(--vp-c-text-2);
  padding: 4px;
}

/* Animations */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive Logic */
@media (max-width: 1280px) {
  .custom-toc.desktop-toc {
    display: none;
  }

  .mobile-toc-container {
    display: block;
  }
}

/* Dark mode adjustments */
:global(.dark) .custom-toc.desktop-toc,
:global(.dark) .mobile-toc-content {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
}

/* Mobile specific positioning adjustments */
@media (max-width: 768px) {
  .mobile-toc-btn {
    bottom: 80px; /* 20px (BackToTop bottom) + 45px (height) + 15px gap */
    right: 20px;
    width: 45px;
    height: 45px;
  }
}
</style>
