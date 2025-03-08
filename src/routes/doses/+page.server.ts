import { db } from '$lib/db';
import { count, isNull } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { doses } from '$lib/db/schema';

export const load: PageServerLoad = async () => {
	const emptyDoses = await db.select({ count: count() }).from(doses).where(isNull(doses.coffeeId));
	const allDoses = await db.query.doses.findMany();

	return {
		doses: allDoses,
		count: emptyDoses[0].count
	};
};
