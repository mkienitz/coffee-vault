import type { RequestHandler } from '@sveltejs/kit';
// import BQJson from './bq.json'
import { coffees, db } from '$lib/db';

// type BQ = typeof BQJson

export const POST: RequestHandler = async ({ request }) => {
	const bqData = await request.json();
	const beans = bqData.BEANS;
	for (const bean of beans) {
		const { farm, variety, country, elevation, processing, region } = bean.bean_information[0];
		const { weight, note, roastingDate, roaster, name } = bean;
		const coffee = {
			country,
			elevation,
			farm,
			name,
			notes: note,
			process: processing,
			region,
			roaster,
			roastingDate: roastingDate.substring(0, 10),
			varietals: variety,
			weight
		};
		await db.insert(coffees).values(coffee);
	}
	return new Response();
};
