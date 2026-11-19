<template>
  <div
    class="header-clock"
    role="img"
    :aria-label="label"
  >
    <svg
      viewBox="0 0 120 40"
      aria-hidden="true"
    >
      <circle
        class="clock-ring"
        cx="20"
        cy="20"
        r="15.5"
      />
      <line
        class="clock-hand"
        x1="20"
        y1="20"
        :x2="hourX"
        :y2="hourY"
      />
      <line
        class="clock-hand clock-minute"
        x1="20"
        y1="20"
        :x2="minuteX"
        :y2="minuteY"
      />
      <circle
        class="clock-pin"
        cx="20"
        cy="20"
        r="1.6"
      />
      <text
        class="clock-text"
        x="46"
        y="26"
      >{{ timeText }}</text>
    </svg>
  </div>
</template>

<script setup lang="ts">
// Hand-drawn style clock borrowed from zhibi.fun's header. Ticks once a
// minute, aligned to the minute boundary; renders nothing time-specific on SSR.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()
const now = ref<Date | null>(null)
let timer: ReturnType<typeof setTimeout> | null = null

const tick = () => {
  now.value = new Date()
  timer = setTimeout(tick, 60000 - (Date.now() % 60000) + 50)
}

onMounted(tick)
onBeforeUnmount(() => { if (timer) clearTimeout(timer) })

const hours = computed(() => now.value ? now.value.getHours() : 10)
const minutes = computed(() => now.value ? now.value.getMinutes() : 10)
const pad = (n: number) => String(n).padStart(2, '0')
const timeText = computed(() => now.value ? `${pad(hours.value)}:${pad(minutes.value)}` : '--:--')

const hand = (angle: number, length: number) => {
  const rad = (angle - 90) * Math.PI / 180
  return [20 + Math.cos(rad) * length, 20 + Math.sin(rad) * length]
}
const hourPoint = computed(() => hand((hours.value % 12) * 30 + minutes.value * 0.5, 8))
const minutePoint = computed(() => hand(minutes.value * 6, 12))
const hourX = computed(() => hourPoint.value[0].toFixed(2))
const hourY = computed(() => hourPoint.value[1].toFixed(2))
const minuteX = computed(() => minutePoint.value[0].toFixed(2))
const minuteY = computed(() => minutePoint.value[1].toFixed(2))

const label = computed(() => (lang.value === 'zh-Hant' ? '手繪時鐘，現在是 ' : 'Hand-drawn clock, now ') + timeText.value)
</script>

<style scoped>
.header-clock {
  display: flex;
  align-items: center;
  width: 112px;
  margin-right: 28px;
  color: var(--ink);
}

svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.clock-ring,
.clock-hand {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.clock-ring {
  stroke-width: 1.2;
  stroke-dasharray: 92 4 3 4;
}

.clock-hand { stroke-width: 2.4; }
.clock-minute { stroke-width: 1.6; color: var(--marker); stroke: var(--marker); }
.clock-pin { fill: currentColor; }

.clock-text {
  fill: currentColor;
  font-family: var(--font-latin);
  font-size: 18px;
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 959px) {
  .header-clock { display: none; }
}
</style>
