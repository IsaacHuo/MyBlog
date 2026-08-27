<template>
  <span
    ref="counterElement"
    class="view-count"
    :class="{ 'with-label': showLabel }"
  >
    <span
      v-if="loading"
      class="count-loading"
      :role="showLabel ? 'status' : undefined"
      :aria-live="showLabel ? 'polite' : undefined"
    >
      <span aria-hidden="true">...</span>
      <span class="visually-hidden">{{ messages.loading }}</span>
    </span>
    <span
      v-else-if="count === null"
      class="count-error"
      :title="errorMessage"
      :role="showLabel ? 'status' : undefined"
    >
      <span aria-hidden="true">N/A</span>
      <span class="visually-hidden">{{ errorMessage }}</span>
    </span>
    <template v-else>
      <span v-if="showLabel">{{ messages.label }}</span>
      <span class="count-number">{{ formattedCount }}</span>
      <span
        v-if="error"
        class="visually-hidden"
        role="status"
      >{{ errorMessage }}</span>
    </template>
  </span>
</template>

<script lang="ts">
type CounterErrorCode = 'missing-id' | 'timeout' | 'request'
type CounterResponse = Record<string, unknown>
type CacheEntry = { value: number; expiresAt: number }

const WORKER_URL = 'https://count.huoweifang.cn/'
const REQUEST_TIMEOUT_MS = 5000
const COMPONENT_TIMEOUT_MS = REQUEST_TIMEOUT_MS + 500
const CACHE_TTL_MS = 30000
const counterCache = new Map<string, CacheEntry>()
const inFlightRequests = new Map<string, Promise<number>>()

class CounterRequestError extends Error {
  code: 'timeout' | 'response'

  constructor(code: 'timeout' | 'response', message: string) {
    super(message)
    this.name = 'CounterRequestError'
    this.code = code
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

function abortError(): DOMException {
  return new DOMException('The request was aborted.', 'AbortError')
}

function withAbortSignal<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(abortError())

  return new Promise((resolve, reject) => {
    const handleAbort = () => reject(abortError())
    signal.addEventListener('abort', handleAbort, { once: true })
    promise.then(
      (value) => {
        signal.removeEventListener('abort', handleAbort)
        resolve(value)
      },
      (error: unknown) => {
        signal.removeEventListener('abort', handleAbort)
        reject(error)
      }
    )
  })
}

function parseCounterResponse(data: unknown): number {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new CounterRequestError('response', 'Invalid counter response.')
  }

  const response = data as CounterResponse
  if (response.error) {
    throw new CounterRequestError('response', String(response.error))
  }

  const rawCount = response.count
  const parsedCount = typeof rawCount === 'number'
    ? rawCount
    : typeof rawCount === 'string' && rawCount.trim() !== ''
      ? Number(rawCount)
      : Number.NaN

  if (!Number.isSafeInteger(parsedCount) || parsedCount < 0) {
    throw new CounterRequestError('response', 'Invalid counter value.')
  }

  return parsedCount
}

async function fetchCounterValue(id: string, isReadonly: boolean): Promise<number> {
  const controller = new AbortController()
  let didTimeout = false
  const timeoutId = setTimeout(() => {
    didTimeout = true
    controller.abort()
  }, REQUEST_TIMEOUT_MS)

  try {
    const url = new URL(WORKER_URL)
    url.searchParams.set('id', id)
    if (isReadonly) url.searchParams.set('readonly', 'true')
    url.searchParams.set('t', Date.now().toString())

    const response = await fetch(url.toString(), { signal: controller.signal })
    if (!response.ok) {
      throw new CounterRequestError('response', `HTTP ${response.status}`)
    }

    return parseCounterResponse(await response.json())
  } catch (error: unknown) {
    if (didTimeout && isAbortError(error)) {
      throw new CounterRequestError('timeout', 'Counter request timed out.')
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

function counterRequestKey(id: string, isReadonly: boolean): string {
  return JSON.stringify([id, isReadonly])
}

function requestCounterValue(id: string, isReadonly: boolean): Promise<number> {
  const key = counterRequestKey(id, isReadonly)
  if (isReadonly) {
    const cached = counterCache.get(key)
    if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.value)
    if (cached) counterCache.delete(key)
  }

  const inFlight = inFlightRequests.get(key)
  if (inFlight) return inFlight

  const request = (async () => {
    try {
      const value = await fetchCounterValue(id, isReadonly)
      if (isReadonly) {
        counterCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS })
      }
      return value
    } finally {
      if (inFlightRequests.get(key) === request) inFlightRequests.delete(key)
    }
  })()

  inFlightRequests.set(key, request)
  return request
}

async function requestLegacyValue(id: string): Promise<number> {
  try {
    return await requestCounterValue(id, true)
  } catch {
    return 0
  }
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  id: string
  legacyIds?: string[]
  showLabel?: boolean
  readonly?: boolean
  isZh?: boolean
  refreshOnFocus?: boolean
}>()

const hasId = () => Boolean(props.id?.trim())
const count = ref<number | null>(null)
const loading = ref(hasId())
const error = ref<CounterErrorCode | null>(hasId() ? null : 'missing-id')
const counterElement = ref<HTMLElement | null>(null)
let activeController: AbortController | null = null
let activeRequestId = 0
let isMounted = false
let listenersAttached = false
let lastAttentionRefresh = 0
let hasEnteredViewport = false
let intersectionObserver: IntersectionObserver | null = null

const messages = computed(() => props.isZh
  ? {
      label: '总阅读量: ',
      loading: '阅读量加载中',
      missingId: '缺少阅读量统计 ID',
      timeout: '阅读量加载超时',
      request: '阅读量加载失败'
    }
  : {
      label: 'Total Views: ',
      loading: 'Loading view count',
      missingId: 'View counter ID is missing',
      timeout: 'View count request timed out',
      request: 'View count failed to load'
    })

const formattedCount = computed(() => {
  if (count.value === null) return '--'
  return new Intl.NumberFormat(props.isZh ? 'zh-CN' : 'en-US').format(count.value)
})

const errorMessage = computed(() => {
  if (error.value === 'missing-id') return messages.value.missingId
  if (error.value === 'timeout') return messages.value.timeout
  return messages.value.request
})

const counterIdentity = computed(() => JSON.stringify([
  props.id,
  Boolean(props.readonly),
  props.legacyIds ?? []
]))

function toErrorCode(caught: unknown, timedOut: boolean): CounterErrorCode {
  if (timedOut) return 'timeout'
  if (caught instanceof CounterRequestError && caught.code === 'timeout') return 'timeout'
  return 'request'
}

async function fetchCount() {
  const requestId = ++activeRequestId
  activeController?.abort()
  activeController = null

  if (!hasId()) {
    count.value = null
    loading.value = false
    error.value = 'missing-id'
    return
  }

  const controller = new AbortController()
  activeController = controller
  let timedOut = false
  const timeoutId = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, COMPONENT_TIMEOUT_MS)

  loading.value = count.value === null
  error.value = null

  try {
    const legacyIds = Array.from(new Set(props.legacyIds ?? []))
      .filter((id) => Boolean(id) && id !== props.id)
    const values = await withAbortSignal(Promise.all([
      requestCounterValue(props.id, Boolean(props.readonly)),
      ...legacyIds.map(requestLegacyValue)
    ]), controller.signal)

    if (requestId !== activeRequestId) return
    const total = values.reduce((sum, value) => sum + value, 0)
    if (!Number.isSafeInteger(total)) {
      throw new CounterRequestError('response', 'Combined counter value is invalid.')
    }
    count.value = total

    if (!props.readonly && props.id !== 'total-views') {
      void requestCounterValue('total-views', false).catch(() => undefined)
    }
  } catch (caught: unknown) {
    if (requestId !== activeRequestId || (isAbortError(caught) && !timedOut)) return
    error.value = toErrorCode(caught, timedOut)
  } finally {
    clearTimeout(timeoutId)
    if (requestId === activeRequestId) {
      activeController = null
      loading.value = false
    }
  }
}

function handleVisibilityRefresh() {
  if (document.visibilityState === 'hidden') return

  const now = Date.now()
  if (now - lastAttentionRefresh < 500) return
  lastAttentionRefresh = now
  void fetchCount()
}

function syncRefreshListeners() {
  if (!isMounted) return
  const shouldListen = Boolean(props.refreshOnFocus)
  if (shouldListen === listenersAttached) return

  if (shouldListen) {
    window.addEventListener('focus', handleVisibilityRefresh)
    document.addEventListener('visibilitychange', handleVisibilityRefresh)
  } else {
    window.removeEventListener('focus', handleVisibilityRefresh)
    document.removeEventListener('visibilitychange', handleVisibilityRefresh)
  }
  listenersAttached = shouldListen
}

watch(counterIdentity, () => {
  count.value = null
  if (isMounted && hasEnteredViewport) void fetchCount()
})

watch(() => props.refreshOnFocus, syncRefreshListeners)

onMounted(() => {
  isMounted = true
  syncRefreshListeners()
  if (props.readonly && 'IntersectionObserver' in window && counterElement.value) {
    intersectionObserver = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return
      hasEnteredViewport = true
      intersectionObserver?.disconnect()
      void fetchCount()
    }, { rootMargin: '300px 0px' })
    intersectionObserver.observe(counterElement.value)
  } else {
    hasEnteredViewport = true
    void fetchCount()
  }
})

onBeforeUnmount(() => {
  isMounted = false
  activeRequestId += 1
  activeController?.abort()
  intersectionObserver?.disconnect()
  if (listenersAttached) {
    window.removeEventListener('focus', handleVisibilityRefresh)
    document.removeEventListener('visibilitychange', handleVisibilityRefresh)
  }
})
</script>

<style scoped>
.view-count {
  font-family: var(--vp-font-family-base);
  font-size: 0.9rem;
  color: var(--vp-c-text-3);
  display: inline-flex;
  align-items: center;
  margin-top: 0.1rem;
}

.view-count.with-label {
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.count-number {
  font-feature-settings: "tnum";
  margin: 0 0.25em;
}

.count-error {
    color: #ef4444;
    font-size: 0.8em;
    cursor: help;
}

.visually-hidden {
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
</style>
