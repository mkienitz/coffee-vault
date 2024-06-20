import { db } from '$lib/db';
import type { CoffeeWithDoses } from '$lib/schemas';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		coffees: (await db.query.coffees.findMany({
			with: {
				doses: true
			}
		})) as CoffeeWithDoses[]
	};
};
