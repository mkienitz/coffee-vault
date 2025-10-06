import { countries } from 'countries-list';
import { z } from 'zod';

// COFFEE
export const processValues = ['washed', 'natural', 'honey', 'advanced'] as const;
const processSchema = z.enum([...processValues], {
	error: () => 'A valid process category is required'
});
export type Process = z.infer<typeof processSchema>;
const [c, ...cs] = Object.values(countries).map((c) => c.name);

export const coffeeSchema = z.object({
	name: z.string().min(1),
	roaster: z.string().min(1).optional(),
	varietals: z.string().min(1).optional(),
	process: processSchema.optional(),
	processDetails: z.string().min(1).optional(),
	flavorProfile: z.string().min(1).optional(),
	country: z
		.enum([c, ...cs], {
			error: () => 'A valid country is required'
		})
		.optional(),
	region: z.string().min(1).optional(),
	farm: z.string().min(1).optional(),
	producer: z.string().min(1).optional(),
	elevation: z.string().min(1).optional(),
	roastingDate: z.string().min(1).optional(),
	weight: z.number().positive(),
	description: z.string().min(1).optional(),
	notes: z.string().min(1).optional()
});
export type CoffeeSchema = typeof coffeeSchema;
const coffeeSchemaWithId = coffeeSchema.extend({ id: z.number() });
export type Coffee = z.infer<typeof coffeeSchemaWithId>;

// DOSES
export const drawerLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'] as const;
const drawerSchema = z.enum(drawerLetters);
export type Drawer = z.infer<typeof drawerSchema>;

export const tubeNumbers = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;
const tubeNumberSchema = z.enum(tubeNumbers);
export type TubeNumber = z.infer<typeof tubeNumberSchema>;

export const doseManagementSchema = z.object({
	drawer: drawerSchema,
	tubeNumber: tubeNumberSchema
});
export type DoseIdentifier = z.infer<typeof doseManagementSchema>;

const doseSchema = doseManagementSchema.extend({
	weight: z.number(),
	creationDate: z.string(),
	coffeeId: z.number()
});
export type Dose = z.infer<typeof doseSchema>;
export type EmptyDose = DoseIdentifier & {
	weight: null;
	creationDate: null;
	coffeeId: null;
};

export const doseCreationSchema = doseSchema.pick({ weight: true });

// BREWS
const brewSchema = z.object({
	weight: z.number(),
	consumptionDate: z.string(),
	coffeeId: z.number()
});
export type Brew = z.infer<typeof brewSchema>;

// COMBINATORS
export type CoffeeWithDosesAndBrews = Coffee & { doses: Dose[]; brews: Brew[] };
