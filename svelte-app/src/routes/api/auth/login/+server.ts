import { json } from '@sveltejs/kit';
import { verifyUser, createSession } from '$lib/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { username, password } = await request.json();

	if (!username || !password) {
		return json({ error: 'Username și parola sunt obligatorii!' }, { status: 400 });
	}

	const user = verifyUser(username, password);

	if (!user) {
		return json({ error: 'Username sau parolă incorectă!' }, { status: 401 });
	}

	// Create session
	const sessionId = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

	createSession(sessionId, user.id, { username: user.username }, expiresAt);

	// Set cookie
	cookies.set('session', sessionId, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
	});

	return json({ 
		success: true, 
		user: { id: user.id, username: user.username } 
	});
};
