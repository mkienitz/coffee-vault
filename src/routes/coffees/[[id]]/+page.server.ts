import { coffees, db } from '$lib/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import { coffeeSchema } from '$lib/schemas';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { countries } from 'countries-list';

export const load: PageServerLoad = async ({ params }) => {
	const coffee = await db.query.coffees.findFirst({ where: eq(coffees.id, Number(params.id)) });

	if (params.id && !coffee) {
		throw error(404, 'Coffe not found.');
	}

	const form = await superValidate(coffee, zod(coffeeSchema));
	return {
		form,
		coffees: await db.query.coffees.findMany(),
		countryNames: Object.values(countries).map((country) => {
			return {
				value: country.name,
				label: country.name
			};
		})
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(coffeeSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		if (!form.data.id) {
			// CREATE
			await db.insert(coffees).values(form.data);
			return redirect(303, '/');
		} else {
			if (formData.has('delete')) {
				// DELETE
				await db.delete(coffees).where(eq(coffees.id, form.data.id));
				return redirect(303, '/');
			} else {
				// UPDATE
				await db.update(coffees).set(form.data).where(eq(coffees.id, form.data.id));
				return message(form, 'Coffee updated!');
			}
		}
	}
};
