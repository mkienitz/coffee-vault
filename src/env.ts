import { defineEnvVars } from '@sveltejs/kit/env';

// Database initialization rejects an empty path at runtime; builds do not access the database.
export const variables = defineEnvVars({
	COFFEE_VAULT_DB_PATH: { schema: (input) => input ?? '' }
});
