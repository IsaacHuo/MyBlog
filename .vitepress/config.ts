import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Huo Weifang's Blog",
  description: 'Personal projects by Huo Weifang',
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
      label: '中文',
      lang: 'zh-CN',
      title: "Huo Weifang 的博客",
      description: '霍玮放的个人项目',
      themeConfig: {
        siteTitle: 'Huo Weifang',
        nav: [
          { text: '项目', link: '/zh/projects/' }
        ],
        socialLinks: [
          { icon: 'github', link: 'https://github.com/IsaacHuo/MyBlog' }
        ],
        footer: {
          copyright: 'Copyright © 2024–2026 Huo Weifang'
        },
        outline: [2, 3],
      }
    }
  },

  head: [
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0, user-scalable=yes' }],
    ['link', { rel: 'icon', href: '/huo.png' }],
    ['meta', { name: 'author', content: 'Huo Weifang' }],
    ['meta', { property: 'og:title', content: "Huo Weifang's Blog" }],
    ['meta', { property: 'og:description', content: 'Personal projects by Huo Weifang' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap', rel: 'stylesheet' }]
  ],

  themeConfig: {
    siteTitle: 'Huo Weifang',
    nav: [
      { text: 'Project', link: '/en/projects/' }
    ],



    socialLinks: [
      { icon: 'github', link: 'https://github.com/IsaacHuo/MyBlog' }
    ],

    footer: {
      copyright: 'Copyright © 2024–2026 Huo Weifang'
    },

    outline: [2, 3],
  },

  markdown: {
    lineNumbers: true
  }
})
