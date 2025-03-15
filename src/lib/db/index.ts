import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { brews, brewsRelations, coffees, coffeesRelations, doses, dosesRelations } from './schema';
import type { Dose, DoseIdentifier, Drawer, EmptyDose, TubeNumber } from '$lib/zod-schemas';
import { and, eq } from 'drizzle-orm';
import { getCurrentDateTime } from '$lib/utils';

export const db = drizzle({
	client: new Database(env.COFFEE_VAULT_DB_PATH),
	schema: { coffees, coffeesRelations, doses, dosesRelations, brews, brewsRelations }
});

export async function clearDose(dose: DoseIdentifier) {
	await db
		.update(doses)
		.set({ weight: null, creationDate: null, coffeeId: null })
		.where(and(eq(doses.drawer, dose.drawer), eq(doses.tubeNumber, dose.tubeNumber)));
}

export async function consumeDose(dose: Dose) {
	await db.transaction(async (tx) => {
		// Create brew
		await tx.insert(brews).values({
			coffeeId: dose.coffeeId!,
			weight: dose.weight!,
			consumptionDate: getCurrentDateTime()
		});
		// Clear dose
		await tx
			.update(doses)
			.set({ weight: null, creationDate: null, coffeeId: null })
			.where(and(eq(doses.drawer, dose.drawer), eq(doses.tubeNumber, dose.tubeNumber)));
	});
}

export async function getDose(dose: DoseIdentifier): Promise<Dose | EmptyDose | undefined> {
	const res = await db.query.doses.findFirst({
		where: and(eq(doses.drawer, dose.drawer), eq(doses.tubeNumber, dose.tubeNumber))
	});
	if (!res) {
		return undefined;
	}
	if (res.coffeeId && res.creationDate && res.weight) {
		return res as Dose;
	}
	return res as unknown as EmptyDose;
}
