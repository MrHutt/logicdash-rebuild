// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://logicdash.io',
	integrations: [
		// Every page is public and indexable, including all /tools/ pages.
		// Short-link redirects (/5A2, see src/pages/[code].astro) are left out.
		sitemap({ filter: (page) => !/^https:\/\/logicdash\.io\/[0-9a-f]{3}\/?$/i.test(page) }),
	],
});
