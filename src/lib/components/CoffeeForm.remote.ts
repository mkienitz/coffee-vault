import { resolve } from '$app/paths';
import { form } from '$app/server';
import { db } from '$lib/server/db';
import { coffees } from '$lib/server/db/schema';
import { coffeeSelectDbSchema, coffeeUpdateDbSchema } from '$lib/server/validation';
import { coffeeManagementSchema } from '$lib/validation';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

export const manageCoffee = form(coffeeManagementSchema, async ({ mode, ...coffee }) => {
	if (mode === 'update' && coffee.id !== undefined) {
		// Update coffee
		const dbData = v.parse(coffeeUpdateDbSchema, coffee);
		const [result] = await db
			.update(coffees)
			.set(dbData)
			.where(eq(coffees.id, coffee.id))
			.returning();
		if (!result) {
			error(400, 'Bad request');
		}
	} else if (mode === 'create' && coffee.id === undefined) {
		// Create coffee
		const [result] = await db.insert(coffees).values(coffee).returning();
		if (!result) {
			error(400, 'Bad request');
		}
		// Convert null → undefined and validate with domain schema
		const newCoffee = v.parse(coffeeSelectDbSchema, result);
		redirect(303, resolve(`/coffees/${newCoffee.id}`));
	} else if (mode === 'delete' && coffee.id !== undefined) {
		// Delete coffee
		await db.transaction(async (tx) => {
			const dbData = await tx.query.coffees.findFirst({
				where: eq(coffees.id, coffee.id!),
				columns: {
					id: true
				},
				with: {
					doses: {
						columns: {
							tubeNumber: true,
							drawer: true
						}
					},
					brews: {
						columns: {
							id: true
						}
					},
					bags: {
						columns: {
							id: true
						}
					}
				}
			});

			if (!dbData) {
				error(404, 'Not found');
			}
			// Check dependent data
			if (dbData.doses.length > 0) {
				error(400, 'Coffee has active doses');
			}
			// TODO: on delete cascade?
			if (dbData.brews.length > 0) {
				error(400, 'Coffee has existing brews');
			}
			if (dbData.bags.length > 0) {
				error(400, 'Coffee has active bags');
			}
			// Safe to delete
			await tx.delete(coffees).where(eq(coffees.id, coffee.id!));
		});
		redirect(303, resolve('/'));
	} else {
		error(400, 'Bad request');
	}
});
