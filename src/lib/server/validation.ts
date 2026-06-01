import * as v from 'valibot';
import { coffeeSchema, doseSchema, doseUpdateSchema, brewSchema, bagSchema } from '$lib/validation';

// ============================================================================
// CONVERSION UTILITIES
// ============================================================================

/**
 * Converts null values to undefined in an object.
 *
 * Used when reading data from Drizzle (which returns null for nullable fields)
 * and converting to domain objects (which use undefined for optional fields).
 *
 * @example
 * nullToUndefined({ name: 'Coffee', roaster: null })
 * // Returns: { name: 'Coffee', roaster: undefined }
 */
function nullToUndefined<T extends Record<string, unknown>>(obj: T): T {
	const result = {} as T;
	for (const [key, value] of Object.entries(obj)) {
		result[key as keyof T] = (value === null ? undefined : value) as T[keyof T];
	}
	return result;
}

/**
 * Converts undefined values to null in an object.
 *
 * Used when writing data to Drizzle via update operations.
 * Drizzle treats undefined as "skip this field" but we want to explicitly
 * set fields to NULL when they're cleared in forms.
 *
 * @example
 * undefinedToNull({ name: 'Coffee', roaster: undefined })
 * // Returns: { name: 'Coffee', roaster: null }
 */
function undefinedToNull<T extends Record<string, unknown>>(obj: T): T {
	const result = {} as T;
	for (const [key, value] of Object.entries(obj)) {
		result[key as keyof T] = (value === undefined ? null : value) as T[keyof T];
	}
	return result;
}

// ============================================================================
// COFFEE DATABASE SCHEMAS
// ============================================================================
//

/**
 * Coffee Select DB Schema (Database → Domain)
 *
 * Converts Drizzle query results (with null) to domain objects (with undefined).
 * Pipeline: Drizzle result → nullToUndefined → coffeeSchema validation
 *
 * Use this when reading coffee data from the database.
 */
export const coffeeSelectDbSchema = v.pipe(
	v.any(), // Accept any Drizzle output
	v.transform(nullToUndefined),
	coffeeSchema
);

/**
 * Coffee Update DB Schema (Domain → Database)
 *
 * Converts undefined to null so Drizzle will actually set NULL in the database.
 * Without this, Drizzle would skip undefined fields instead of updating them.
 * Pipeline: Form data → undefinedToNull → Drizzle update
 *
 * Use this when updating existing coffee records.
 */
export const coffeeUpdateDbSchema = v.pipe(coffeeSchema, v.transform(undefinedToNull));

// ============================================================================
// DOSE DATABASE SCHEMAS
// ============================================================================

/**
 * Dose Select DB Schema (Database → Domain)
 *
 * Converts Drizzle query results (with null) to domain objects (with undefined).
 * Pipeline: Drizzle result → nullToUndefined → doseSchema validation
 *
 * Use this when reading dose data from the database.
 */
export const doseSelectDbSchema = v.pipe(
	v.any(), // Accept any Drizzle output
	v.transform(nullToUndefined),
	doseSchema
);

/**
 * Dose Update DB Schema (Domain → Database)
 *
 * Converts undefined to null so Drizzle will actually set NULL in the database.
 * Without this, Drizzle would skip undefined fields instead of updating them.
 * Pipeline: Form data → undefinedToNull → Drizzle update
 *
 * Use this when updating existing dose records.
 */
export const doseUpdateDbSchema = v.pipe(doseUpdateSchema, v.transform(undefinedToNull));

// ============================================================================
// BREW DATABASE SCHEMAS
// ============================================================================

/**
 * Brew Select DB Schema (Database → Domain)
 *
 * Converts Drizzle query results (with null) to domain objects (with undefined).
 * Pipeline: Drizzle result → nullToUndefined → brewSchema validation
 *
 * Use this when reading brew data from the database.
 */
export const brewSelectDbSchema = v.pipe(
	v.any(), // Accept any Drizzle output
	v.transform(nullToUndefined),
	brewSchema
);

/**
 * Brew Update DB Schema (Domain → Database)
 *
 * Converts undefined to null so Drizzle will actually set NULL in the database.
 * Without this, Drizzle would skip undefined fields instead of updating them.
 * Pipeline: Form data → undefinedToNull → Drizzle update
 *
 * Use this when updating existing brew records.
 */
// export const brewUpdateDbSchema = v.pipe(brewUpdateSchema, v.transform(undefinedToNull));

// ============================================================================
// BAG DATABASE SCHEMAS
// ============================================================================

/**
 * Bag Select DB Schema (Database → Domain)
 *
 * Converts Drizzle query results to domain objects.
 * Pipeline: Drizzle result → nullToUndefined → bagSchema validation
 *
 * Use this when reading bag data from the database.
 */
export const bagSelectDbSchema = v.pipe(
	v.any(), // Accept any Drizzle output
	v.transform(nullToUndefined),
	bagSchema
);
