import { getCountryCode, getEmojiFlag, type TCountryCode } from 'countries-list';
import type { Coffee, Dose, Process } from './zod-schemas';

export function getCurrentDateTime() {
	return new Intl.DateTimeFormat('en-DE', {
		timeStyle: 'short',
		dateStyle: 'short'
	}).format(Date.now());
}

export function getTubeName(dose: Dose) {
	return `${dose.drawer}${dose.tubeNumber}`;
}

export function getCoffeeFlag(coffee: Coffee) {
	if (!coffee.country) {
		return '';
	}
	return getEmojiFlag(getCountryCode(coffee.country) as TCountryCode);
}

export function getProcessBadgeClass(process: Process): string {
	switch (process) {
		case 'washed':
			return 'badge-success';
		case 'honey':
			return 'badge-warning';
		case 'natural':
			return 'badge-error';
		case 'advanced':
			return 'badge-primary';
	}
}
