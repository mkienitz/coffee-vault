import { query } from '$app/server';
import { db } from '$lib/server/db';
import { coffees } from '$lib/server/db/schema';
import { brewSelectDbSchema } from '$lib/server/validation';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

export const getBrews = query(v.number(), async (coffeeId) => {
	const coffee = await db.query.coffees.findFirst({
		where: eq(coffees.id, coffeeId),
		columns: {
			id: true
		},
		with: {
			brews: {
				columns: {
					id: true,
					coffeeId: true,
					weight: true,
					consumptionDate: true
				}
			}
		}
	});
	if (!coffee) {
		error(404, 'Not found');
	}
	return coffee.brews.map((brew) => v.parse(brewSelectDbSchema, brew));
});
