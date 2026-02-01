import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'sqlite',
	schema: './svelte-app/src/lib/schema.ts',
	dbCredentials: {
		url: './svelte-app/database.db'
	}
});
