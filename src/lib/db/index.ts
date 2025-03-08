import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { coffees, coffeesRelations, doses, dosesRelations } from './schema';

export const db = drizzle({
	client: new Database(env.COFFEE_VAULT_DB_PATH),
	schema: { coffees, doses, dosesRelations, coffeesRelations }
});
