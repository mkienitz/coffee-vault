import * as v from 'valibot';
import { drawerLetters, tubeNumbers } from '$lib/constants';

// ============================================================================
// DOSE SCHEMAS
// ============================================================================

/**
 * Dose Schema - SINGLE SOURCE OF TRUTH
 *
 * This schema defines the domain model for a dose entity.
 * All other dose-related schemas derive from this one.
 *
 * Uses `undefined` for optional fields (idiomatic TypeScript).
 */
export const doseSchema = v.object({
	drawer: v.picklist(drawerLetters),
	tubeNumber: v.picklist(tubeNumbers),
	weight: v.pipe(
		v.number('Weight must be a number'),
		v.minValue(1, 'Weight must be >= 1g'),
		v.maxValue(20, "Weight won't fit into a tube")
	),
	creationDate: v.string(),
	coffeeId: v.number()
});

/**
 * Dose Creation Schema
 *
 * Used for creating new doses in existing drawer/tube locations.
 * Only includes the data that changes when filling an empty tube.
 */
export const doseCreationSchema = v.pick(doseSchema, ['weight', 'coffeeId']);

/**
 * Dose Update Schema
 *
 * Used for updating existing doses.
 * Validates form data before updating database.
 */
export const doseUpdateSchema = doseSchema;

/**
 * Dose Management Schema
 *
 * Used for identifying which dose to delete or consume.
 * Only includes the location identifiers (drawer + tube number).
 */
export const doseManagementSchema = v.pick(doseSchema, ['drawer', 'tubeNumber']);
