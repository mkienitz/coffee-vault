import { z } from 'zod';

export const formSchema = z.object({
	name: z.string(),
	roaster: z.string(),
	varietals: z.string(),
	country: z.string(),
	region: z.string(),
	farm: z.string(),
	process: z.string(),
	elevation: z.string(),
	roastingDate: z.string().refine((v) => v, { message: 'A roasting date is required' }),
	notes: z.string()
});

export type FormSchema = typeof formSchema;
