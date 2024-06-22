import { coffees, db, doses } from '$lib/db';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { CoffeeWithDoses } from '$lib/schemas';

export const load: PageServerLoad = async ({ params }) => {
	const dose = await db.query.doses.findFirst({
		where: eq(doses.token, params.doseToken)
	});
	if (!dose) {
		throw error(404, 'Dose with token not found.');
	}
	const coffee = await db.query.coffees.findFirst({
		where: eq(coffees.id, dose.coffeeId),
		with: { doses: true }
	});
	if (!coffee) {
		throw error(404, 'Coffe for dose not found.');
	}
	return {
		coffee: coffee as CoffeeWithDoses,
		dose
	};
};
