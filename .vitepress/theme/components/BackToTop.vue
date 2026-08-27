<template>
  <Transition name="fade">
    <button
      v-show="isVisible"
      class="back-to-top"
      type="button"
      :aria-label="ariaLabel"
      @click="scrollToTop"
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
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const { lang } = useData()
const isVisible = ref(false)
const ariaLabel = computed(() => lang.value.toLowerCase().startsWith('zh') ? '回到顶部' : 'Back to top')
let updateFrame: number | null = null

function updateVisibility() {
  updateFrame = null
  isVisible.value = window.scrollY > 100
}

function scheduleVisibilityUpdate() {
  if (updateFrame !== null) return
  updateFrame = window.requestAnimationFrame(updateVisibility)
}

function scrollToTop() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({
    top: 0,
    behavior: reduceMotion ? 'auto' : 'smooth'
  })
}

onMounted(() => {
  updateVisibility()
  window.addEventListener('scroll', scheduleVisibilityUpdate, { passive: true })
})

onUnmounted(() => {
  if (updateFrame !== null) window.cancelAnimationFrame(updateFrame)
  window.removeEventListener('scroll', scheduleVisibilityUpdate)
})
</script>

<style scoped>
.back-to-top {
  position: fixed;
  right: calc(40px + env(safe-area-inset-right, 0px));
  bottom: calc(40px + env(safe-area-inset-bottom, 0px));
  z-index: 999;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  padding: 0;
  color: white;
  background: var(--vp-c-brand-1);
  border: none;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-to-top:hover {
  background: var(--vp-c-brand-2);
  box-shadow: 0 4px 12px rgb(0 0 0 / 20%);
  transform: translateY(-2px);
}

.back-to-top:active {
  transform: translateY(-1px);
}

.back-to-top:focus-visible {
  outline: 2px solid var(--site-focus-ring, var(--vp-c-brand-1));
  outline-offset: 3px;
}

.back-to-top svg {
  display: block;
  width: 1.5rem;
  height: 1.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

@media (max-width: 768px) {
  .back-to-top {
    right: calc(20px + env(safe-area-inset-right, 0px));
    bottom: calc(20px + env(safe-area-inset-bottom, 0px));
    width: 45px;
    height: 45px;
  }

  .back-to-top svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  :global(html) {
    scroll-behavior: auto !important;
  }

  .back-to-top,
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }

  .back-to-top:hover,
  .back-to-top:active,
  .fade-enter-from,
  .fade-leave-to {
    transform: none;
  }
}

:global(.dark) .back-to-top {
  color: var(--vp-c-bg);
  background: var(--vp-c-brand-1);
}

:global(.dark) .back-to-top:hover {
  background: var(--vp-c-brand-2);
}

@media print {
  .back-to-top {
    display: none !important;
  }
}
</style>
