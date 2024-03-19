import { countries } from 'countries-list';
import { z } from 'zod';

const [c, ...cs] = Object.values(countries).map((c) => c.name);

export const coffeeSchema = z.object({
	id: z.number().optional(),
	country: z.enum([c, ...cs], {
		errorMap: (_issue, _ctx) => ({ message: "A valid country is required" })
	}).default(''),
	elevation: z.string().min(1),
	farm: z.string().min(1),
	name: z.string().min(1),
	notes: z.string(),
	process: z.string().min(1),
	region: z.string().min(1),
	roaster: z.string().min(1),
	roastingDate: z.string(),
	varietals: z.string().min(1),
	weight: z.coerce.number().positive().default('' as unknown as number)
});
