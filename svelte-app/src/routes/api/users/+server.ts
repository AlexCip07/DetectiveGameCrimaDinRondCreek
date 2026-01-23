import { json } from '@sveltejs/kit';
import { getUsers, getUserById, getUserByUsername, createUser } from '$lib/db';
import type { RequestHandler } from './$types';

// GET /api/users - Get all users or specific user
export const GET: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');
	const username = url.searchParams.get('username');
	
	if (id) {
		const user = getUserById(parseInt(id));
		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}
		return json(user);
	}
	
	if (username) {
		const user = getUserByUsername(username);
		if (!user) {
			return json({ error: 'User not found' }, { status: 404 });
		}
		return json(user);
	}
	
	const users = getUsers();
	return json(users);
};

// POST /api/users - Create a new user
export const POST: RequestHandler = async ({ request }) => {
	const { username, email } = await request.json();
	
	if (!username || typeof username !== 'string') {
		return json({ error: 'Username is required' }, { status: 400 });
	}
	
	// Check if user already exists
	const existing = getUserByUsername(username);
	if (existing) {
		return json({ error: 'Username already exists' }, { status: 409 });
	}
	
	try {
		const id = createUser(username.trim(), email?.trim());
		return json({ id, username, email }, { status: 201 });
	} catch (error) {
		return json({ error: 'Failed to create user' }, { status: 500 });
	}
};
