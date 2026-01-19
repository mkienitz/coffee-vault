import * as v from 'valibot';

// ============================================================================
// BREW SCHEMAS
// ============================================================================

/**
 * Brew Schema - SINGLE SOURCE OF TRUTH
 *
 * This schema defines the domain model for a brew entity.
 * All other brew-related schemas derive from this one.
 */
export const brewSchema = v.object({
	id: v.number(),
	weight: v.pipe(v.number('Weight must be a number'), v.minValue(1)),
	consumptionDate: v.string(),
	coffeeId: v.number()
});

/**
 * Brew Creation Schema
 *
 * Used for creating new brews (no id field).
 * Validates form data before inserting into database.
 */
export const brewCreationSchema = v.omit(brewSchema, ['id']);

/**
 * Brew Update Schema
 *
 * Used for updating existing brews (includes id field).
 * Validates form data before updating database.
 */
// export const brewUpdateSchema = brewSchema;

/**
 * Brew Delete Schema
 *
 * Used for identifying which brew to delete.
 * Only includes the id.
 */
// export const brewDeleteSchema = v.pick(brewSchema, ['id']);
