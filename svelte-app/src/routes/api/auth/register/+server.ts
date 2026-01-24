import { json } from '@sveltejs/kit';
import { createUser, getUserByUsername } from '$lib/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { username, password } = await request.json();

	if (!username || !password) {
		return json({ error: 'Username și parola sunt obligatorii!' }, { status: 400 });
	}

	if (username.length < 3) {
		return json({ error: 'Username-ul trebuie să aibă minim 3 caractere!' }, { status: 400 });
	}

	if (password.length < 4) {
		return json({ error: 'Parola trebuie să aibă minim 4 caractere!' }, { status: 400 });
	}

	// Check if username already exists
	const existingUser = getUserByUsername(username);
	if (existingUser) {
		return json({ error: 'Acest username este deja folosit!' }, { status: 409 });
	}

	try {
		const userId = createUser(username.trim(), password);
		return json({ 
			success: true, 
			user: { id: userId, username } 
		}, { status: 201 });
	} catch (error) {
		console.error('Register error:', error);
		return json({ error: 'Eroare la crearea contului!' }, { status: 500 });
	}
};
