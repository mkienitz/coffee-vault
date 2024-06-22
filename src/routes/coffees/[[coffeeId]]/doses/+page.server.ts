import { coffees, db, doses } from '$lib/db';
import { and, eq } from 'drizzle-orm';
import { error, fail, type Actions } from '@sveltejs/kit';
import { doseSchema, type CoffeeWithDoses } from '$lib/schemas';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { setFlash } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import { printQRCodes } from '$lib/print';

export const load: PageServerLoad = async ({ params }) => {
	const coffee = await db.query.coffees.findFirst({
		where: eq(coffees.id, Number(params.coffeeId)),
		with: {
			doses: true
		}
	});
	if (!coffee) {
		throw error(404, 'Coffe not found. Cannot show doses.');
	}
	const form = await superValidate({ coffeeId: coffee.id, weight: 12 }, zod(doseSchema));
	return {
		form,
		coffee: coffee as CoffeeWithDoses
	};
};

export const actions: Actions = {
	add: async ({ request, cookies, params }) => {
		// Validate dose data
		const formData = await request.formData();
		const form = await superValidate(formData, zod(doseSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		// We don't want edit capability -> fresh IDs
		if (form.data.id) {
			setFlash({ type: 'success', message: 'Dose ID should not be set!' }, cookies);
			return fail(400, {
				form
			});
		}
		// Make sure there is enough coffee left to dose
		const coffee = await db.query.coffees.findFirst({
			where: eq(coffees.id, Number(params.coffeeId)),
			with: {
				doses: true
			}
		});
		if (!coffee) {
			throw error(404, 'Coffe not found. Cannot show doses.');
		}
		const dosed = coffee.doses.map((dose) => dose.weight).reduce((a, b) => a + b, 0);
		const undosed = coffee.weight - dosed;
		if (form.data.weight > undosed) {
			setFlash({ type: 'error', message: 'Not enough coffee left to create new dose' }, cookies);
			return fail(400, {
				form
			});
		}
		await db.insert(doses).values(form.data);
		return { form };
	},
	consume: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(doseSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		const time = new Intl.DateTimeFormat('en-DE', {
			timeStyle: 'short',
			dateStyle: 'short'
		}).format(Date.now());

		await db.update(doses).set({ consumedOn: time }).where(eq(doses.id, form.data.id!));
		return { form };
	},
	delete: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(doseSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		await db.delete(doses).where(eq(doses.id, form.data.id!));
		return { form };
	},
	print: async ({ request }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(doseSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		const res = await db
			.update(doses)
			.set({ printed: true })
			.where(eq(doses.id, form.data.id!))
			.returning({ token: doses.token });
		printQRCodes(res.map((t) => t.token));
		return { form };
	},
	printAll: async ({ request, params }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(doseSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		const res = await db
			.update(doses)
			.set({ printed: true })
			.where(and(eq(doses.coffeeId, Number(params.coffeeId)), eq(doses.printed, false)))
			.returning({
				token: doses.token
			});
		printQRCodes(res.map((t) => t.token));
		return { form };
	}
};
