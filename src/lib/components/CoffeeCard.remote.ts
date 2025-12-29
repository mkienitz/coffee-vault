import { query } from '$app/server';
import { db } from '$lib/server/db';
import { coffees } from '$lib/server/db/schema';
import { coffeeSelectDbSchema } from '$lib/server/validation';
import { error } from '@sveltejs/kit';
import { inArray } from 'drizzle-orm';
import { first } from 'radash';
import * as v from 'valibot';

export const getCoffeeCardData = query.batch(v.number(), async (coffeeIds) => {
	console.info('getCoffeeCardDataBatched invoked...');
	const allResults = (
		await db.query.coffees.findMany({
			where: inArray(coffees.id, coffeeIds),
			columns: {
				id: true,
				country: true,
				farm: true,
				name: true,
				region: true,
				roaster: true,
				weight: true,
				process: true,
				varietals: true,
				flavorProfile: true,
				roastingDate: true
			},
			with: {
				doses: {
					columns: {
						tubeNumber: true,
						drawer: true
					}
				},
				brews: {
					columns: {
						id: true
					}
				}
			}
		})
	).map((res) => {
		const { brews, doses, ...coffee } = res;
		const firstDose = first(doses);
		return {
			coffee: v.parse(coffeeSelectDbSchema, coffee),
			remainingDoses: doses.length,
			dosesBrewed: brews.length,
			nextTube: firstDose ? `${firstDose.drawer}${firstDose.tubeNumber}` : undefined
		};
	});
	const lookup = new Map(allResults.map((res) => [res.coffee.id, res]));

	return (coffeeId) => {
		const data = lookup.get(coffeeId);
		if (!data) {
			error(405, 'Not found');
		}
		return data;
	};
});
