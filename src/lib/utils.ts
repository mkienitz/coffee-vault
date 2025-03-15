import type { Dose } from './zod-schemas';

export function getCurrentDateTime() {
	return new Intl.DateTimeFormat('en-DE', {
		timeStyle: 'short',
		dateStyle: 'short'
	}).format(Date.now());
}

export function getTubeName(dose: Dose) {
	return `${dose.drawer}${dose.tubeNumber}`;
}
