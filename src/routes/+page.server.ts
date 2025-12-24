import { db } from '$lib/server/db';
import type { Dose } from '$lib/zod-schemas';
import type { PageServerLoad } from './$types';
import { first } from 'radash';

export const load: PageServerLoad = async () => {
	const coffees = (
		await db.query.coffees.findMany({
			with: {
				doses: true,
				brews: true
			},
			orderBy: (coffees, { desc }) => [desc(coffees.roastingDate)]
		})
	).map(({ doses, brews, ...coffee }) => ({
		...coffee,
		firstDose: first(doses) as Dose,
		dosesRemaining: doses.length,
		dosesBrewed: brews.length
	}));
	return {
		coffees
	};
};
