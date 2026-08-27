import { createContentLoader } from 'vitepress'

const loader = createContentLoader(['zh/blog/*.md', 'en/blog/*.md'], {
  includeSrc: false,
  render: false,
  excerpt: false,
  transform(rawData) {
    return rawData
      .filter(({ url, frontmatter }) => {
        const normalizedUrl = url.replace(/\.html$/, '')
        if (!frontmatter.title) return false
        if (frontmatter.hidden === true || frontmatter.draft === true) return false
        if (normalizedUrl.endsWith('/index') || normalizedUrl.endsWith('/blog/') || normalizedUrl.endsWith('/zh/blog/')) return false
        if (normalizedUrl.endsWith('/template')) return false
        return true
      })
      .map(({ url, frontmatter }) => ({
        url,
        frontmatter
      }))
      .sort((a, b) => {
        return +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date)
      })
  }
})

export default loader
export const data = loader
