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
  right: 20px;
  bottom: 20px;
  z-index: 30;
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 1px solid #a1ad90;
  border-radius: 50%;
  background: var(--paper-card);
  box-shadow: var(--card-shadow);
  color: var(--marker-deep);
  cursor: pointer;
  transition: transform 0.25s ease, color 0.2s ease, border-color 0.2s ease;
}

.back-to-top svg { width: 20px; height: 20px; }

.back-to-top:hover {
  border-color: var(--marker);
  color: var(--ink);
  transform: translateY(-2px) rotate(-8deg);
}

.back-to-top:focus-visible { outline: 2px solid var(--site-focus-ring); outline-offset: 2px; }

.fade-enter-active,
.fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .back-to-top,
  .fade-enter-active,
  .fade-leave-active { transition: none; }
  .back-to-top:hover { transform: none; }
}
</style>
