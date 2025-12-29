import { error } from '@sveltejs/kit';
import { query } from '$app/server';
import { db } from '$lib/server/db';
import { coffees, doses } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';

import * as v from 'valibot';
import { coffeeSelectDbSchema } from '$lib/server/validation';
import { drawerLetters, tubeNumbers } from '$lib/constants';
import { type Drawer, type TubeNumber } from '$lib/types';

// DOSES
export const getDose = query(v.string(), async (doseSlug) => {
	const { drawer, tubeNumber } = getDoseIdentFromSlug(doseSlug);
	console.info('getDose invoked...');
	const dose = await db.query.doses.findFirst({
		where: and(eq(doses.drawer, drawer), eq(doses.tubeNumber, tubeNumber))
	});
	if (!dose) {
		error(404, 'Not found');
	}
	return dose;
});

function getDoseIdentFromSlug(slug: string) {
	// TODO: cleanup logic
	const drawerStr = slug.at(0);
	const tubeNumberStr = slug.at(1);
	if (!drawerStr || !tubeNumberStr || slug.length !== 2) {
		throw error(400, 'Invalid tube identifier');
	}
	const drawer = drawerStr.toUpperCase() as Drawer;
	const tubeNumber = tubeNumberStr as TubeNumber;
	if (
		!tubeNumbers.includes(tubeNumber as TubeNumber) ||
		!drawerLetters.includes(drawer as Drawer)
	) {
		throw error(400, 'Invalid tube identifier');
	}
	if (drawerStr.toLowerCase() === drawerStr) {
		console.warn(`ATTENTION: NFC tag for tube ${drawerStr}${tubeNumberStr} might be lower case!`);
	}
	return { drawer, tubeNumber };
}

// COFFEES
export const getAllCoffeeIds = query(async () => {
	return (
		await db.query.coffees.findMany({
			columns: {
				id: true
			},
			orderBy: (coffees, { desc }) => [desc(coffees.roastingDate)]
		})
	).map((coffee) => coffee.id);
});

export const getCoffee = query(v.number(), async (coffeeId) => {
	const coffee = await db.query.coffees.findFirst({
		where: eq(coffees.id, coffeeId)
	});
	if (!coffee) {
		error(404, 'Not found');
	}
	return v.parse(coffeeSelectDbSchema, coffee);
});
