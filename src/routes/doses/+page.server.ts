import { db } from '$lib/db';
import type { PageServerLoad } from './$types';
import type { Dose } from '$lib/zod-schemas';
import * as _ from 'radash';

export const load: PageServerLoad = async () => {
	const allDoses = (await db.query.doses.findMany()) as Dose[];
	const totalWeight = allDoses.reduce((acc, dose) => acc + dose.weight, 0);
	return {
		doses: _.group(allDoses, (dose) => dose.drawer),
		totalWeight
	};
};
