import { and, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db';
import { coffees, doses } from '$lib/db/schema';
import type { Drawer, TubeNumber, Dose } from '$lib/zod-schemas';

export const load: PageServerLoad = async ({ params }) => {
	const tubeName: string = params.doseId;

	if (tubeName.length != 2) {
		throw error(400, 'Invalid tube identifier');
	}
	const drawer = tubeName.at(0)!.toUpperCase();
	const tubeNumber = tubeName.at(1)!;
	const dose = await db.query.doses.findFirst({
		where: and(eq(doses.drawer, drawer as Drawer), eq(doses.tubeNumber, tubeNumber as TubeNumber))
	});
	if (!dose) {
		throw error(404, 'Dose with token not found.');
	}
	const coffee = await db.query.coffees.findFirst({
		where: eq(coffees.id, dose.coffeeId!),
		with: { doses: true, brews: true }
	});
	return {
		coffee,
		dose: dose as Dose
	};
};
