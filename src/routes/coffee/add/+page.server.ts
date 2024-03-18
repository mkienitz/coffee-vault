import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from './schema';
import { countries } from 'countries-list';

export const load: PageServerLoad = async () => {
	const countryNames = Object.values(countries).map((country) => {
		return {
			value: country.name,
			label: country.name
		};
	});
	return {
		form: await superValidate(zod(formSchema)),
		countryNames
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		console.log(form.data);
		return {
			form
		};
	}
};
