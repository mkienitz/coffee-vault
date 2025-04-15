import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/db';
import { coffees } from '$lib/db/schema';
import { coffeeSchema } from '$lib/zod-schemas';

export const POST: RequestHandler = async ({ request }) => {
	const bqData = await request.json();
	const beans = bqData.BEANS;
	for (const bean of beans) {
		const { farm, farmer, variety, country, elevation, processing, region }: any =
			bean.bean_information[0];
		const { weight, note, roastingDate, roaster, name, aromatics } = bean;
		const coffee: any = {
			country,
			elevation,
			farm,
			flavorProfile: aromatics,
			name,
			notes: note,
			process: processing,
			producer: farmer,
			region,
			roaster,
			roastingDate: roastingDate.substring(0, 10),
			varietals: variety,
			weight
		};
		for (const key in coffee) {
			if (coffee[key] === undefined) {
				coffee[key] = '';
			}
		}
		const res = await coffeeSchema.safeParseAsync(coffee);
		if (!res.success) {
			console.error(coffee);
			console.error(res.error);
			continue;
		}
		await db.insert(coffees).values(res.data);
	}
	return new Response();
};
