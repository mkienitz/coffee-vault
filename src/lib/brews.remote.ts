import { query } from '$app/server';
import { db } from '#lib/server/db/index.js';
import { coffees } from '#lib/server/db/schema.js';
import { brewSelectDbSchema } from '#lib/server/validation.js';
import { error } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
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
				},
				orderBy: (brews, { desc }) => [
					desc(sql`julianday(${brews.consumptionDate})`),
					desc(brews.id)
				]
			}
		}
	});
	if (!coffee) {
		error(404, 'Not found');
	}
	return coffee.brews.map((brew) => v.parse(brewSelectDbSchema, brew));
});
