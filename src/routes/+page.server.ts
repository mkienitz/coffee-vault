import { db } from '$lib/db';
import type { PageServerLoad } from './$types';
import { loadFlash } from 'sveltekit-flash-message/server'

export const load: PageServerLoad = loadFlash(async () => {
	return {
		coffees: await db.query.coffees.findMany()
	};
});
