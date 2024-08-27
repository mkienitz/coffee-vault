import { db } from '$lib/db';
import type { CoffeeWithDoses } from '$lib/schemas';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	return {
		coffees: (await db.query.coffees.findMany({
			with: {
				doses: true
			}
		})) as CoffeeWithDoses[],
		page: Math.max(1, Number(url.searchParams.get('page')) || 1)
	};
};
