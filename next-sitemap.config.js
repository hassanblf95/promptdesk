/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://promptdesk.io',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
    ],
  },
  exclude: ['/admin/*', '/api/*'],
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  transform: async (config, path) => {
    // Higher priority for tool pages
    let priority = 0.7
    if (path === '/') priority = 1.0
    else if (path.match(/^\/[^/]+\/[^/]+$/)) priority = 0.9 // tool pages
    else if (path.match(/^\/prompts\//)) priority = 0.8
    else if (path.match(/^\/blog\//)) priority = 0.8
    else if (path.match(/^\/tasks\//)) priority = 0.7
    else if (path.match(/^\/[^/]+$/)) priority = 0.8 // profession pages

    return {
      loc: path,
      changefreq: config.changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  },
}
