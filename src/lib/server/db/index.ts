import { env } from '$env/dynamic/private';
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

export const db = drizzle({
	connection: {
		url: `file:${env.COFFEE_VAULT_DB_PATH}`
	},
	schema: {
		coffees,
		coffeesRelations,
		doses,
		dosesRelations,
		brews,
		brewsRelations,
		bags,
		bagsRelations
	}
});
