import { defineConfig } from 'vitepress'
import { toHant, toHantDeep, zhHantPlugin } from './zh-hant.mjs'

// Font-loading overlay (mirrors zhibi.fun): shown on the first visit of a
// session until the Kai / Lora fonts are ready, forced off after 20s.
const fontLoaderStyle = `
html.font-loading{overflow:hidden}
html.font-loading body{visibility:hidden}
html.font-loading::before{content:var(--loader-text,"正在路上\\A正在載入字體，請稍等");white-space:pre;position:fixed;inset:0;z-index:9998;display:grid;place-items:center;padding-bottom:40px;background:snow;color:#22231f;font:500 15px/2.4 -apple-system,BlinkMacSystemFont,"PingFang TC","Microsoft JhengHei",sans-serif;letter-spacing:.18em;text-align:center}
html.font-loading::after{content:"";position:fixed;z-index:9999;left:50%;top:calc(50% + 40px);width:min(300px,calc(100vw - 64px));height:2px;transform:translateX(-50%);background:linear-gradient(90deg,#839b69 0 38%,transparent 38%) no-repeat,#dadfd3;background-size:38% 100%,100% 100%;animation:font-loader-travel 1.5s ease-in-out infinite alternate}
html[lang=en].font-loading::before{content:"On the way\\ALoading fonts, one moment"}
@keyframes font-loader-travel{from{background-position:-60% 0,0 0}to{background-position:160% 0,0 0}}
@media(prefers-reduced-motion:reduce){html.font-loading::after{animation:none}}
.font-loader-actions{position:fixed;z-index:10000;left:50%;top:calc(50% + 64px);transform:translateX(-50%);visibility:visible;display:flex;gap:8px}
.font-loader-actions button{border:0;background:none;color:#4d5e3d;padding:8px 10px;font:12px -apple-system,BlinkMacSystemFont,"PingFang TC",sans-serif;text-decoration:underline;text-underline-offset:4px;cursor:pointer}
.font-loader-actions button:focus-visible{outline:2px solid #4d5e3d;outline-offset:2px}
`

const fontLoaderBoot = `try{if(document.fonts&&document.fonts.load&&!sessionStorage.getItem('blog-fonts-ready')){document.documentElement.classList.add('font-loading');setTimeout(function(){document.documentElement.classList.remove('font-loading')},20000)}}catch(e){}`

const zhNav = toHantDeep({
  siteTitle: '霍玮放',
  nav: [
    { text: '文章', link: '/zh/blog/' },
    { text: '项目', link: '/zh/projects/' },
    { text: '片段', link: '/zh/fragments/' }
  ],
  footer: {
    message: '保持好奇，持续构建。',
    copyright: 'Copyright © 2024–2026 霍玮放'
  }
})

export default defineConfig({
  title: "Huo Weifang's Blog",
  description: 'Sharing thoughts on technology, life, and creativity',
  // Cloudflare Pages 使用根路径
  base: '/',
  srcExclude: ['archive/**'],

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      link: '/en/'
    },
    zh: {
      label: toHant('中文'),
      lang: 'zh-Hant',
      title: toHant('霍玮放的博客'),
      description: toHant('分享技术、生活和创意的思考'),
      themeConfig: {
        ...zhNav,
        socialLinks: [
          { icon: 'github', link: 'https://github.com/IsaacHuo/MyBlog' }
        ],
        outline: [2, 3]
      }
    }
  },

  head: [
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0, user-scalable=yes' }],
    ['meta', { name: 'theme-color', content: '#fffafa' }],
    ['link', { rel: 'icon', href: '/huo.png' }],
    ['meta', { name: 'author', content: 'Huo Weifang' }],
    ['meta', { property: 'og:title', content: "Huo Weifang's Blog" }],
    ['meta', { property: 'og:description', content: 'Sharing thoughts on technology, life, and creativity' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['style', {}, fontLoaderStyle],
    ['script', {}, fontLoaderBoot],
    ['script', { src: '/font-loader.js', defer: '' }]
  ],

  // Preload the Kai subset only on Chinese pages; English pages never need it.
  transformHead({ pageData }) {
    if (!pageData.relativePath.startsWith('zh/')) return []
    return [
      ['link', { rel: 'preload', href: '/fonts/edukai/edukai-site.woff2', as: 'font', type: 'font/woff2', crossorigin: '' }]
    ]
  },

  themeConfig: {
    siteTitle: 'Huo Weifang',
    nav: [
      { text: 'Blog', link: '/en/blog/' },
      { text: 'Project', link: '/en/projects/' },
      { text: 'Fragments', link: '/en/fragments/' }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/IsaacHuo/MyBlog' }
    ],

    footer: {
      message: 'Write with care, live with care.',
      copyright: 'Copyright © 2024–2026 Huo Weifang'
    },

    outline: [2, 3]
  },

  vite: {
    plugins: [zhHantPlugin()]
  },

  markdown: {
    lineNumbers: true
  }
})
