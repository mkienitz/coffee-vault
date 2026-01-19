import * as v from 'valibot';
import { coffeeFilterColumns, countryValues, processValues } from '$lib/constants';

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Transforms empty strings to undefined for optional string fields.
 * Used for form inputs that may be cleared by the user.
 */
const optionalString = v.optional(
	v.pipe(
		v.string(),
		v.transform((val) => (val === '' ? undefined : val))
	)
);

// ============================================================================
// COFFEE SCHEMAS
// ============================================================================

/**
 * Coffee Schema - SINGLE SOURCE OF TRUTH
 *
 * This schema defines the domain model for a coffee entity.
 * All other coffee-related schemas derive from this one.
 *
 * Uses `undefined` for optional fields (idiomatic TypeScript).
 * Forms and domain logic work with this schema directly.
 */
export const coffeeSchema = v.object({
	id: v.number(),
	name: v.pipe(v.string(), v.nonEmpty('A name is required')),
	roaster: optionalString,
	varietals: optionalString,
	process: v.optional(v.picklist(processValues)),
	processDetails: optionalString,
	flavorProfile: optionalString,
	country: v.optional(v.picklist(countryValues)),
	region: optionalString,
	farm: optionalString,
	producer: optionalString,
	elevation: optionalString,
	roastingDate: optionalString,
	weight: v.pipe(v.number('Weight must be a number'), v.minValue(1, 'Weight must be >= 1g')),
	description: optionalString,
	notes: optionalString
});

/**
 * Coffee Creation Schema
 *
 * Used for creating new coffees (no id field).
 * Validates form data before inserting into database.
 */
// export const coffeeCreationSchema = v.omit(coffeeSchema, ['id']);

/**
 * Coffee Update Schema
 *
 * Used for updating existing coffees (includes id field).
 * Validates form data before updating database.
 */
// export const coffeeUpdateSchema = coffeeSchema;

export const coffeeManagementSchema = v.object({
	id: v.optional(v.number()),
	...v.omit(coffeeSchema, ['id']).entries,
	mode: v.optional(v.picklist(['create', 'update', 'delete']))
});

// TODO: Comment
export const coffeeFilterSchema = v.pick(coffeeSchema, coffeeFilterColumns);
