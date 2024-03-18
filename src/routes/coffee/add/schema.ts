import { countries } from 'countries-list';
import { z } from 'zod';

const [c, ...cs] = Object.values(countries).map((c) => c.name);

export const formSchema = z.object({
	country: z.enum([c, ...cs]),
	elevation: z.string().min(1),
	farm: z.string().min(1),
	name: z.string().min(1),
	notes: z.string(),
	process: z.string().min(1),
	region: z.string().min(1),
	roaster: z.string().min(1),
	roastingDate: z.string().refine((v) => v, { message: 'A roasting date is required' }),
	varietals: z.string().min(1),
	weight: z.coerce.number(),
});

export type FormSchema = typeof formSchema;
