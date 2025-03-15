import { db } from '$lib/db';
import { and, eq, isNull } from 'drizzle-orm';
import { error, fail, type Actions } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { setFlash } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import { brews, coffees, doses } from '$lib/db/schema';
import { doseCreationSchema, doseManagementSchema } from '$lib/zod-schemas';
import { getCurrentDateTime } from '$lib/utils';

export const load: PageServerLoad = async ({ params }) => {
	const coffee = await db.query.coffees.findFirst({
		where: eq(coffees.id, Number(params.coffeeId)),
		with: {
			doses: true,
			brews: true
		}
	});

	if (!coffee) {
		throw error(404, 'Coffe not found. Cannot show doses.');
	}

	const creationForm = await superValidate({ weight: 12 }, zod(doseCreationSchema));
	const managementForm = await superValidate(undefined, zod(doseManagementSchema));

	return {
		creationForm,
		managementForm,
		coffee
	};
};

export const actions: Actions = {
	add: async ({ request, cookies, params }) => {
		// Validate dose data
		const formData = await request.formData();
		const form = await superValidate(formData, zod(doseCreationSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		// Make sure there is an empty tube available
		const emptyTube = await db.query.doses.findFirst({
			where: isNull(doses.coffeeId)
		});
		if (!emptyTube) {
			setFlash({ type: 'error', message: 'No empty tube available' }, cookies);
			return fail(400, {
				form
			});
		}

		const coffee = await db.query.coffees.findFirst({
			where: eq(coffees.id, Number(params.coffeeId)),
			with: {
				doses: true,
				brews: true
			}
		});
		// TODO: neccessary?
		if (!coffee) {
			throw error(404, 'Coffee not found. Cannot show doses.');
		}

		// Make sure there is enough coffee left to dose
		const brewed = coffee.brews.reduce((acc, brew) => acc + brew.weight, 0);
		const dosed = coffee.doses.reduce((acc, dose) => acc + dose.weight!, 0);
		const remainingCoffee = coffee.weight - brewed - dosed;
		if (form.data.weight > remainingCoffee) {
			setFlash({ type: 'error', message: 'Not enough coffee left to create new dose' }, cookies);
			return fail(400, {
				form
			});
		}

		await db
			.update(doses)
			.set({ coffeeId: coffee.id, weight: form.data.weight, creationDate: getCurrentDateTime() })
			.where(and(eq(doses.drawer, emptyTube.drawer!), eq(doses.tubeNumber, emptyTube.tubeNumber!)));

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
		const dose = await db.query.doses.findFirst({
			where: and(eq(doses.drawer, form.data.drawer), eq(doses.tubeNumber, form.data.tubeNumber))
		});
		if (!dose || !dose.weight || !dose.coffeeId || !dose.creationDate) {
			return fail(400, {
				form
			});
		}
		await db.transaction(async (tx) => {
			// Create brew
			await tx.insert(brews).values({
				coffeeId: dose.coffeeId!,
				weight: dose.weight!,
				consumptionDate: getCurrentDateTime()
			});
			// Delete dose
			await tx
				.update(doses)
				.set({ weight: null, creationDate: null, coffeeId: null })
				.where(and(eq(doses.drawer, form.data.drawer), eq(doses.tubeNumber, form.data.tubeNumber)));
		});
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
		await db
			.update(doses)
			.set({ weight: null, creationDate: null, coffeeId: null })
			.where(and(eq(doses.drawer, form.data.drawer), eq(doses.tubeNumber, form.data.tubeNumber)));
		return { form };
	}
};
