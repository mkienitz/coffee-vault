import { countries } from 'countries-list';

// ============================================================================
// COFFEE CONSTANTS
// ============================================================================

export const processValues = ['washed', 'natural', 'honey', 'advanced'] as const;

const [c, ...cs] = Object.values(countries)
	.map((c) => c.name)
	.toSorted();
export const countryValues = [c, ...cs] as const;

export const coffeeFilterColumns = ['process', 'country', 'varietals', 'roaster'] as const;

// ============================================================================
// DOSE CONSTANTS
// ============================================================================

export const drawerLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'] as const;
export const tubeNumbers = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;
