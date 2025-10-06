import { getCoffee, updateCoffee, deleteCoffee, validateCoffeeWeight } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { error, fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { redirect, setFlash } from 'sveltekit-flash-message/server';
import { coffeeInsertionSchema } from '$lib/zod-schemas';

export const load: PageServerLoad = async ({ params }) => {
	const coffee = await getCoffee(Number(params.coffeeId));

	if (params.coffeeId && !coffee) {
		throw error(404, 'Coffe not found.');
	}

	return {
		form: await superValidate(coffee, zod(coffeeInsertionSchema))
	};
};

export const actions: Actions = {
	update: async ({ request, cookies, params }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(coffeeInsertionSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		// Validate weight against existing doses and brews
		const coffeeId = Number(params.coffeeId);
		const validation = await validateCoffeeWeight(coffeeId, form.data.weight);

		if (!validation.success) {
			return fail(400, {
				form: {
					...form,
					errors: {
						weight: [validation.error]
					}
				}
			});
		}

		await updateCoffee(coffeeId, form.data);
		setFlash({ type: 'success', message: 'Coffee successfully edited' }, cookies);
		return { form };
	},
	delete: async ({ request, cookies, params }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(coffeeInsertionSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		const result = await deleteCoffee(Number(params.coffeeId));
		if (!result.success) {
			setFlash({ type: 'error', message: result.error }, cookies);
			return { form };
		}
		redirect('/', { type: 'success', message: 'Coffee successfully deleted' }, cookies);
	}
};
