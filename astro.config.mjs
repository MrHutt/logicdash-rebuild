// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://logicdash.io',
	integrations: [
		sitemap({
			// The /tools hub and its linked tools (Countdown Clock, Student
			// Picker, Binary Clock) are public and indexable. Seating Chart is
			// the one holdout — it's not linked from the hub or anywhere else
			// in the site yet, so it stays out of the sitemap (and blocked in
			// robots.txt, see public/robots.txt) until it's actually ready to
			// launch and gets a spot on that page.
			filter: (page) => !page.includes('/tools/seating-chart'),
		}),
	],
});
