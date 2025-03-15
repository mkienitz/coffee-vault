import { countries } from 'countries-list';
import { z } from 'zod';

const [c, ...cs] = Object.values(countries).map((c) => c.name);

// COFFEE
export const coffeeSchema = z.object({
	country: z.enum([c, ...cs], {
		errorMap: () => ({ message: 'A valid country is required' })
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
export type CoffeeSchema = typeof coffeeSchema;
const coffeeSchemaWithId = coffeeSchema.extend({ id: z.number() });
export type Coffee = z.infer<typeof coffeeSchemaWithId>;

// DOSES
const drawerSchema = z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']);
export type Drawer = z.infer<typeof drawerSchema>;

const tubeNumberSchema = z.enum(['1', '2', '3', '4', '5', '6', '7', '8']);
export type TubeNumber = z.infer<typeof tubeNumberSchema>;

export const doseManagementSchema = z.object({
	drawer: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']),
	tubeNumber: z.enum(['1', '2', '3', '4', '5', '6', '7', '8'])
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
