import { error, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { consumeDose, getCoffeeWithDosesAndBrews, getDose } from '$lib/server/db';
import {
	drawerLetters,
	tubeNumbers,
	type DoseIdentifier,
	type Drawer,
	type TubeNumber
} from '$lib/zod-schemas';
import { redirect } from 'sveltekit-flash-message/server';

function getDoseIdentFromSlug(slug: string): DoseIdentifier {
	const drawerStr = slug.at(0);
	const tubeNumberStr = slug.at(1);
	if (!drawerStr || !tubeNumberStr || slug.length !== 2) {
		throw error(400, 'Invalid tube identifier');
	}
	let drawer = drawerStr.toUpperCase() as Drawer;
	let tubeNumber = tubeNumberStr as TubeNumber;
	if (!tubeNumbers.includes(tubeNumber) || !drawerLetters.includes(drawer)) {
		throw error(400, 'Invalid tube identifier');
	}
	if (drawerStr!.toLowerCase() === drawerStr!) {
		console.warn(`ATTENTION: NFC tag for tube ${drawerStr}${tubeNumberStr} might be lower case!`);
	}
	return { drawer: drawer, tubeNumber: tubeNumber };
}

export const load: PageServerLoad = async ({ params }) => {
	const doseIdent = getDoseIdentFromSlug(params.doseId);
	const dose = await getDose(doseIdent);
	return {
		coffee: await getCoffeeWithDosesAndBrews(dose.coffeeId!),
		dose
	};
};

export const actions: Actions = {
	consume: async ({ params, cookies }) => {
		const doseIdent = getDoseIdentFromSlug(params.doseId!);
		await consumeDose(doseIdent);
		redirect(`/coffees`, { type: 'success', message: 'Dose marked as consumed' }, cookies);
	}
};
