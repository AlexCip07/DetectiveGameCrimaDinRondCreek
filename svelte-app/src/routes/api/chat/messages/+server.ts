import { json } from '@sveltejs/kit';
import { getChatMessages, createChatMessage, deleteChatMessage, clearChatMessages, getContactById, getSession, markMessagesAsSeen, savePlayerSentMessage, getUserById } from '$lib/db';
import type { RequestHandler } from './$types';

// GET /api/chat/messages?contactId=1 - Get messages for a contact
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
	const contactId = parseInt(url.searchParams.get('contactId') || '0');
	const limit = parseInt(url.searchParams.get('limit') || '50');
	
	if (!contactId) {
		return json({ error: 'Contact ID is required' }, { status: 400 });
	}
	
	// Verify contact belongs to user
	const contact = getContactById(contactId, userId);
	if (!contact) {
		return json({ error: 'Contact not found' }, { status: 404 });
	}
	
	// Mark all received messages as seen when opening the chat
	markMessagesAsSeen(contactId);
	
	const messages = getChatMessages(contactId, limit);
	return json(messages);
};

// POST /api/chat/messages - Create a new message
export const POST: RequestHandler = async ({ request, cookies }) => {
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
	const { contactId, content, sent } = await request.json();
	
	if (!contactId || typeof contactId !== 'number') {
		return json({ error: 'Contact ID is required' }, { status: 400 });
	}
	
	// Verify contact belongs to user
	const contact = getContactById(contactId, userId);
	if (!contact) {
		return json({ error: 'Contact not found' }, { status: 404 });
	}
	
	if (!content || typeof content !== 'string') {
		return json({ error: 'Content is required' }, { status: 400 });
	}
	
	const id = createChatMessage(contactId, content.trim(), sent !== false);
	
	// Save to playerSentMessages if sent by player
	if (sent !== false) {
		const user = getUserById(userId) as { username: string } | undefined;
		if (user) {
			savePlayerSentMessage(user.username, contact.name, content.trim());
		}
	}
	
	return json({ 
		id, 
		contact_id: contactId, 
		content: content.trim(), 
		sent: sent !== false
	}, { status: 201 });
};

// DELETE /api/chat/messages - Delete a message or clear all messages for a contact
export const DELETE: RequestHandler = async ({ url, cookies }) => {
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
	const id = parseInt(url.searchParams.get('id') || '0');
	const contactId = parseInt(url.searchParams.get('contactId') || '0');
	
	if (contactId) {
		// Verify contact belongs to user
		const contact = getContactById(contactId, userId);
		if (!contact) {
			return json({ error: 'Contact not found' }, { status: 404 });
		}
		// Clear all messages for a contact
		clearChatMessages(contactId);
		return json({ success: true, cleared: true });
	}
	
	if (!id) {
		return json({ error: 'Message ID or Contact ID is required' }, { status: 400 });
	}
	
	deleteChatMessage(id);
	return json({ success: true });
};
