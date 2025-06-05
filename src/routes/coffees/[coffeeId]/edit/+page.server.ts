import { coffees } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { error, fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect, setFlash } from 'sveltekit-flash-message/server';
import { coffeeSchema } from '$lib/zod-schemas';

export const load: PageServerLoad = async ({ params }) => {
	const coffee = await db.query.coffees.findFirst({
		where: eq(coffees.id, Number(params.coffeeId))
	});

	if (params.coffeeId && !coffee) {
		throw error(404, 'Coffe not found.');
	}

	return {
		form: await superValidate(coffee, zod(coffeeSchema))
	};
};

export const actions: Actions = {
	update: async ({ request, cookies, params }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(coffeeSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		await db
			.update(coffees)
			.set(form.data)
			.where(eq(coffees.id, Number(params.coffeeId)));
		setFlash({ type: 'success', message: 'Coffee successfully edited' }, cookies);
		return { form };
	},
	delete: async ({ request, cookies, params }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(coffeeSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		await db.delete(coffees).where(eq(coffees.id, Number(params.coffeeId)));
		redirect('/', { type: 'success', message: 'Coffee successfully deleted' }, cookies);
	}
};
