import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { countries } from 'countries-list';
import { randomBytes } from 'crypto';
import { relations } from 'drizzle-orm';

const [c, ...cs] = Object.values(countries).map((c) => c.name);
export const coffees = sqliteTable('coffees', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	country: text('country', { enum: [c, ...cs] }).notNull(),
	elevation: text('elevation').notNull(),
	farm: text('farm').notNull(),
	flavorProfile: text('flavorProfile').notNull(),
	name: text('name').notNull(),
	notes: text('notes').notNull(),
	process: text('process').notNull(),
	producer: text('producer').notNull(),
	region: text('region').notNull(),
	roaster: text('roaster').notNull(),
	roastingDate: text('roastingDate').notNull(),
	varietals: text('varietals').notNull(),
	weight: real('weight').notNull()
});

export const coffeesRelations = relations(coffees, ({ many }) => ({
	doses: many(doses)
}));

export const doses = sqliteTable('doses', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	token: text('token')
		.unique()
		.notNull()
		.$defaultFn(() => randomBytes(32).toString('base64')),
	consumedOn: text('consumed_on'),
	weight: real('weight').notNull(),
	coffeeId: integer('coffee_id').notNull()
});

export const dosesRelations = relations(doses, ({ one }) => ({
	coffee: one(coffees, {
		fields: [doses.coffeeId],
		references: [coffees.id]
	})
}));

const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite, { schema: { coffees } });
