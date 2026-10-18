// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://logicdash.io',
	integrations: [
		// Every page is public and indexable, including all /tools/ pages.
		sitemap(),
	],
});
