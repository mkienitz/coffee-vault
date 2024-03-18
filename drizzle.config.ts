import { defineConfig } from 'drizzle-kit';
export default defineConfig({
	schema: './src/lib/db/index.ts',
	driver: 'better-sqlite',
	dbCredentials: {
		url: 'sqlite.db'
	},
	out: './drizzle',
	verbose: true,
	strict: true
});
