// Simplified → Traditional (Taiwan) conversion used at build time.
// Source files stay in Simplified Chinese; everything rendered under /zh/
// passes through toHant() so the edukai (Traditional Kai) font covers it.
import * as OpenCC from 'opencc-js/cn2t'

// cn → twp: Taiwan standard glyphs plus Taiwan phrasing (软件→軟體).
// Switch to 'tw' for glyph-only conversion without vocabulary changes.
const convert = OpenCC.Converter({ from: 'cn', to: 'tw' })

// Phrases that must survive conversion verbatim (product names, quotes...).
export const NO_CONVERT = []

const CJK_RE = /[\u3400-\u9fff]/
const cache = new Map()

export function toHant(text) {
  if (typeof text !== 'string' || !CJK_RE.test(text)) return text
  const hit = cache.get(text)
  if (hit !== undefined) return hit

  // Shield exempt phrases with private-use placeholders OpenCC never touches.
  const kept = []
  let shielded = text
  for (const phrase of NO_CONVERT) {
    if (!shielded.includes(phrase)) continue
    shielded = shielded.split(phrase).join(`\uE000${kept.length}\uE001`)
    kept.push(phrase)
  }
  let result = convert(shielded)
  if (kept.length) {
    result = result.replace(/\uE000(\d+)\uE001/g, (_, i) => kept[Number(i)])
  }
  if (cache.size < 5000) cache.set(text, result)
  return result
}

/** Recursively convert every string inside plain objects/arrays. */
export function toHantDeep(value) {
  if (typeof value === 'string') return toHant(value)
  if (Array.isArray(value)) return value.map(toHantDeep)
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toHantDeep(v)]))
  }
  return value
}

/**
 * Vite plugin: converts Chinese markdown sources under <srcDir>/zh/ and the
 * theme's Vue components before VitePress / plugin-vue compile them.
 * Components only contain Chinese inside isZh branches, so English pages
 * are unaffected.
 */
export function zhHantPlugin() {
  let root = ''
  return {
    name: 'blog:zh-hant',
    enforce: 'pre',
    configResolved(config) {
      root = config.root.replace(/\\/g, '/').replace(/\/$/, '')
    },
    transform(code, id) {
      if (id.includes('?')) return null
      const file = id.replace(/\\/g, '/')
      const isZhPage = (file.startsWith(`${root}/zh/`) && file.endsWith('.md')) || file === `${root}/index.md`
      const isThemeVue = file.includes('/.vitepress/theme/') && file.endsWith('.vue')
      if (!isZhPage && !isThemeVue) return null
      const out = toHant(code)
      return out === code ? null : { code: out, map: null }
    }
  }
}
