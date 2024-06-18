import { defineConfig } from 'drizzle-kit';
export default defineConfig({
	schema: './src/lib/db/index.ts',
	dialect: 'sqlite',
	dbCredentials: {
		url: 'sqlite.db'
	},
	out: './drizzle',
	verbose: true,
	strict: true
});
