import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { brews, brewsRelations, coffees, coffeesRelations, doses, dosesRelations } from './schema';

export const db = drizzle({
	client: new Database(env.COFFEE_VAULT_DB_PATH),
	schema: { coffees, coffeesRelations, doses, dosesRelations, brews, brewsRelations }
});
