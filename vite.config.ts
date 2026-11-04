import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [
		sveltekit({
			preprocess: [vitePreprocess({})],
			compilerOptions: { experimental: { async: true } },
			adapter: adapter(),
			paths: { origin: process.env.COFFEE_VAULT_ORIGIN },
			experimental: { remoteFunctions: true }
		}),
		tailwindcss()
	]
});
