import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { countries } from 'countries-list';
import { createInsertSchema } from 'drizzle-zod';

const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite);

const [c, ...cs] = Object.values(countries).map((c) => c.name);

export const coffees = sqliteTable('coffees', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	country: text('country', { enum: [c, ...cs] }).notNull(),
	elevation: text('elevation').notNull(),
	farm: text('farm').notNull(),
	name: text('name').notNull(),
	notes: text('notes'),
	process: text('process').notNull(),
	region: text('region').notNull(),
	roaster: text('roaster').notNull(),
	roastingDate: text('roastingDate').notNull(),
	varietals: text('varietals').notNull(),
	weight: integer('weight').notNull(),
});

export const insertCoffeeSchema = createInsertSchema(coffees);
