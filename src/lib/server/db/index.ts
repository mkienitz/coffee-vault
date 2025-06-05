import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/libsql';
import { brews, brewsRelations, coffees, coffeesRelations, doses, dosesRelations } from './schema';
import type { CoffeeWithDosesAndBrews, DoseIdentifier } from '$lib/zod-schemas';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { getCurrentDateTime } from '$lib/utils';

export const db = drizzle({
	connection: {
		url: `file:${env.COFFEE_VAULT_DB_PATH}`
	},
	schema: { coffees, coffeesRelations, doses, dosesRelations, brews, brewsRelations }
});

// COFFEES
export async function getCoffeeWithDosesAndBrews(
	coffeeId: number
): Promise<CoffeeWithDosesAndBrews> {
	const coffee = await db.query.coffees.findFirst({
		where: eq(coffees.id, coffeeId),
		with: {
			doses: true,
			brews: true
		}
	})!;
	if (!coffee) {
		throw new Error();
	}
	return coffee as CoffeeWithDosesAndBrews;
}

// DOSES
type AddDoseResult = {
	success: boolean;
	error: 'Not enough coffee left' | 'No empty tube available' | undefined;
};
export async function addDose(coffeeId: number, weight: number): Promise<AddDoseResult> {
	// Get coffee
	const coffee = await db.query.coffees.findFirst({
		where: eq(coffees.id, coffeeId),
		with: {
			doses: true,
			brews: true
		}
	});
	if (!coffee) {
		throw new Error();
	}
	// Check if enough coffee is left
	const brewed = coffee.brews.reduce((acc, brew) => acc + brew.weight, 0);
	const dosed = coffee.doses.reduce((acc, dose) => acc + dose.weight!, 0);
	const remainingCoffee = coffee.weight - brewed - dosed;
	if (weight > remainingCoffee) {
		return {
			success: false,
			error: 'Not enough coffee left'
		} satisfies AddDoseResult;
	}
	// Find first empty dose
	const dose = await db.query.doses.findFirst({
		where: isNull(doses.coffeeId)
	});
	if (!dose) {
		return {
			success: false,
			error: 'No empty tube available'
		} satisfies AddDoseResult;
	}
	// Update first empty dose
	await db
		.update(doses)
		.set({ weight, creationDate: getCurrentDateTime(), coffeeId: coffee.id })
		.where(and(eq(doses.drawer, dose.drawer), eq(doses.tubeNumber, dose.tubeNumber)));
	return {
		success: true,
		error: undefined
	} satisfies AddDoseResult;
}

type DBHandle = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];
async function clearDoseHelper(dbHandle: DBHandle, doseIdent: DoseIdentifier): Promise<void> {
	const res = await dbHandle
		.update(doses)
		.set({ weight: null, creationDate: null, coffeeId: null })
		.where(
			and(
				eq(doses.drawer, doseIdent.drawer),
				eq(doses.tubeNumber, doseIdent.tubeNumber),
				isNotNull(doses.coffeeId),
				isNotNull(doses.weight),
				isNotNull(doses.creationDate)
			)
		)
		.returning();
	if (res.length !== 1) {
		throw new Error();
	}
}

export async function clearDose(dose: DoseIdentifier): Promise<void> {
	await clearDoseHelper(db, dose);
}

export async function consumeDose(doseIdent: DoseIdentifier): Promise<void> {
	await db.transaction(async (tx) => {
		const dose = await tx.query.doses.findFirst({
			where: and(eq(doses.drawer, doseIdent.drawer), eq(doses.tubeNumber, doseIdent.tubeNumber))
		});
		if (!dose) {
			throw Error();
		}
		await clearDoseHelper(tx, doseIdent);
		await tx.insert(brews).values({
			coffeeId: dose.coffeeId!,
			weight: dose.weight!,
			consumptionDate: getCurrentDateTime()
		});
	});
}
