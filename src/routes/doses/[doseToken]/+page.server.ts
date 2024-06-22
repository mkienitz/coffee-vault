import { coffees, db, doses } from '$lib/db';
import { eq } from 'drizzle-orm';
import { error, type Actions } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const dose = await db.query.doses.findFirst({
		where: eq(doses.token, params.doseToken)
	});
	if (!dose) {
		throw error(404, 'Dose with token not found.');
	}
	const coffee = await db.query.coffees.findFirst({
		where: eq(coffees.id, dose.coffeeId)
	});
	if (!coffee) {
		throw error(404, 'Coffe for dose not found.');
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
		const res = await db
			.update(doses)
			.set({ consumedOn: time })
			.where(eq(doses.token, params.doseToken!))
			.returning();
		redirect(
			`/coffees/${res[0].coffeeId}/doses`,
			{ type: 'success', message: 'Dose marked as consumed' },
			cookies
		);
	}
};
