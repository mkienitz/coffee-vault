import { addDose, clearDose, consumeDose, getCoffeeWithDosesAndBrews } from '$lib/server/db';
import { error, fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { setFlash } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import { doseCreationSchema, doseManagementSchema } from '$lib/zod-schemas';

export const load: PageServerLoad = async ({ params }) => {
	const coffee = await getCoffeeWithDosesAndBrews(Number(params.coffeeId));
	if (!coffee) {
		throw error(404, 'Coffee not found');
	}
	return {
		coffee: coffee!,
		creationForm: await superValidate({ weight: 12 }, zod(doseCreationSchema)),
		managementForm: await superValidate(undefined, zod(doseManagementSchema))
	};
};

export const actions: Actions = {
	add: async ({ request, cookies, params }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(doseCreationSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		const { success, error } = await addDose(Number(params.coffeeId), form.data.weight);
		if (!success) {
			setFlash({ type: 'error', message: error! }, cookies);
			return fail(400, {
				form
			});
		}
		return { form };
	},
	consume: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(doseManagementSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		await consumeDose(form.data);
		return { form };
	},
	delete: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(doseManagementSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		await clearDose(form.data);
		return { form };
	}
};
