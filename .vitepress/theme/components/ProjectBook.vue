<template>
  <div
    class="pb"
    :data-mode="portrait ? 'single' : 'spread'"
  >
    <div class="pb-intro">
      <div>
        <h3 class="pb-heading">
          {{ isZh ? '项目手册' : 'Project book' }}
        </h3>
        <p>{{ isZh ? '拖动书角翻页，也可以点击书页或用方向键。' : 'Drag a page corner, click a page or use the arrow keys.' }}</p>
      </div>
      <div
        class="pb-chapters"
        role="group"
        :aria-label="isZh ? '章节' : 'Chapters'"
      >
        <button
          v-for="(chapter, i) in chapters"
          :key="chapter.label"
          type="button"
          :class="{ selected: currentChapter === i }"
          :aria-pressed="currentChapter === i"
          @click="go(chapter.page)"
        >
          {{ chapter.label }}
        </button>
      </div>
    </div>

    <div
      class="pb-stage"
      tabindex="0"
      role="group"
      :aria-label="stageLabel"
      @keydown="onKey"
      @click="onStageClick"
    >
      <div
        ref="mount"
        class="pb-mount"
        :class="{ ready }"
      />
    </div>

    <!-- Pages render here once; PageFlip receives clones it can own -->
    <div
      ref="source"
      class="pb-source"
      hidden
    >
      <ProjectBookPage
        v-for="(page, i) in pages"
        :key="i"
        :page="page"
        :number="i"
        :is-zh="isZh"
      />
    </div>

    <div class="pb-footer">
      <p>{{ isZh ? '三个正在打磨的作品：校园、AI 与地图。' : 'Three works in progress: campus, AI and maps.' }}</p>
      <div class="pb-controls">
        <button
          type="button"
          :disabled="!ready || atStart"
          :aria-label="isZh ? '上一页' : 'Previous page'"
          @click="prev"
        >
          ←
        </button>
        <span
          class="pb-status"
          aria-live="polite"
        >{{ statusText }}</span>
        <button
          type="button"
          :disabled="!ready || atEnd"
          :aria-label="isZh ? '下一页' : 'Next page'"
          @click="next"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vitepress'
import ProjectBookPage from './ProjectBookPage.vue'

const props = defineProps<{ isZh: boolean }>()
const router = useRouter()

const GH = 'https://github.com/IsaacHuo/'

const pages = computed<Record<string, any>[]>(() => {
  const zh = props.isZh
  const p = (zhText: string, enText: string) => (zh ? zhText : enText)
  const base = zh ? '/zh/projects/' : '/en/projects/'
  return [
    {
      kind: 'front',
      hard: true,
      top: 'HUO WEIFANG',
      topRight: '2026',
      seal: zh ? '霍' : 'H',
      title: p('项目手册', 'Projects'),
      subtitle: p('校园 · AI · 地图', 'Campus · AI · Maps'),
      bottom: p('第一册', 'Vol. 01')
    },
    {
      kind: 'cover',
      top: p('三个项目，一本小册。', 'Three projects, one booklet.'),
      topRight: '2026 / 01',
      word: zh ? ['项', '目'] : ['Pro', 'jects'],
      caption: p('霍玮放的项目手册。翻开看看最近在做的东西。', 'A booklet of what Huo Weifang is building lately.'),
      bottom: 'HUO WEIFANG'
    },
    {
      kind: 'toc',
      top: p('目录', 'Contents'),
      topRight: '2026 / 01',
      title: p('这一册里有', 'In this book'),
      items: [
        { no: '01', name: 'MyLeafy', desc: p('以课表为核心的校园应用', 'A timetable-centred campus app'), page: 3 },
        { no: '02', name: 'Familiar', desc: p('iPhone 上的原生 AI 工作台', 'A native AI workbench for iPhone'), page: 5 },
        { no: '03', name: 'MapToPoster', desc: p('把地方变成地图海报', 'Turn places into map posters'), page: 7 }
      ],
      note: p('更多项目见项目页。', 'More on the projects page.'),
      bottom: p('目录', 'Contents')
    },
    {
      kind: 'intro',
      top: '01 / MyLeafy',
      topRight: p('校园', 'Campus'),
      glyph: zh ? '叶' : 'L',
      name: 'MyLeafy',
      tagline: p('面向高校学习与校园生活的原生 iOS 与 Android 应用，目前主要服务北京林业大学。', 'Native iOS and Android app for university study and campus life, currently serving Beijing Forestry University.'),
      meta: [
        [p('平台', 'Platform'), 'iOS · Android'],
        [p('客户端', 'Client'), 'SwiftUI · SwiftData · Room'],
        [p('后端', 'Backend'), 'Node · SQLite · Better Auth'],
        [p('用户', 'Users'), '5000+']
      ],
      bottom: 'MyLeafy'
    },
    {
      kind: 'detail',
      top: p('课表 · 校园 · 我的', 'Timetable · Campus · Me'),
      topRight: 'MyLeafy',
      image: '/project-images/leafy.png',
      imageAlt: p('MyLeafy 应用界面', 'MyLeafy app screens'),
      features: [
        p('以课表和学业数据为核心', 'Timetable and academic data at the core'),
        p('教务查询：成绩、考试与学期时间线', 'Academic queries: grades, exams, term timeline'),
        p('校园社区、日迹与共享课表', 'Campus community, daily notes, shared timetables'),
        p('从客户端、后端到运营后台独立完成', 'Client, backend and admin built end to end')
      ],
      links: [
        { label: p('项目详情', 'Details'), href: base + 'leafy', external: false },
        { label: 'GitHub', href: GH + 'MyLeafy', external: true }
      ],
      bottom: 'MyLeafy'
    },
    {
      kind: 'intro',
      top: '02 / Familiar',
      topRight: 'AI',
      glyph: zh ? '熟' : 'F',
      name: 'Familiar',
      tagline: p('为 iPhone 打造的原生、本地优先的 BYOK AI 工作台。', 'A native, local-first BYOK AI workbench for iPhone.'),
      meta: [
        [p('平台', 'Platform'), 'iOS 26'],
        [p('技术', 'Stack'), 'Swift 6 · SwiftUI · SwiftData'],
        [p('模式', 'Model'), p('BYOK · 无账号无后端', 'BYOK · no account, no backend')],
        [p('能力', 'Agent'), 'Single Agent · Lazy Tools · MCP']
      ],
      bottom: 'Familiar'
    },
    {
      kind: 'detail',
      top: p('文件 · 对话 · 设置', 'Files · Chat · Settings'),
      topRight: 'Familiar',
      image: '/project-images/familiar.png',
      imageAlt: p('Familiar 应用界面', 'Familiar app screens'),
      features: [
        p('多服务商对话，密钥只存在设备钥匙串', 'Multi-provider chat, keys stay in Keychain'),
        p('Markdown、代码、数学、Mermaid 与朗读', 'Markdown, code, math, Mermaid and read-aloud'),
        p('Projects、Memory 与 Skills', 'Projects, Memory and Skills'),
        p('本地写入有回执与撤销，删除必须确认', 'Receipts and undo for writes, confirmed deletes')
      ],
      links: [
        { label: p('项目详情', 'Details'), href: base + 'familiar', external: false },
        { label: p('官网', 'Website'), href: 'https://isaachuo.github.io/Familiar/', external: true },
        { label: 'GitHub', href: GH + 'Familiar', external: true }
      ],
      bottom: 'Familiar'
    },
    {
      kind: 'intro',
      top: '03 / MapToPoster',
      topRight: p('地图', 'Maps'),
      glyph: zh ? '图' : 'M',
      name: 'MapToPoster',
      tagline: p('把任何地方变成一张可以打印的地图海报。', 'Turn any place into a print-ready map poster.'),
      meta: [
        [p('技术', 'Stack'), 'Python · OpenStreetMap'],
        [p('导出', 'Export'), 'PNG · SVG · PDF'],
        [p('比例', 'Ratios'), '1:1 – 16:9 · A4 · A3'],
        [p('部署', 'Hosted'), 'Hugging Face Space']
      ],
      bottom: 'MapToPoster'
    },
    {
      kind: 'detail',
      top: p('搜索 · 取景 · 导出', 'Search · Frame · Export'),
      topRight: 'MapToPoster',
      image: '/project-images/maptoposter.png',
      imageAlt: p('MapToPoster 海报示例', 'MapToPoster sample poster'),
      features: [
        p('搜索全球地点，或直接输入经纬度', 'Search anywhere, or enter coordinates'),
        p('多套主题：极简、复古、赛博朋克、自然', 'Themes: minimal, vintage, cyberpunk, nature'),
        p('控制道路、水域与公园图层', 'Toggle roads, water and park layers'),
        p('PNG 支持 300 DPI 打印分辨率', '300 DPI PNG for printing')
      ],
      links: [
        { label: p('项目详情', 'Details'), href: base + 'maptoposter', external: false },
        { label: p('在线体验', 'Live demo'), href: 'https://huggingface.co/spaces/isaachwf/MapToPoster', external: true },
        { label: 'GitHub', href: GH + 'maptoposter', external: true }
      ],
      bottom: 'MapToPoster'
    },
    {
      kind: 'back',
      hard: true,
      top: '',
      topRight: '',
      line: p('保持好奇，持续构建。', 'Stay curious, keep building.'),
      seal: zh ? '霍' : 'H',
      bottom: 'zhibi · 2026'
    }
  ]
})

const chapters = computed(() => [
  { label: props.isZh ? '封面' : 'Cover', page: 0 },
  { label: 'MyLeafy', page: 3 },
  { label: 'Familiar', page: 5 },
  { label: 'MapToPoster', page: 7 }
])

const source = ref<HTMLElement | null>(null)
const mount = ref<HTMLElement | null>(null)
const ready = ref(false)
const portrait = ref(false)
const current = ref(0)
let book: any = null

const total = computed(() => pages.value.length)
// First page index of the visible spread (cover and back cover stand alone)
const spreadStart = computed(() => {
  const c = current.value
  if (portrait.value || c === 0) return c
  return c % 2 ? c : c - 1
})
const atStart = computed(() => current.value <= 0)
const atEnd = computed(() => portrait.value
  ? current.value >= total.value - 1
  : spreadStart.value + (spreadStart.value === 0 ? 1 : 2) >= total.value)
const currentChapter = computed(() => {
  let found = 0
  chapters.value.forEach((c, i) => { if (c.page <= spreadStart.value) found = i })
  return found
})
// Printed page numbers: covers are unnumbered, inner pages run 01..08
const pad = (n: number) => String(n).padStart(2, '0')
const statusText = computed(() => {
  const s = spreadStart.value
  const t = pad(total.value - 2)
  if (s === 0) return props.isZh ? '封面' : 'Cover'
  if (s === total.value - 1) return props.isZh ? '封底' : 'Back cover'
  return portrait.value ? `${pad(s)} / ${t}` : `${pad(s)}—${pad(s + 1)} / ${t}`
})
const stageLabel = computed(() => props.isZh
  ? `项目手册，第 ${statusText.value} 页`
  : `Project book, page ${statusText.value}`)

function go(index: number) {
  if (!book) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) book.turnToPage(index)
  else book.flip(index, 'top')
}
const next = () => book?.flipNext('top')
const prev = () => book?.flipPrev('top')

function onKey(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') { event.preventDefault(); next() }
  if (event.key === 'ArrowLeft') { event.preventDefault(); prev() }
}

// Page clones live outside Vue, so links and contents buttons are delegated here
function onStageClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  const jump = target.closest<HTMLElement>('[data-go]')
  if (jump) {
    event.preventDefault()
    go(Number(jump.dataset.go))
    return
  }
  const link = target.closest<HTMLAnchorElement>('a[href]')
  const href = link?.getAttribute('href') || ''
  if (link && !link.target && href.startsWith('/') && !event.metaKey && !event.ctrlKey) {
    event.preventDefault()
    router.go(href)
  }
}

async function init() {
  if (!source.value || !mount.value) return
  const { PageFlip } = await import('page-flip/dist/js/page-flip.module.js')
  const host = document.createElement('div')
  host.className = 'pb-host'
  mount.value.appendChild(host)
  // PageFlip writes inline display on each item, so wrap pages to keep their flex layout
  const items = Array.from(source.value.children).map((node) => {
    const page = node.cloneNode(true) as HTMLElement
    const wrap = document.createElement('div')
    wrap.className = 'pb-page'
    wrap.dataset.density = page.dataset.density || 'soft'
    wrap.appendChild(page)
    host.appendChild(wrap)
    return wrap
  })
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  book = new PageFlip(host, {
    width: 450,
    height: 622,
    size: 'stretch',
    minWidth: 260,
    maxWidth: 450,
    minHeight: 360,
    maxHeight: 622,
    showCover: true,
    usePortrait: true,
    drawShadow: true,
    maxShadowOpacity: 0.42,
    flippingTime: reduce ? 1 : 900,
    mobileScrollSupport: true,
    showPageCorners: true,
    swipeDistance: 24
  })
  book.on('flip', (e: any) => { current.value = e.data })
  book.on('changeOrientation', (e: any) => { portrait.value = e.data === 'portrait' })
  book.loadFromHTML(items)
  current.value = book.getCurrentPageIndex()
  portrait.value = book.getOrientation() === 'portrait'
  ready.value = true
}

function teardown() {
  book?.destroy()
  book = null
  ready.value = false
  current.value = 0
}

onMounted(init)
watch(() => props.isZh, async () => { teardown(); await nextTick(); init() })
onBeforeUnmount(teardown)
</script>

<style scoped>
.pb { color: var(--ink); }

.pb-intro,
.pb-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px 24px;
  width: min(100%, 1040px);
  margin-inline: auto;
}

.pb-heading {
  margin: 0;
  font-size: clamp(28px, 3.4vw, 44px);
  font-weight: 400;
  line-height: 1.4;
}

.pb-intro p,
.pb-footer p {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 0.875rem;
  line-height: 1.8;
}

.pb-chapters { display: flex; flex-wrap: wrap; gap: 8px; }

.pb-chapters button,
.pb-controls button {
  border: 1px solid #a9b2a0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.pb-chapters button {
  min-height: 40px;
  padding: 6px 15px;
  font-size: 0.8125rem;
}

.pb-chapters button.selected {
  border-color: var(--marker);
  background: var(--marker-soft);
}

.pb-stage {
  position: relative;
  width: min(100%, 960px);
  margin: 28px auto 18px;
  padding: 8px 0 26px;
  outline: none;
}

.pb-stage:focus-visible { outline: 2px solid var(--marker); outline-offset: 4px; }

.pb-mount:not(.ready) { aspect-ratio: 1.444; }
.pb[data-mode='single'] .pb-mount:not(.ready) { aspect-ratio: 0.722; }

.pb-controls { display: flex; align-items: center; gap: 16px; }

.pb-controls button {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  font-size: 18px;
}

.pb-controls button:disabled { opacity: 0.4; cursor: default; }

.pb button:focus-visible { outline: 2px solid var(--marker-deep); outline-offset: 3px; }

.pb-status {
  min-width: 110px;
  color: var(--muted);
  font-size: 0.8125rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 700px) {
  .pb-footer { flex-direction: column; text-align: center; }
  .pb-chapters button { padding: 6px 11px; }
}
</style>

<style>
/* StPageFlip base (library ships no stylesheet) + paper treatment */
.pb-host.stf__parent { position: relative; display: block; box-sizing: border-box; transform: translateZ(0); touch-action: pan-y; }
.pb-host .stf__wrapper { position: relative; width: 100%; box-sizing: border-box; }
.pb-host .stf__block { position: absolute; width: 100%; height: 100%; box-sizing: border-box; perspective: 2000px; }
.pb-host .stf__item { display: none; position: absolute; transform-style: preserve-3d; }
.pb-host .stf__outerShadow,
.pb-host .stf__innerShadow,
.pb-host .stf__hardShadow,
.pb-host .stf__hardInnerShadow { position: absolute; left: 0; top: 0; }

/* Each leaf: drop shadow outside, spine curvature on top of the paper */
.pb-host .pb-page { box-shadow: 0 14px 26px -16px rgb(52 61 45 / 30%); }
.pb-host .pb-page > .bp { height: 100%; }
.pb-host .pb-page::after {
  position: absolute;
  inset: 0;
  content: '';
  pointer-events: none;
}
.pb-host .pb-page.--soft.--left::after {
  background: linear-gradient(270deg, rgb(40 46 34 / 22%) 0, rgb(40 46 34 / 8%) 2.5%, transparent 9%), linear-gradient(90deg, rgb(255 255 255 / 35%) 0, transparent 1.2%);
}
.pb-host .pb-page.--soft.--right::after {
  background: linear-gradient(90deg, rgb(40 46 34 / 20%) 0, rgb(40 46 34 / 7%) 2.5%, transparent 9%), linear-gradient(270deg, rgb(255 255 255 / 35%) 0, transparent 1.2%);
}
.pb-host .pb-page.--hard { box-shadow: 0 18px 32px -14px rgb(30 36 26 / 48%); }
.pb-host .pb-page.--hard::after { box-shadow: inset 0 0 0 1px rgb(0 0 0 / 14%); border-radius: 2px 4px 4px 2px; }
.pb-host .pb-page.--hard.--right::after { background: linear-gradient(90deg, rgb(0 0 0 / 22%) 0, rgb(255 255 255 / 8%) 1.5%, transparent 4%); }
.pb-host .pb-page.--hard.--left::after { background: linear-gradient(270deg, rgb(0 0 0 / 22%) 0, rgb(255 255 255 / 8%) 1.5%, transparent 4%); }
</style>
