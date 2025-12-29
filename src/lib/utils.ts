import { getCountryCode, getEmojiFlag, type TCountryCode } from 'countries-list';
import type { Dose, Process } from './types';

export function getCurrentDateTime(): string {
	const now = new Date();
	return now.toISOString().slice(0, 19).replace('T', ' ');
	// Returns: "2026-01-15 14:30:45"
}

/**
 * Format ISO datetime for display
 * Input: "2026-01-15 14:30:45"
 * Output: "15/01/2026, 14:30"
 */
export function formatDateTime(isoDateTime: string | null): string {
	if (!isoDateTime) return '';
	const date = new Date(isoDateTime);
	return new Intl.DateTimeFormat('en-GB', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(date);
}

/**
 * Format ISO date for display
 * Input: "2025-05-18"
 * Output: "18/05/2025"
 */
export function formatDate(isoDate: string | null): string {
	if (!isoDate) return '';
	const date = new Date(isoDate);
	return new Intl.DateTimeFormat('en-GB', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	}).format(date);
}

/**
 * Format ISO date for compact display with "R." prefix
 * Input: "2025-05-18"
 * Output: "R.18/5/25"
 */
export function formatRoastDate(isoDate: string | null): string {
	if (!isoDate) return '';
	const date = new Date(isoDate);
	return (
		'R.' +
		new Intl.DateTimeFormat('en-GB', {
			day: 'numeric',
			month: 'numeric',
			year: '2-digit'
		}).format(date)
	);
}

export function getTubeName(dose: Pick<Dose, 'drawer' | 'tubeNumber'>) {
	return `${dose.drawer}${dose.tubeNumber}`;
}

export function getCoffeeFlag(country: string | undefined) {
	if (!country) {
		return '';
	}
	return getEmojiFlag(getCountryCode(country) as TCountryCode);
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
