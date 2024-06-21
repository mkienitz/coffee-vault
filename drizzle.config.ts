import { defineConfig } from 'drizzle-kit';
export default defineConfig({
	schema: './src/lib/db/index.ts',
	dialect: 'sqlite',
	dbCredentials: {
		url: process.env.COFFEE_VAULT_DB_PATH!,
	},
	out: './drizzle',
	verbose: true,
	strict: true
});
