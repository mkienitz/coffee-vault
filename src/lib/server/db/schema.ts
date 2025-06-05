import { integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { countries } from 'countries-list';
import { relations } from 'drizzle-orm';

const [c, ...cs] = Object.values(countries).map((c) => c.name);
export const coffees = sqliteTable('coffees', {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	country: text({ enum: [c, ...cs] }).notNull(),
	elevation: text().notNull(),
	farm: text().notNull(),
	flavorProfile: text().notNull(),
	name: text().notNull(),
	notes: text().notNull(),
	process: text().notNull(),
	producer: text().notNull(),
	region: text().notNull(),
	roaster: text().notNull(),
	roastingDate: text().notNull(),
	varietals: text().notNull(),
	weight: real().notNull()
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
