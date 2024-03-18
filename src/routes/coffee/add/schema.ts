import { countries } from 'countries-list';
import { z } from 'zod';

const [c, ...cs] = Object.values(countries).map((c) => c.name);

export const formSchema = z.object({
	name: z.string().min(1),
	roaster: z.string().min(1),
	varietals: z.string().min(1),
	country: z.enum([c, ...cs]),
	region: z.string().min(1),
	farm: z.string().min(1),
	process: z.string().min(1),
	elevation: z.string().min(1),
	roastingDate: z.string().refine((v) => v, { message: 'A roasting date is required' }),
	notes: z.string().min(1)
});

export type FormSchema = typeof formSchema;
