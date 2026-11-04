import { building } from '$app/env';
import { COFFEE_VAULT_DB_PATH } from '$app/env/private';
import { drizzle } from 'drizzle-orm/libsql';
import {
	brews,
	brewsRelations,
	coffees,
	coffeesRelations,
	doses,
	dosesRelations,
	bags,
	bagsRelations
} from './schema';

const schema = {
	coffees,
	coffeesRelations,
	doses,
	dosesRelations,
	brews,
	brewsRelations,
	bags,
	bagsRelations
};

function createDb() {
	const dbPath = COFFEE_VAULT_DB_PATH;

	if (!dbPath) {
		throw new Error('COFFEE_VAULT_DB_PATH must be set before using the database');
	}

	return drizzle({
		connection: {
			url: `file:${dbPath}`
		},
		schema
	});
}

type Database = ReturnType<typeof createDb>;

const buildTimeDb = new Proxy({} as Database, {
	get() {
		throw new Error('Database access is not available while SvelteKit is building');
	}
});

export const db = building ? buildTimeDb : createDb();
