import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import type { Dose } from '$lib/zod-schemas';
import { group, unique } from 'radash';

export const load: PageServerLoad = async () => {
	const allDoses = (await db.query.doses.findMany()) as Dose[];
	return {
		dosesByDrawer: group(allDoses, (dose) => dose.drawer),
		totalCoffees: unique(allDoses.map((dose) => dose.coffeeId)).length,
		totalDoses: allDoses.filter((dose) => dose.coffeeId !== null).length,
		totalWeight: allDoses.reduce((acc, dose) => acc + dose.weight, 0)
	};
};
