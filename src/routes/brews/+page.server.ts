import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		brews: await db.query.brews.findMany({ with: { coffee: true } })
	};
};
