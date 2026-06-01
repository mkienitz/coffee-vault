import { query } from '$app/server';
import { db } from '$lib/server/db';
import { coffees } from '$lib/server/db/schema';
import {
	getRemainingWeight as calculateRemainingWeight,
	getUndosedWeight as calculateUndosedWeight
} from '$lib/server/inventory';
import { error } from '@sveltejs/kit';
import { eq, inArray } from 'drizzle-orm';
import * as v from 'valibot';

export const getUndosedWeight = query(v.number(), async (coffeeId) => {
	const coffee = await db.query.coffees.findFirst({
		where: eq(coffees.id, coffeeId),
		columns: {
			weight: true
		},
		with: {
			doses: {
				columns: {
					weight: true
				}
			},
			bags: {
				columns: {
					weight: true
				}
			},
			brews: {
				columns: {
					weight: true
				}
			}
		}
	});
	if (!coffee) {
		error(404, 'Not found');
	}
	return calculateUndosedWeight({
		weight: coffee.weight,
		tubes: coffee.doses,
		bags: coffee.bags,
		brews: coffee.brews
	});
});

export const getRemainingWeight = query.batch(v.number(), async (coffeeIds) => {
	const allResults = (
		await db.query.coffees.findMany({
			where: inArray(coffees.id, coffeeIds),
			columns: {
				id: true,
				weight: true
			},
			with: {
				brews: {
					columns: {
						weight: true
					}
				}
			}
		})
	).map(({ id, weight, brews }) => {
		return {
			coffeeId: id,
			remainingWeight: calculateRemainingWeight({ weight, brews })
		};
	});

	const lookup = new Map(allResults.map((res) => [res.coffeeId, res.remainingWeight]));

	return (coffeeId) => {
		const remainingWeight = lookup.get(coffeeId);
		if (remainingWeight === undefined) {
			error(404, 'Not found');
		}
		return remainingWeight;
	};
});
