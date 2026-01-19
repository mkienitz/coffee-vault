import { query } from '$app/server';
import { db } from '$lib/server/db';
import { coffees } from '$lib/server/db/schema';
import { coffeeFilterSchema } from '$lib/validation';
import { and, eq } from 'drizzle-orm';
import { unique } from 'radash';

export const getAllCoffeeIds = query(async () => {
	return (
		await db.query.coffees.findMany({
			columns: {
				id: true
			},
			orderBy: (coffees, { desc }) => [desc(coffees.roastingDate)]
		})
	).map((coffee) => coffee.id);
});

export const getFilteredIdsAndData = query(coffeeFilterSchema, async (filters) => {
	const dbResult = await db.query.coffees.findMany({
		where: and(
			eq(coffees.roaster, filters?.roaster ?? coffees.roaster),
			eq(coffees.process, filters?.process ?? coffees.process),
			eq(coffees.varietals, filters?.varietals ?? coffees.varietals),
			eq(coffees.country, filters?.country ?? coffees.country)
		),
		columns: {
			id: true,
			roaster: true,
			process: true,
			country: true,
			varietals: true
		},
		orderBy: (coffees, { desc }) => [desc(coffees.roastingDate)]
	});

	function nullFilter<T>(v: T): v is NonNullable<T> {
		return v !== null;
	}
	return {
		coffeeIds: dbResult.map((o) => o.id),
		availableValues: {
			roaster: unique(dbResult.map((o) => o.roaster).filter(nullFilter)),
			process: unique(dbResult.map((o) => o.process).filter(nullFilter)),
			country: unique(dbResult.map((o) => o.country).filter(nullFilter)),
			varietals: unique(dbResult.map((o) => o.varietals).filter(nullFilter))
		}
	};
});
