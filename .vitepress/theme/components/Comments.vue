<template>
  <div
    ref="container"
    class="comments-wrapper"
  >
    <noscript>请启用 JavaScript 以加载评论。</noscript>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useData } from 'vitepress'

const { page, site } = useData()
const container = ref<HTMLElement | null>(null)

// 根据当前语言获取 Giscus 配置
const giscusLang = computed(() => {
  const isChinese = site.value.lang === 'zh-CN' || page.value.relativePath.startsWith('zh/')
  return isChinese ? 'zh-CN' : 'en'
})

// Giscus 基础配置
const giscusBaseConfig = {
  'data-repo': 'IsaacHuo/MyBlog',
  'data-repo-id': 'R_kgDOO6P-Dg',
  'data-category': 'Announcements',
  'data-category-id': 'DIC_kwDOO6P-Ds4Cy4z-',
  'data-mapping': 'pathname',
  'data-strict': '0',
  'data-reactions-enabled': '1',
  'data-emit-metadata': '0',
  'data-input-position': 'bottom',
  'data-theme': 'light',
  'data-loading': 'eager'
}

const initGiscus = () => {
  if (!container.value) return

  // 清空容器
  container.value.innerHTML = ''

  // 创建脚本
  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.async = true
  script.defer = true
  script.crossOrigin = 'anonymous'

  // 设置基础属性
  Object.entries(giscusBaseConfig).forEach(([key, value]) => {
    script.setAttribute(key, String(value))
  })

  // 设置动态语言属性
  script.setAttribute('data-lang', giscusLang.value)

  container.value.appendChild(script)
}

// 监听页面变化重新初始化
watch(() => page.value.filePath, () => {
  initGiscus()
})

// 监听语言变化
watch(() => giscusLang.value, () => {
  initGiscus()
})

onMounted(() => {
  initGiscus()
})
</script>

<style scoped>
.comments-wrapper {
  margin-top: var(--space-3xl);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--vp-c-border);
  max-width: 600px;
}

/* Giscus 容器样式调整 */
:deep(.giscus) {
  max-width: 100%;
}

:deep(.giscus-frame) {
  max-width: 100%;
}
</style>
