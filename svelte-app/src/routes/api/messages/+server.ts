import { json } from '@sveltejs/kit';
import { getMessages, createMessage, deleteMessage } from '$lib/db';
import type { RequestHandler } from './$types';

// GET /api/messages - Get all messages
export const GET: RequestHandler = async ({ url }) => {
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const messages = getMessages(limit);
	return json(messages);
};

// POST /api/messages - Create a new message
export const POST: RequestHandler = async ({ request }) => {
	const { content, userId } = await request.json();
	
	if (!content || typeof content !== 'string') {
		return json({ error: 'Content is required' }, { status: 400 });
	}
	
	const id = createMessage(content.trim(), userId);
	return json({ id, content, userId }, { status: 201 });
};

// DELETE /api/messages - Delete a message
export const DELETE: RequestHandler = async ({ url }) => {
	const id = parseInt(url.searchParams.get('id') || '0');
	
	if (!id) {
		return json({ error: 'Message ID is required' }, { status: 400 });
	}
	
	deleteMessage(id);
	return json({ success: true });
};
