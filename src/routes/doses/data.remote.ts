import { query } from '$app/server';
import { db } from '$lib/server/db';
import { group, sum, unique } from 'radash';

export const getDoseOverviewData = query(async () => {
	const allDoses = await db.query.doses.findMany({
		columns: {
			creationDate: false
		}
	});
	return {
		dosesByDrawer: group(allDoses, (dose) => dose.drawer),
		totalCoffees: unique(allDoses.map((dose) => dose.coffeeId)).length,
		totalDoses: allDoses.filter((dose) => dose.coffeeId !== null).length,
		totalWeight: sum(allDoses, (dose) => dose.weight ?? 0)
	};
});
