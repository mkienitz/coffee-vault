import { query } from '$app/server';
import { db } from '#lib/server/db/index.js';
import { coffees } from '#lib/server/db/schema.js';
import { brewSelectDbSchema } from '#lib/server/validation.js';
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
