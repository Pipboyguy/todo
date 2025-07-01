import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST })],
	resolve: {
		alias: {
			$lib: path.resolve('./src/lib')
		}
	},
	test: {
		browser: {
			enabled: true,
			name: 'chromium',
			provider: 'playwright',
		},
		include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
	},
});