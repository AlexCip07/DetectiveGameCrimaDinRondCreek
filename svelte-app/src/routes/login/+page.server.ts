import { redirect } from '@sveltejs/kit';
import { getSession } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const sessionId = cookies.get('session');

	if (sessionId) {
		const session = getSession(sessionId);
		if (session) {
			// Already logged in, redirect to home
			throw redirect(303, '/');
		}
	}

	return {};
};
