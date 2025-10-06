import { createCoffee } from '$lib/server/db';
import { fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import { coffeeInsertionSchema } from '$lib/zod-schemas';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(undefined, zod(coffeeInsertionSchema))
	};
};

export const actions: Actions = {
	create: async ({ request, cookies }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(coffeeInsertionSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		const newCoffee = await createCoffee(form.data);
		redirect(
			`/coffees/${newCoffee.id}`,
			{ type: 'success', message: 'Coffee successfully added' },
			cookies
		);
	}
};
