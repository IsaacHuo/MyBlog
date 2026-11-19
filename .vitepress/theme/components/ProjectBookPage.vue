<template>
  <article
    class="bp"
    :class="['bp--' + page.kind, { 'bp-en': !isZh }]"
    :data-density="page.hard ? 'hard' : 'soft'"
  >
    <div class="bp-top">
      <span>{{ page.top }}</span>
      <span>{{ page.topRight }}</span>
    </div>

    <div class="bp-body">
      <template v-if="page.kind === 'front'">
        <span
          class="bp-seal"
          aria-hidden="true"
        >{{ page.seal }}</span>
        <p class="bp-front-title">
          {{ page.title }}
        </p>
        <p class="bp-front-sub">
          {{ page.subtitle }}
        </p>
      </template>

      <template v-else-if="page.kind === 'back'">
        <p class="bp-back-line">
          {{ page.line }}
        </p>
        <span
          class="bp-seal bp-seal-small"
          aria-hidden="true"
        >{{ page.seal }}</span>
      </template>

      <template v-else-if="page.kind === 'cover'">
        <p class="bp-cover-word">
          {{ page.word[0] }}<span>{{ page.word[1] }}</span>
        </p>
        <p class="bp-cover-caption">
          {{ page.caption }}
        </p>
      </template>

      <template v-else-if="page.kind === 'toc'">
        <h3 class="bp-toc-title">
          {{ page.title }}
        </h3>
        <ol class="bp-toc">
          <li
            v-for="item in page.items"
            :key="item.name"
          >
            <button
              type="button"
              :data-go="item.page"
              @click="emit('go', item.page)"
            >
              <span class="bp-toc-no">{{ item.no }}</span>
              <span class="bp-toc-name">{{ item.name }}</span>
              <span class="bp-toc-page">p.{{ String(item.page).padStart(2, '0') }}</span>
              <small>{{ item.desc }}</small>
            </button>
          </li>
        </ol>
        <p class="bp-note">
          {{ page.note }}
        </p>
      </template>

      <template v-else-if="page.kind === 'intro'">
        <span
          class="bp-glyph"
          aria-hidden="true"
        >{{ page.glyph }}</span>
        <h3 class="bp-name">
          {{ page.name }}
        </h3>
        <p class="bp-tagline">
          {{ page.tagline }}
        </p>
        <dl class="bp-meta">
          <div
            v-for="row in page.meta"
            :key="row[0]"
          >
            <dt>{{ row[0] }}</dt>
            <dd>{{ row[1] }}</dd>
          </div>
        </dl>
      </template>

      <template v-else>
        <figure class="bp-figure">
          <img
            :src="withBase(page.image)"
            :alt="page.imageAlt"
            loading="lazy"
            draggable="false"
          >
        </figure>
        <ul class="bp-features">
          <li
            v-for="feature in page.features"
            :key="feature"
          >
            {{ feature }}
          </li>
        </ul>
        <div class="bp-links">
          <a
            v-for="link in page.links"
            :key="link.href"
            :href="link.external ? link.href : withBase(link.href)"
            :target="link.external ? '_blank' : undefined"
            :rel="link.external ? 'noopener noreferrer' : undefined"
          >{{ link.label }} {{ link.external ? '↗' : '→' }}</a>
        </div>
      </template>
    </div>

    <div class="bp-bottom">
      <span>{{ page.bottom }}</span>
      <span v-if="!page.hard">{{ String(number).padStart(2, '0') }}</span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { withBase } from 'vitepress'

defineProps<{ page: Record<string, any>; number: number; isZh: boolean }>()
const emit = defineEmits<{ (e: 'go', page: number): void }>()
</script>

<style scoped>
/* Hard cloth covers */
.bp.bp--front,
.bp.bp--back {
  color: #efe8d2;
  background-color: #47533c;
  background-image:
    radial-gradient(120% 90% at 28% 18%, rgb(255 255 255 / 9%), transparent 62%),
    repeating-linear-gradient(45deg, rgb(255 255 255 / 3.5%) 0 1px, transparent 1px 4px),
    repeating-linear-gradient(-45deg, rgb(0 0 0 / 6%) 0 1px, transparent 1px 4px);
}

.bp--front .bp-top,
.bp--front .bp-bottom,
.bp--back .bp-top,
.bp--back .bp-bottom { color: rgb(239 232 210 / 72%); }

.bp--front .bp-body,
.bp--back .bp-body {
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 1px solid rgb(239 232 210 / 38%);
  outline: 1px solid rgb(239 232 210 / 18%);
  outline-offset: -9px;
}

.bp--back .bp-body { justify-content: flex-end; padding-bottom: 12%; }

.bp-seal {
  display: grid;
  place-items: center;
  width: 24cqw;
  aspect-ratio: 1;
  border: 2px solid currentColor;
  border-radius: 50%;
  font-size: 13cqw;
  line-height: 1;
}

.bp-seal-small { width: 12cqw; margin-top: 8%; font-size: 6.5cqw; border-width: 1px; }

.bp-front-title {
  margin: 14% 0 0;
  font-size: 11cqw;
  line-height: 1.3;
  letter-spacing: 0.28em;
  text-indent: 0.28em;
}

.bp-front-sub {
  margin: 5% 0 0;
  font-size: max(11px, 3.3cqw);
  letter-spacing: 0.22em;
  opacity: 0.78;
}

.bp-back-line { margin: 0; font-size: max(12px, 3.8cqw); line-height: 1.8; letter-spacing: 0.12em; }

.bp-toc button * { pointer-events: none; }

/* One printed page of the project book (zhibi.fun book-fallback-page) */
.bp {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 7.5% 8.5% 6%;
  overflow: hidden;
  color: #22231f;
  background-color: #fcfbf7;
  background-image: repeating-linear-gradient(0deg, #b8b5980a 0, #b8b5980a 1px, transparent 1px, transparent 3px);
  container-type: inline-size;
}

.bp-top,
.bp-bottom {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #62675d;
  font-size: min(12px, 4.1cqw);
  line-height: 1.6;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.bp-top { padding-bottom: 7%; }
.bp-bottom { padding-top: 5%; font-variant-numeric: tabular-nums; }

.bp-body {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  min-height: 0;
}

/* Cover */
.bp-cover-word {
  width: 100%;
  margin: 2% 0 0 -3%;
  font-size: 36cqw;
  line-height: 1.06;
  letter-spacing: -0.07em;
}

.bp-cover-word span {
  display: inline-block;
  margin-left: 38%;
  color: #839b69;
}

.bp-en .bp-cover-word {
  margin-left: 0;
  font-size: 19cqw;
  font-style: italic;
  letter-spacing: -0.03em;
}

.bp-en .bp-cover-word span { margin-left: 18%; }

.bp-cover-caption {
  margin: auto 0 0;
  font-size: max(12px, 3.7cqw);
  line-height: 1.7;
}

/* Contents */
.bp-toc-title {
  margin: 3% 0 0;
  font-size: 12cqw;
  font-weight: 400;
  line-height: 1.3;
}

.bp-toc {
  width: 100%;
  margin: 8% 0 0;
  padding: 0;
  list-style: none;
}

.bp-toc li { margin: 0; }

.bp-toc button {
  display: grid;
  grid-template-columns: 9cqw 1fr auto;
  align-items: baseline;
  width: 100%;
  padding: 3cqw 0;
  border: 0;
  border-top: 1px solid #daddd1;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.bp-toc button:hover .bp-toc-name { color: #5e7650; }
.bp-toc button:focus-visible { outline: 2px solid #5e7650; outline-offset: 2px; }

.bp-toc-no,
.bp-toc-page {
  color: #62675d;
  font-size: max(11px, 3.3cqw);
  font-variant-numeric: tabular-nums;
}

.bp-toc-name { font-size: 6cqw; line-height: 1.35; }

.bp-toc small {
  grid-column: 2 / 4;
  color: #62675d;
  font-size: max(11px, 3.3cqw);
  line-height: 1.6;
}

.bp-note {
  margin: auto 0 0;
  color: #62675d;
  font-size: max(11px, 3.2cqw);
  line-height: 1.9;
}

/* Project intro (left page) */
.bp-glyph {
  display: grid;
  width: 44%;
  aspect-ratio: 1;
  margin-top: 2%;
  align-self: center;
  place-items: center;
  border-radius: 48% 51% 47% 49%;
  box-shadow: inset 0 0 0 2px #839b69;
  font-size: 26cqw;
  line-height: 1;
}

.bp-name {
  margin: 7% 0 0;
  font-size: 9.5cqw;
  font-weight: 400;
  line-height: 1.2;
}

.bp-tagline {
  margin: 2% 0 0;
  color: #3b3d36;
  font-size: max(12px, 4.3cqw);
  line-height: 1.65;
}

.bp-meta {
  width: 100%;
  margin: auto 0 0;
  padding-top: 4%;
}

.bp-meta div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.7cqw 0;
  border-top: 1px solid #daddd1;
  font-size: max(11px, 3.4cqw);
  line-height: 1.5;
}

.bp-meta dt { color: #62675d; }
.bp-meta dd { margin: 0; text-align: right; }

/* Project detail (right page) */
.bp-figure {
  width: 100%;
  aspect-ratio: 16 / 9;
  margin: 0;
  overflow: hidden;
  border: 1px solid #e2e1d6;
  background: #f2f1ea;
}

.bp-figure img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  pointer-events: none;
}

.bp-features {
  width: 100%;
  margin: 6% 0 0;
  padding: 0;
  list-style: none;
}

.bp-features li {
  position: relative;
  margin: 0;
  padding: 1.1cqw 0 1.1cqw 6cqw;
  font-size: max(12px, 3.9cqw);
  line-height: 1.6;
}

.bp-features li::before {
  position: absolute;
  left: 0;
  color: #839b69;
  content: '—';
}

.bp-links {
  display: flex;
  flex-wrap: wrap;
  gap: 2cqw 6cqw;
  margin-top: auto;
  padding-top: 4%;
}

.bp-links a {
  color: #22231f;
  font-size: max(12px, 3.8cqw);
  text-decoration: underline;
  text-decoration-color: #839b69;
  text-underline-offset: 3px;
}

.bp-links a:hover { color: #5e7650; }
.bp-links a:focus-visible { outline: 2px solid #5e7650; outline-offset: 2px; }
</style>
