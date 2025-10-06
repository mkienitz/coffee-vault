import { countries } from 'countries-list';
import { z } from 'zod';

// COFFEE
export const processValues = ['washed', 'natural', 'honey', 'advanced'] as const;
const processSchema = z.enum([...processValues], {
	error: () => 'A valid process category is required'
});
export type Process = z.infer<typeof processSchema>;
const [c, ...cs] = Object.values(countries).map((c) => c.name);

export const coffeeSchema = z
	.object({
		id: z.number(),
		name: z.string().min(1),
		roaster: z.string().min(1).nullable(),
		varietals: z.string().min(1).nullable(),
		process: processSchema.nullable(),
		processDetails: z.string().min(1).nullable(),
		flavorProfile: z.string().min(1).nullable(),
		country: z
			.enum([c, ...cs], {
				error: () => 'A valid country is required'
			})
			.nullable(),
		region: z.string().min(1).nullable(),
		farm: z.string().min(1).nullable(),
		producer: z.string().min(1).nullable(),
		elevation: z.string().min(1).nullable(),
		roastingDate: z.string().min(1).nullable(),
		weight: z.number().positive(),
		description: z.string().min(1).nullable(),
		notes: z.string().min(1).nullable()
	})
	.brand('Coffee');
export type Coffee = z.infer<typeof coffeeSchema>;
export const coffeeInsertionSchema = coffeeSchema.omit({ id: true });
export type CoffeeSchema = typeof coffeeInsertionSchema;

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

export const doseSchema = doseManagementSchema
	.extend({
		weight: z.number(),
		creationDate: z.string(),
		coffeeId: z.number()
	})
	.brand('Dose');
export type Dose = z.infer<typeof doseSchema>;
export type EmptyDose = DoseIdentifier & {
	weight: null;
	creationDate: null;
	coffeeId: null;
};

export const doseCreationSchema = doseSchema.pick({ weight: true });

// BREWS
export const brewSchema = z
	.object({
		weight: z.number(),
		consumptionDate: z.string(),
		coffeeId: z.number()
	})
	.brand('Brew');
export type Brew = z.infer<typeof brewSchema>;

// COMBINATORS
export type CoffeeWithDosesAndBrews = Coffee & { doses: Dose[]; brews: Brew[] };
