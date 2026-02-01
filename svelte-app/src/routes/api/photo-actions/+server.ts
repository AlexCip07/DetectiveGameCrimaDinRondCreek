import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSession, createPhotoAction, getPhotoAction, updatePhotoAction } from '$lib/db';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const sessionId = cookies.get('session');
	
	if (!sessionId) {
		return json({ error: 'Nu ești autentificat' }, { status: 401 });
	}
	
	const session = getSession(sessionId);
	
	if (!session) {
		return json({ error: 'Sesiune invalidă' }, { status: 401 });
	}
	
	const userId = session.data.userId;
	
	try {
		const { action, done } = await request.json();
		
		// Accept both number and string for action
		const actionValue = typeof action === 'number' ? action : parseInt(action, 10);
		
		if (isNaN(actionValue)) {
			return json({ error: 'Action trebuie să fie un număr valid' }, { status: 400 });
		}
		
		// Check if action already exists for this user
		const existingAction = getPhotoAction(userId, actionValue);
		
		if (existingAction) {
			// Action already exists - optionally update if done changed
			if (done !== undefined && existingAction.done !== done) {
				updatePhotoAction(userId, actionValue, done);
				return json({ success: true, message: 'Photo action actualizată', updated: true });
			}
			// Already exists, no changes needed
			return json({ success: true, message: 'Photo action există deja', exists: true });
		} else {
			// Create new action
			const actionId = createPhotoAction(userId, actionValue, done ?? false);
			return json({ success: true, message: 'Photo action creată', action_id: actionId, created: true });
		}
	} catch (error) {
		console.error('Error creating/updating photo action:', error);
		return json({ error: 'Eroare la salvare' }, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ cookies }) => {
	const sessionId = cookies.get('session');
	
	if (!sessionId) {
		return json({ error: 'Nu ești autentificat' }, { status: 401 });
	}
	
	const session = getSession(sessionId);
	
	if (!session) {
		return json({ error: 'Sesiune invalidă' }, { status: 401 });
	}
	
	const userId = session.data.userId;
	
	try {
		const { getPhotoActions } = await import('$lib/db');
		const actions = getPhotoActions(userId);
		return json({ success: true, actions });
	} catch (error) {
		console.error('Error fetching photo actions:', error);
		return json({ error: 'Eroare la citire' }, { status: 500 });
	}
};
