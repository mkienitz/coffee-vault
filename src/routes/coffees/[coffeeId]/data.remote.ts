import { resolve } from '$app/paths';
import { form, query } from '$app/server';
import { db } from '$lib/server/db';
import { brews, coffees, doses, freeFormDoses } from '$lib/server/db/schema';
import { getCurrentDateTime } from '$lib/utils';
import {
	doseManagementSchema,
	doseCreationSchema,
	doseSchema,
	freeFormDoseDeletionSchema,
	freeFormDoseCreationSchema
} from '$lib/validation';
import { error, redirect } from '@sveltejs/kit';
import { and, eq, inArray, isNotNull, isNull } from 'drizzle-orm';
import { sum } from 'radash';
import * as v from 'valibot';

// FREE-FORM DOSES
export const getFreeFormDoses = query(v.number(), async (coffeeId) => {
	const res = await db.query.coffees.findFirst({
		where: eq(coffees.id, coffeeId),
		columns: {
			id: true
		},
		with: {
			freeFormDoses: true
		}
	});
	if (!res) {
		error(404, 'Not found');
	}
	return res.freeFormDoses;
});

export const deleteFreeFormDose = form(freeFormDoseDeletionSchema, async ({ id }) => {
	const res = await db.delete(freeFormDoses).where(eq(freeFormDoses.id, id)).returning();
	if (res.length !== 1) {
		error(404, 'Not found');
	}
	// Update dependencies
	const { coffeeId } = res[0];
	await getCoffeeLeftToDose(coffeeId).refresh();
	await getFreeFormDoses(coffeeId).refresh();
});

export const createFreeFormDose = form(freeFormDoseCreationSchema, async ({ weight, coffeeId }) => {
	const coffee = db.query.coffees.findFirst({ where: eq(coffees.id, coffeeId) });
	if (!coffee) {
		error(404, 'Not found');
	}
	const leftToDose = await getCoffeeLeftToDose(coffeeId);
	if (weight > leftToDose) {
		error(400, 'Not enough coffee left');
	}
	await db.insert(freeFormDoses).values({ weight, coffeeId });

	// Update dependencies
	getCoffeeLeftToDose(coffeeId).set(leftToDose - weight);
	await getFreeFormDoses(coffeeId).refresh();
});

// DOSES
export const getDoses = query(v.number(), async (coffeeId) => {
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
	return coffee.doses.map((dose) => v.parse(doseSchema, dose));
});

export const createDose = form(doseCreationSchema, async ({ weight, coffeeId }) => {
	const newLeftToDose = await db.transaction(async (tx) => {
		// Get coffee
		const coffee = await tx.query.coffees.findFirst({
			where: eq(coffees.id, coffeeId),
			columns: {
				id: true,
				weight: true
			},
			with: {
				doses: true,
				freeFormDoses: true,
				brews: true
			}
		});
		if (!coffee) {
			error(404, 'Not found');
		}
		// Check if enough coffee is left
		// We need transactional safety here and can't use getRemainingWeight()
		const brewed = coffee.brews.reduce((acc, brew) => acc + brew.weight, 0);
		const dosed = coffee.doses.reduce((acc, dose) => acc + dose.weight!, 0);
		const freeDosed = coffee.freeFormDoses.reduce((acc, dose) => acc + dose.weight, 0);
		const coffeeLeftToDose = coffee.weight - brewed - dosed - freeDosed;
		if (weight > coffeeLeftToDose) {
			// TODO: proper error and toast
			error(400, 'Not enough coffee left');
		}
		// Find first empty dose (within transaction for safety)
		const dose = await tx.query.doses.findFirst({
			where: isNull(doses.coffeeId)
		});
		if (!dose) {
			error(404, 'Not found');
		}
		// Update first empty dose
		await tx
			.update(doses)
			.set({ weight, creationDate: getCurrentDateTime(), coffeeId: coffee.id })
			.where(and(eq(doses.drawer, dose.drawer), eq(doses.tubeNumber, dose.tubeNumber)));
		return coffeeLeftToDose - weight;
	});

	// Update dependencies
	getCoffeeLeftToDose(coffeeId).set(newLeftToDose);
	// TODO: can we make the server only send the newly created dose?
	await getDoses(coffeeId).refresh();
	await getFreeDoseId().refresh();
	await getNextDose(coffeeId).refresh();
});

export const clearDose = form(doseManagementSchema, async ({ drawer, tubeNumber }) => {
	const affectedCoffeeId = await db.transaction(async (tx) => {
		const rowFilter = and(
			eq(doses.drawer, drawer),
			eq(doses.tubeNumber, tubeNumber),
			isNotNull(doses.coffeeId),
			// The following two are technically optional
			isNotNull(doses.weight),
			isNotNull(doses.creationDate)
		);
		const dose = await tx.query.doses.findFirst({ where: rowFilter });
		if (!dose) {
			error(404, 'Not found');
		}
		await tx
			.update(doses)
			.set({ weight: null, creationDate: null, coffeeId: null })
			.where(rowFilter);
		return dose.coffeeId!;
	});

	// Update dependencies
	await getDoses(affectedCoffeeId).refresh();
	await getCoffeeLeftToDose(affectedCoffeeId).refresh();
	await getFreeDoseId().refresh();
	await getNextDose(affectedCoffeeId).refresh();
});

export const consumeDose = form(doseManagementSchema, async ({ drawer, tubeNumber }) => {
	const affectedCoffeeId = await db.transaction(async (tx) => {
		const rowFilter = and(eq(doses.drawer, drawer), eq(doses.tubeNumber, tubeNumber));
		const dose = await tx.query.doses.findFirst({
			where: rowFilter
		});
		if (!dose) {
			error(404, 'Not found');
		}
		if (!dose.coffeeId || !dose.weight) {
			error(400, 'Tube already empty');
		}
		// Clear the dose
		await tx
			.update(doses)
			.set({ weight: null, creationDate: null, coffeeId: null })
			.where(rowFilter);
		// Create brew record
		type NewBrew = typeof brews.$inferInsert;
		await tx.insert(brews).values({
			coffeeId: dose.coffeeId,
			weight: dose.weight,
			consumptionDate: getCurrentDateTime()
		} satisfies NewBrew);
		return dose.coffeeId;
	});

	// Update dependencies
	await getDoses(affectedCoffeeId).refresh();
	await getCoffeeLeftToDose(affectedCoffeeId).refresh();
	await getFreeDoseId().refresh();
	await getNextDose(affectedCoffeeId).refresh();
	redirect(303, resolve(`/coffees/${affectedCoffeeId}`));
});

export const getFreeDoseId = query(async () => {
	const dose = await db.query.doses.findFirst({
		columns: {
			drawer: true,
			tubeNumber: true
		},
		where: isNull(doses.coffeeId)
	});
	if (!dose) {
		return null;
	}
	return `${dose.drawer}${dose.tubeNumber}`;
});

export const getNextDose = query(v.number(), async (coffeeId) => {
	const dose = await db.query.doses.findFirst({
		where: eq(doses.coffeeId, coffeeId),
		columns: {
			drawer: true,
			tubeNumber: true
		}
	});
	return dose;
});

// COMMON
export const getCoffeeLeftToDose = query(v.number(), async (coffeeId) => {
	const coffee = await db.query.coffees.findFirst({
		where: eq(coffees.id, coffeeId),
		columns: {
			weight: true
		},
		with: {
			doses: {
				columns: {
					weight: true
				}
			},
			freeFormDoses: {
				columns: {
					weight: true
				}
			},
			brews: {
				columns: {
					weight: true
				}
			}
		}
	});
	if (!coffee) {
		error(404, 'Not found');
	}
	const { weight, doses, freeFormDoses, brews } = coffee;
	return (
		weight -
		(sum(doses, (dose) => dose.weight!) +
			sum(freeFormDoses, (dose) => dose.weight) +
			sum(brews, (brew) => brew.weight))
	);
});

export const getRemainingWeight = query.batch(v.number(), async (coffeeIds) => {
	const allResults = (
		await db.query.coffees.findMany({
			where: inArray(coffees.id, coffeeIds),
			columns: {
				id: true,
				weight: true
			},
			with: {
				brews: {
					columns: {
						weight: true
					}
				}
			}
		})
	).map(({ id, weight, brews }) => {
		return {
			coffeeId: id,
			remainingWeight: weight - sum(brews, (brew) => brew.weight)
		};
	});

	const lookup = new Map(allResults.map((res) => [res.coffeeId, res.remainingWeight]));

	return (coffeeId) => {
		const remainingWeight = lookup.get(coffeeId);
		if (remainingWeight === undefined) {
			error(404, 'Not found 10');
		}
		return remainingWeight;
	};
});

// BREWS
export const getBrews = query(v.number(), async (coffeeId) => {
	const coffee = await db.query.coffees.findFirst({
		where: eq(coffees.id, coffeeId),
		columns: {
			id: true
		},
		with: {
			brews: {
				columns: {
					id: true,
					weight: true,
					consumptionDate: true
				}
			}
		}
	});
	if (!coffee) {
		error(404, 'Not found');
	}
	return coffee.brews;
});
