import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/libsql';
import { brews, brewsRelations, coffees, coffeesRelations, doses, dosesRelations } from './schema';
import {
	coffeeSchema,
	coffeeInsertionSchema,
	doseSchema,
	brewSchema,
	type Coffee,
	type CoffeeWithDosesAndBrews,
	type Dose,
	type DoseIdentifier,
	type EmptyDose
} from '$lib/zod-schemas';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { getCurrentDateTime } from '$lib/utils';

export const db = drizzle({
	connection: {
		url: `file:${env.COFFEE_VAULT_DB_PATH}`
	},
	schema: { coffees, coffeesRelations, doses, dosesRelations, brews, brewsRelations }
});

// COFFEES
export async function createCoffee(data: unknown): Promise<Coffee> {
	const validated = coffeeInsertionSchema.parse(data);
	const [result] = await db.insert(coffees).values(validated).returning();
	if (!result) {
		throw new Error('Failed to create coffee');
	}
	return coffeeSchema.parse(result);
}

export async function getCoffee(coffeeId: number): Promise<Coffee | undefined> {
	const result = await db.query.coffees.findFirst({
		where: eq(coffees.id, coffeeId)
	});
	if (!result) {
		return undefined;
	}
	return coffeeSchema.parse(result);
}

export async function updateCoffee(coffeeId: number, data: unknown): Promise<Coffee> {
	const validated = coffeeInsertionSchema.parse(data);
	const [result] = await db
		.update(coffees)
		.set(validated)
		.where(eq(coffees.id, coffeeId))
		.returning();
	if (!result) {
		throw new Error('Failed to update coffee');
	}
	return coffeeSchema.parse(result);
}

export async function deleteCoffee(coffeeId: number): Promise<void> {
	await db.delete(coffees).where(eq(coffees.id, coffeeId));
}

export async function getCoffeeWithDosesAndBrews(
	coffeeId: number
): Promise<CoffeeWithDosesAndBrews | undefined> {
	const coffee = await db.query.coffees.findFirst({
		where: eq(coffees.id, coffeeId),
		with: {
			doses: true,
			brews: true
		}
	})!;
	if (!coffee) {
		return undefined;
	}
	// Validate coffee, doses and brews
	const validatedCoffee = coffeeSchema.parse(coffee);
	const validatedDoses = coffee.doses
		.filter((d) => d.coffeeId !== null)
		.map((d) => doseSchema.parse(d));
	const validatedBrews = coffee.brews.map((b) => brewSchema.parse(b));
	return {
		...validatedCoffee,
		doses: validatedDoses,
		brews: validatedBrews
	};
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

export async function getDose(doseIdent: DoseIdentifier): Promise<Dose | EmptyDose> {
	const dose = await db.query.doses.findFirst({
		where: and(eq(doses.drawer, doseIdent.drawer), eq(doses.tubeNumber, doseIdent.tubeNumber))
	});
	if (!dose) {
		throw new Error();
	}
	if (!dose.coffeeId) {
		return dose as EmptyDose;
	}
	return dose as Dose;
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
			throw new Error();
		}
		await clearDoseHelper(tx, doseIdent);
		await tx.insert(brews).values({
			coffeeId: dose.coffeeId!,
			weight: dose.weight!,
			consumptionDate: getCurrentDateTime()
		});
	});
}

type ValidateWeightResult =
	| {
			success: true;
	  }
	| {
			success: false;
			error: string;
	  };

// BREWS
export async function getAllBrewsWithCoffees() {
	const results = await db.query.brews.findMany({ with: { coffee: true } });
	return results.map((brew) => ({
		...brewSchema.parse(brew),
		coffee: coffeeSchema.parse(brew.coffee)
	}));
}

export async function validateCoffeeWeight(
	coffeeId: number,
	newWeight: number
): Promise<ValidateWeightResult> {
	const coffee = await db.query.coffees.findFirst({
		where: eq(coffees.id, coffeeId),
		with: {
			doses: true,
			brews: true
		}
	});

	if (!coffee) {
		return {
			success: false,
			error: 'Coffee not found'
		};
	}

	const brewed = coffee.brews.reduce((acc, brew) => acc + brew.weight, 0);
	const dosed = coffee.doses.reduce((acc, dose) => acc + (dose.weight || 0), 0);
	const usedWeight = brewed + dosed;

	if (newWeight < usedWeight) {
		return {
			success: false,
			error: `Weight must be at least ${usedWeight}g (already used in doses and brews)`
		};
	}

	return {
		success: true
	};
}
