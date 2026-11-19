// Prints every CJK-ish character the Chinese site renders, AFTER the
// Simplified → Traditional conversion, so the edukai subset covers them.
// Usage: node scripts/collect-zh-text.mjs <output.txt>
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { toHant } from '../.vitepress/zh-hant.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const SOURCES = ['zh', '.vitepress/theme', '.vitepress/config.ts', 'public/font-loader.js']
const EXTS = new Set(['.md', '.vue', '.ts', '.js', '.mjs'])
// Text that only exists at runtime (loader overlay, numerals in cards).
const EXTRA = '正在路上載入字體請稍等先逛逛重新載入〇一二三四五六七八九十年月日週'

const isCjkish = (cp) =>
  (cp >= 0x2e80 && cp <= 0x2fdf) || (cp >= 0x3000 && cp <= 0x303f) ||
  (cp >= 0x3400 && cp <= 0x4dbf) || (cp >= 0x4e00 && cp <= 0x9fff) ||
  (cp >= 0xf900 && cp <= 0xfaff) || (cp >= 0xff00 && cp <= 0xffef)

function* walk(path) {
  const stat = statSync(path, { throwIfNoEntry: false })
  if (!stat) return
  if (stat.isFile()) { if (EXTS.has(extname(path))) yield path; return }
  for (const name of readdirSync(path)) yield* walk(join(path, name))
}

const chars = new Set()
const add = (text) => { for (const ch of text) if (isCjkish(ch.codePointAt(0))) chars.add(ch) }
for (const source of SOURCES) {
  for (const file of walk(join(ROOT, source))) add(toHant(readFileSync(file, 'utf8')))
}
add(EXTRA)

const out = [...chars].sort().join('')
if (process.argv[2]) writeFileSync(process.argv[2], out, 'utf8')
else process.stdout.write(out)
