import { z } from 'zod';

export const formSchema = z.object({
	name: z.string().min(2).max(50),
	roastingDate: z.string().refine((v) => v, { message: 'A roasting date is required' })
});

export type FormSchema = typeof formSchema;
