import { json } from '@sveltejs/kit';
import { getContacts, getContactById, getSession, getTotalUnreadCount } from '$lib/db';
import type { RequestHandler } from './$types';

// GET /api/chat/contacts - Get all contacts for current user
export const GET: RequestHandler = async ({ url, cookies }) => {
	// Get user from session
	const sessionId = cookies.get('session');
	if (!sessionId) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}
	
	const session = getSession(sessionId);
	if (!session) {
		return json({ error: 'Invalid session' }, { status: 401 });
	}
	
	const userId = session.data.userId;
	const id = url.searchParams.get('id');
	const unreadOnly = url.searchParams.get('unreadCount');
	
	// Return only the total unread count
	if (unreadOnly === 'true') {
		const count = getTotalUnreadCount(userId);
		return json({ unreadCount: count });
	}
	
	if (id) {
		const contact = getContactById(parseInt(id), userId);
		if (!contact) {
			return json({ error: 'Contact not found' }, { status: 404 });
		}
		return json(contact);
	}
	
	const contacts = getContacts(userId);
	return json(contacts);
};
