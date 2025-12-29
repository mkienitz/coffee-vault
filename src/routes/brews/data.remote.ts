import { query } from '$app/server';
import { db } from '$lib/server/db';
import { sum, unique } from 'radash';

export const getBrewPageData = query(async () => {
	const brews = await db.query.brews.findMany({
		columns: {
			id: false
		},
		with: {
			coffee: {
				columns: {
					country: true,
					name: true
				}
			}
		},
		// TODO: Fix wrong order
		orderBy: (brews, { desc }) => [desc(brews.consumptionDate)]
	});
	return {
		brews,
		totalBrews: brews.length,
		totalCoffees: unique(brews.map((brew) => brew.coffeeId)).length,
		totalWeight: sum(brews.map((brew) => brew.weight))
	};
});
