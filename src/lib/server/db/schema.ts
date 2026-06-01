import {
	integer,
	primaryKey,
	real,
	sqliteTable,
	text,
	check,
	index
} from 'drizzle-orm/sqlite-core';
import { countries } from 'countries-list';
import { relations, sql } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { getCurrentDateTime } from '../../utils';
import { processValues } from '../../constants';

const [c, ...cs] = Object.values(countries).map((c) => c.name);
export const coffees = sqliteTable('coffees', {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	name: text().notNull(),
	roaster: text(),
	varietals: text(),
	process: text({ enum: [...processValues] }),
	processDetails: text(),
	flavorProfile: text(),
	country: text({ enum: [c, ...cs] }),
	region: text(),
	farm: text(),
	producer: text(),
	elevation: text(),
	roastingDate: text(),
	weight: real().notNull(),
	description: text(),
	notes: text()
});

export const coffeesRelations = relations(coffees, ({ many }) => ({
	doses: many(doses),
	brews: many(brews),
	bags: many(bags)
}));

export const doses = sqliteTable(
	'doses',
	{
		drawer: text({ enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'] }).notNull(),
		tubeNumber: text({ enum: ['1', '2', '3', '4', '5', '6', '7', '8'] }).notNull(),
		creationDate: text(),
		weight: real(),
		coffeeId: integer().references(() => coffees.id)
	},
	(doses) => [
		primaryKey({ columns: [doses.drawer, doses.tubeNumber] }),
		check(
			'dose_data_consistency',
			sql`(${doses.coffeeId} IS NULL AND ${doses.weight} IS NULL AND ${doses.creationDate} IS NULL) OR (${doses.coffeeId} IS NOT NULL AND ${doses.weight} IS NOT NULL AND ${doses.creationDate} IS NOT NULL)`
		),
		index('doses_coffeeId_idx').on(doses.coffeeId)
	]
);

export const dosesRelations = relations(doses, ({ one }) => ({
	coffee: one(coffees, {
		fields: [doses.coffeeId],
		references: [coffees.id]
	})
}));

export const brews = sqliteTable(
	'brews',
	{
		id: integer().primaryKey({ autoIncrement: true }).notNull(),
		coffeeId: integer()
			.references(() => coffees.id)
			.notNull(),
		consumptionDate: text()
			.$defaultFn(() => getCurrentDateTime())
			.notNull(),
		weight: real().notNull()
	},
	(brews) => [index('brews_coffeeId_idx').on(brews.coffeeId)]
);

export const brewsRelations = relations(brews, ({ one }) => ({
	coffee: one(coffees, {
		fields: [brews.coffeeId],
		references: [coffees.id]
	})
}));

export const bags = sqliteTable(
	'bags',
	{
		id: text()
			.$defaultFn(() => randomUUID())
			.primaryKey(),
		creationDate: text()
			.$defaultFn(() => getCurrentDateTime())
			.notNull(),
		weight: real().notNull(),
		coffeeId: integer()
			.references(() => coffees.id)
			.notNull()
	},
	(bags) => [index('bags_coffeeId_idx').on(bags.coffeeId)]
);

export const bagsRelations = relations(bags, ({ one }) => ({
	coffee: one(coffees, {
		fields: [bags.coffeeId],
		references: [coffees.id]
	})
}));
