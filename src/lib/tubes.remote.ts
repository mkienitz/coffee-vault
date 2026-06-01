import { resolve } from '$app/paths';
import { form, query } from '$app/server';
import { db } from '$lib/server/db';
import { brews, coffees, doses } from '$lib/server/db/schema';
import { getUndosedWeight, getRemainingWeight } from '$lib/inventory.remote';
import { getBrews } from '$lib/brews.remote';
import { getUndosedWeight as calculateUndosedWeight } from '$lib/server/inventory';
import { doseSelectDbSchema } from '$lib/server/validation';
import { getCurrentDateTime } from '$lib/utils';
import { doseManagementSchema, doseCreationSchema } from '$lib/validation';
import { error, redirect } from '@sveltejs/kit';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import * as v from 'valibot';

export const getTubes = query(v.number(), async (coffeeId) => {
	const coffee = await db.query.coffees.findFirst({
		where: eq(coffees.id, coffeeId),
		columns: {
			id: true
		},
		with: {
			doses: true
		}
	});
	if (!coffee) {
		error(404, 'Not found');
	}
	return coffee.doses.map((tube) => v.parse(doseSelectDbSchema, tube));
});

export const createTube = form(doseCreationSchema, async ({ weight, coffeeId }) => {
	const newUndosedWeight = await db.transaction(async (tx) => {
		const coffee = await tx.query.coffees.findFirst({
			where: eq(coffees.id, coffeeId),
			columns: {
				id: true,
				weight: true
			},
			with: {
				doses: true,
				bags: true,
				brews: true
			}
		});
		if (!coffee) {
			error(404, 'Not found');
		}

		const undosedWeight = calculateUndosedWeight({
			weight: coffee.weight,
			tubes: coffee.doses,
			bags: coffee.bags,
			brews: coffee.brews
		});
		if (weight > undosedWeight) {
			error(400, 'Not enough coffee left');
		}

		const tube = await tx.query.doses.findFirst({
			where: isNull(doses.coffeeId)
		});
		if (!tube) {
			error(404, 'Not found');
		}

		await tx
			.update(doses)
			.set({ weight, creationDate: getCurrentDateTime(), coffeeId: coffee.id })
			.where(and(eq(doses.drawer, tube.drawer), eq(doses.tubeNumber, tube.tubeNumber)));
		return undosedWeight - weight;
	});

	getUndosedWeight(coffeeId).set(newUndosedWeight);
	await getTubes(coffeeId).refresh();
	await getFirstEmptyTubeId().refresh();
	await getNextTube(coffeeId).refresh();
});

export const clearTube = form(doseManagementSchema, async ({ drawer, tubeNumber }) => {
	const affectedCoffeeId = await db.transaction(async (tx) => {
		const rowFilter = and(
			eq(doses.drawer, drawer),
			eq(doses.tubeNumber, tubeNumber),
			isNotNull(doses.coffeeId),
			isNotNull(doses.weight),
			isNotNull(doses.creationDate)
		);
		const tube = await tx.query.doses.findFirst({ where: rowFilter });
		if (!tube) {
			error(404, 'Not found');
		}
		await tx
			.update(doses)
			.set({ weight: null, creationDate: null, coffeeId: null })
			.where(rowFilter);
		return tube.coffeeId!;
	});

	const currentUndosedWeight = await getUndosedWeight(affectedCoffeeId);
	getUndosedWeight(affectedCoffeeId).set(currentUndosedWeight);
	await getTubes(affectedCoffeeId).refresh();
	await getFirstEmptyTubeId().refresh();
	await getNextTube(affectedCoffeeId).refresh();
});

export const consumeTube = form(doseManagementSchema, async ({ drawer, tubeNumber }) => {
	const affectedCoffeeId = await db.transaction(async (tx) => {
		const rowFilter = and(eq(doses.drawer, drawer), eq(doses.tubeNumber, tubeNumber));
		const tube = await tx.query.doses.findFirst({
			where: rowFilter
		});
		if (!tube) {
			error(404, 'Not found');
		}
		if (!tube.coffeeId || !tube.weight) {
			error(400, 'Tube already empty');
		}

		await tx
			.update(doses)
			.set({ weight: null, creationDate: null, coffeeId: null })
			.where(rowFilter);
		await tx.insert(brews).values({
			coffeeId: tube.coffeeId,
			weight: tube.weight,
			consumptionDate: getCurrentDateTime()
		});
		return tube.coffeeId;
	});

	await getTubes(affectedCoffeeId).refresh();
	await getUndosedWeight(affectedCoffeeId).refresh();
	await getRemainingWeight(affectedCoffeeId).refresh();
	await getFirstEmptyTubeId().refresh();
	await getNextTube(affectedCoffeeId).refresh();
	await getBrews(affectedCoffeeId).refresh();
	redirect(303, resolve(`/coffees/${affectedCoffeeId}`));
});

export const getFirstEmptyTubeId = query(async () => {
	const tube = await db.query.doses.findFirst({
		columns: {
			drawer: true,
			tubeNumber: true
		},
		where: isNull(doses.coffeeId)
	});
	if (!tube) {
		return null;
	}
	return `${tube.drawer}${tube.tubeNumber}`;
});

export const getNextTube = query(v.number(), async (coffeeId) => {
	return await db.query.doses.findFirst({
		where: eq(doses.coffeeId, coffeeId),
		columns: {
			drawer: true,
			tubeNumber: true
		}
	});
});
