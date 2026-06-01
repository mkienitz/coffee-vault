import { form, query } from '$app/server';
import { db } from '$lib/server/db';
import { bags, coffees } from '$lib/server/db/schema';
import { getUndosedWeight } from '$lib/inventory.remote';
import { bagSelectDbSchema } from '$lib/server/validation';
import { bagCreationSchema, bagDeletionSchema, bagSchema } from '$lib/validation';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as v from 'valibot';

const bagPrintSchema = v.pick(bagSchema, ['id']);

export const getBags = query(v.number(), async (coffeeId) => {
	const res = await db.query.coffees.findFirst({
		where: eq(coffees.id, coffeeId),
		columns: {
			id: true
		},
		with: {
			bags: true
		}
	});
	if (!res) {
		error(404, 'Not found');
	}
	return res.bags.map((bag) => v.parse(bagSelectDbSchema, bag));
});

export const deleteBag = form(bagDeletionSchema, async ({ id }) => {
	const res = await db.delete(bags).where(eq(bags.id, id)).returning();
	if (res.length !== 1) {
		error(404, 'Not found');
	}

	const { coffeeId } = res[0];
	await getUndosedWeight(coffeeId).refresh();
	await getBags(coffeeId).refresh();
});

export const createBag = form(bagCreationSchema, async ({ weight, coffeeId }) => {
	const coffee = await db.query.coffees.findFirst({ where: eq(coffees.id, coffeeId) });
	if (!coffee) {
		error(404, 'Not found');
	}
	const undosedWeight = await getUndosedWeight(coffeeId);
	if (weight > undosedWeight) {
		error(400, 'Not enough coffee left');
	}
	await db.insert(bags).values({ weight, coffeeId });

	getUndosedWeight(coffeeId).set(undosedWeight - weight);
	await getBags(coffeeId).refresh();
});

export const printBag = form(bagPrintSchema, async ({ id }) => {
	const bag = await db.query.bags.findFirst({
		where: eq(bags.id, id),
		with: {
			coffee: {
				columns: {
					name: true,
					roaster: true
				}
			}
		}
	});
	if (!bag) {
		error(404, 'Not found');
	}
	console.info('Bag print requested', {
		id: bag.id,
		weight: bag.weight,
		coffee: bag.coffee?.name,
		roaster: bag.coffee?.roaster
	});
});
