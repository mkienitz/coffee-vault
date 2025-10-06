import { coffees } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 as zod } from 'sveltekit-superforms/adapters';
import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import { coffeeSchema } from '$lib/zod-schemas';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(undefined, zod(coffeeSchema))
	};
};

export const actions: Actions = {
	create: async ({ request, cookies }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(coffeeSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		const newCoffee = (await db.insert(coffees).values(form.data).returning({ id: coffees.id }))[0];
		redirect(
			`/coffees/${newCoffee.id}`,
			{ type: 'success', message: 'Coffee successfully added' },
			cookies
		);
	}
};
