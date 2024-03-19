import { countries } from 'countries-list';
import { z } from 'zod';

const [c, ...cs] = Object.values(countries).map((c) => c.name);

export const formSchema = z.object({
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
	roastingDate: z.coerce.date()
		.refine((v) => v, { message: 'A roasting date is required' })
		.transform(v => v.toISOString().substring(0, 10)),
	varietals: z.string().min(1),
	weight: z.coerce.number().positive().default('' as unknown as number)
});

export type FormSchema = typeof formSchema;
