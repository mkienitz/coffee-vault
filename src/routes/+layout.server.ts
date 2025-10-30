import { loadFlash } from 'sveltekit-flash-message/server';

export const load = loadFlash(async ({ cookies }) => {
	return {
		selectedTheme: cookies.get('theme')
	};
});
