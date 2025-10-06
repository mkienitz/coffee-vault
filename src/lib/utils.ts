import { getCountryCode, getEmojiFlag, type TCountryCode } from 'countries-list';
import type { Coffee, Dose } from './zod-schemas';

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
