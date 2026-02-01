import { redirect } from '@sveltejs/kit';
import { getSession } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const sessionId = cookies.get('session');

	if (!sessionId) {
		throw redirect(303, '/login');
	}

	const session = getSession(sessionId);

	if (!session) {
		cookies.delete('session', { path: '/' });
		throw redirect(303, '/login');
	}

	return {
		user: session.data
	};
};
