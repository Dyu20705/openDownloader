import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import accessibleTables from './scripts/accessible-tables.mjs';

export default defineConfig({
  site: 'https://dyu20705.github.io',
  base: '/openDownloader',
  trailingSlash: 'always',
  output: 'static',
  markdown: { processor: unified({ rehypePlugins: [accessibleTables] }) },
  integrations: [
    starlight({
      title: 'openDownloader',
      disable404Route: true,
      description: 'Inspect media, review an acquisition plan, and download on Linux.',
      favicon: '/branding/favicon.svg',
      customCss: ['./src/styles/docs.css'],
      components: { Header: './src/components/DocsHeader.astro' },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/Dyu20705/openDownloader' }],
      sidebar: [
        { label: 'Documentation', link: '/docs/' },
        { label: 'Getting Started', link: '/docs/getting-started/' },
        { label: 'User Guide', link: '/docs/user-guide/' },
        { label: 'Media Tools', link: '/docs/media-tools/' },
        { label: 'Troubleshooting', link: '/docs/troubleshooting/' },
        { label: 'Privacy', link: '/docs/privacy/' },
        { label: 'Developers', link: '/docs/developers/' },
      ],
    }),
    sitemap({ filter: page => !new URL(page).pathname.replace(/\/$/, '').endsWith('/404') }),
  ],
});
