// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://logicdash.io',
	integrations: [
		sitemap({
			// Unpublished, direct-URL-only pages — keep them out of the
			// generated sitemap until they're ready to launch.
			filter: (page) => !page.includes('/tools/countdown-clock') && !page.includes('/tools/student-picker'),
		}),
	],
});
