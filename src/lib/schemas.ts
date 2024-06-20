import { countries } from 'countries-list';
import { z } from 'zod';

const [c, ...cs] = Object.values(countries).map((c) => c.name);

// Schemas and types for superforms
export const coffeeSchema = z.object({
	id: z.number().optional(),
	country: z.enum([c, ...cs], {
		errorMap: (_issue, _ctx) => ({ message: 'A valid country is required' })
	}),
	elevation: z.string(),
	farm: z.string(),
	flavorProfile: z.string(),
	name: z.string().min(1),
	notes: z.string(),
	process: z.string(),
	producer: z.string(),
	region: z.string(),
	roaster: z.string().min(1),
	roastingDate: z.string(),
	varietals: z.string(),
	weight: z.number().positive()
});

export const doseSchema = z.object({
	id: z.number().optional(),
	weight: z.number(),
	token: z.string().optional(),
	consumedOn: z.string().optional(),
	coffeeId: z.number()
});

export type CoffeeSchema = z.infer<typeof coffeeSchema>;
export type DoseSchema = z.infer<typeof doseSchema>;

// Schemas and types for valid Objects
const coffee = coffeeSchema.extend({ id: z.number() });
const dose = doseSchema.extend({ id: z.number(), token: z.string() });

export type Coffee = z.infer<typeof coffee>;
export type Dose = z.infer<typeof dose>;

export type CoffeeWithDoses = Coffee & { doses: Dose[] };
