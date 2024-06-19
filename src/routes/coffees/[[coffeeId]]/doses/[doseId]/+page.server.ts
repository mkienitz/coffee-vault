import { coffees, db, doses } from '$lib/db';
import { eq } from 'drizzle-orm';
import { error, type Actions } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const coffee = await db.query.coffees.findFirst({
		where: eq(coffees.id, Number(params.coffeeId))
	});
	if (!coffee) {
		throw error(404, 'Coffe not found. Cannot show doses.');
	}
	const dose = await db.query.doses.findFirst({
		where: eq(doses.id, Number(params.doseId))
	});
	if (!dose) {
		throw error(404, 'Dose does not exist.');
	}
	return {
		coffee,
		dose
	};
};

export const actions: Actions = {
	consume: async ({ params, cookies }) => {
		const time = new Intl.DateTimeFormat('en-DE', {
			timeStyle: 'short',
			dateStyle: 'short'
		}).format(Date.now());
		await db
			.update(doses)
			.set({ consumedOn: time })
			.where(eq(doses.id, Number(params.doseId)));
		redirect('./', { type: 'success', message: 'Dose marked as consumed' }, cookies);
	}
};
