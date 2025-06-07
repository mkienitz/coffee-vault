import { countries } from 'countries-list';
import { z } from 'zod';

const [c, ...cs] = Object.values(countries).map((c) => c.name);

// COFFEE
export const processValues = ['washed', 'natural', 'honey', 'advanced'] as const;
const processSchema = z.enum([...processValues], {
	errorMap: () => ({ message: 'A valid process category is required' })
});
export type Process = z.infer<typeof processSchema>;

export const coffeeSchema = z.object({
	name: z.string().min(1),
	roaster: z.string().min(1).optional(),
	varietals: z.string().min(1).optional(),
	process: processSchema.optional(),
	processDetails: z.string().min(1).optional(),
	flavorProfile: z.string().min(1).optional(),
	country: z
		.enum([c, ...cs], {
			errorMap: () => ({ message: 'A valid country is required' })
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
const drawerSchema = z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']);
export type Drawer = z.infer<typeof drawerSchema>;

const tubeNumberSchema = z.enum(['1', '2', '3', '4', '5', '6', '7', '8']);
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
	creatioDate: null;
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
