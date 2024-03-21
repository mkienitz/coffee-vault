import { coffees, db } from '$lib/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { error, fail, type Actions } from '@sveltejs/kit';
import { coffeeSchema } from '$lib/schemas';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { countries } from 'countries-list';
import { redirect, setFlash } from 'sveltekit-flash-message/server';

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
	default: async ({ request, cookies }) => {
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
			redirect('/', { type: 'success', message: 'Coffee successfully added' }, cookies);
		} else {
			if (formData.has('delete')) {
				// DELETE
				await db.delete(coffees).where(eq(coffees.id, form.data.id));
				redirect('/', { type: 'success', message: 'Coffee successfully deleted' }, cookies);
			} else {
				// UPDATE
				await db.update(coffees).set(form.data).where(eq(coffees.id, form.data.id));
				setFlash({ type: 'success', message: 'Coffee successfully edited' }, cookies);
				return { form };
			}
		}
	}
};
