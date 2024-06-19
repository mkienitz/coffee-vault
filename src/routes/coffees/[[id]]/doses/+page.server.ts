import { coffees, db, doses } from '$lib/db';
import { eq } from 'drizzle-orm';
import { error, fail, type Actions } from '@sveltejs/kit';
import { doseSchema } from '$lib/schemas';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect, setFlash } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const coffee = await db.query.coffees.findFirst({
		where: eq(coffees.id, Number(params.id)),
		with: {
			doses: true
		}
	});
	if (!coffee) {
		throw error(404, 'Coffe not found. Cannot show doses.');
	}
	const form = await superValidate({ coffeeId: coffee.id }, zod(doseSchema));
	return {
		form,
		coffee
	};
};

export const actions: Actions = {
	add: async ({ request, cookies }) => {
		const formData = await request.formData();
		console.log(formData);
		const form = await superValidate(formData, zod(doseSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		if (form.data.id) {
			setFlash({ type: 'error', message: 'Dose ID should not be set!' }, cookies);
		} else {
			await db.insert(doses).values(form.data);
		}
		return { form };
	},
	delete: async ({ request }) => {
		const formData = await request.formData();
		console.log(formData);
		const form = await superValidate(formData, zod(doseSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		await db.delete(doses).where(eq(doses.id, form.data.id!));
		return { form };
	}
};
