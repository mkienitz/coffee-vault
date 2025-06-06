import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const tableEntries = (
		await db.query.coffees.findMany({
			with: {
				doses: true,
				brews: true
			}
		})
	).map(({ doses, brews, ...coffee }) => ({
		...coffee,
		dosesRemaining: doses.length,
		dosesBrewed: brews.length
	}));
	return {
		tableEntries
	};
};
