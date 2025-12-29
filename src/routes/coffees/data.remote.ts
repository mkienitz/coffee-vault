import { query } from '$app/server';
import { db } from '$lib/server/db';

export const getData = query(async () => {
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
	return tableEntries;
});
