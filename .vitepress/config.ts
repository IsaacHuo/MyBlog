import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Huo Weifang's Blog",
  description: "Sharing thoughts on technology, life, and creativity",
  // Cloudflare Pages 使用根路径
  base: '/',

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
      description: "分享技术、生活和创意的思考",
      themeConfig: {
        siteTitle: 'Huo Weifang',
        nav: [
          { text: '文章', link: '/zh/blog/' },
          { text: '项目', link: '/zh/projects/' },
          { text: '片段', link: '/zh/fragments/' }
        ],
        socialLinks: [
          { icon: 'github', link: 'https://github.com/IsaacHuo/MyBlog' }
        ],
        footer: {
          copyright: 'Copyright © 2024 Huo Weifang'
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
    ['meta', { property: 'og:description', content: 'Sharing thoughts on technology, life, and creativity' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['link', { rel: 'preload', href: '/fonts/kaiti-gb2312/kaiti-gb2312-site.woff2', as: 'font', type: 'font/woff2', crossorigin: '' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap', rel: 'stylesheet' }]
  ],

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
      copyright: 'Copyright © 2024 Huo Weifang'
    },

    outline: [2, 3],
  },

  markdown: {
    lineNumbers: true
  }
})
