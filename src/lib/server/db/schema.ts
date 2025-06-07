import { integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { countries } from 'countries-list';
import { relations } from 'drizzle-orm';
import { processValues } from '../../zod-schemas';

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
	brews: many(brews)
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
	(doses) => [primaryKey({ columns: [doses.drawer, doses.tubeNumber] })]
);

export const dosesRelations = relations(doses, ({ one }) => ({
	coffee: one(coffees, {
		fields: [doses.coffeeId],
		references: [coffees.id]
	})
}));

export const brews = sqliteTable('brews', {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	coffeeId: integer()
		.references(() => coffees.id)
		.notNull(),
	consumptionDate: text().notNull(),
	weight: real().notNull()
});

export const brewsRelations = relations(brews, ({ one }) => ({
	coffee: one(coffees, {
		fields: [brews.coffeeId],
		references: [coffees.id]
	})
}));
