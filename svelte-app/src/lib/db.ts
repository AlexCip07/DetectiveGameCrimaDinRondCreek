import Database from 'better-sqlite3';
import { building } from '$app/environment';

// Don't initialize DB during build
const db = building ? null : new Database('database.db');

// Initialize tables
if (db) {
	db.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			email TEXT UNIQUE,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS messages (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER,
			content TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id)
		);

		CREATE TABLE IF NOT EXISTS sessions (
			id TEXT PRIMARY KEY,
			user_id INTEGER,
			data TEXT,
			expires_at DATETIME,
			FOREIGN KEY (user_id) REFERENCES users(id)
		);

		CREATE TABLE IF NOT EXISTS unlock_apps (
			username TEXT PRIMARY KEY,
			messages INTEGER DEFAULT 0,
			gallery INTEGER DEFAULT 0,
			message_preset INTEGER DEFAULT 0,
			message_done INTEGER DEFAULT 0,
			FOREIGN KEY (username) REFERENCES users(username)
		);

		CREATE TABLE IF NOT EXISTS contacts (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			name TEXT NOT NULL,
			avatar TEXT NOT NULL DEFAULT 'U',
			gradient TEXT NOT NULL DEFAULT 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
			online INTEGER DEFAULT 0,
			status TEXT DEFAULT 'offline',
			FOREIGN KEY (user_id) REFERENCES users(id)
		);

		CREATE TABLE IF NOT EXISTS chat_messages (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			contact_id INTEGER NOT NULL,
			content TEXT NOT NULL,
			sent INTEGER DEFAULT 1,
			seen INTEGER DEFAULT 0,
			FOREIGN KEY (contact_id) REFERENCES contacts(id)
		);

		CREATE TABLE IF NOT EXISTS photo_actions (
			action_id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			action TEXT NOT NULL,
			done INTEGER DEFAULT 0,
			FOREIGN KEY (user_id) REFERENCES users(id)
		);

		CREATE TABLE IF NOT EXISTS player_sent_messages (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT NOT NULL,
			contact_name TEXT NOT NULL,
			message TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);
	`);

}

export default db;

// Helper functions
export function getUsers() {
	return db?.prepare('SELECT * FROM users ORDER BY created_at DESC').all() ?? [];
}

export function getUserById(id: number) {
	return db?.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function getUserByUsername(username: string) {
	return db?.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

export function createUser(username: string, password: string, email?: string) {
	const stmt = db?.prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)');
	const result = stmt?.run(username, password, email || null);
	
	// Create unlock_apps entry for new user
	if (result?.lastInsertRowid) {
		db?.prepare('INSERT OR IGNORE INTO unlock_apps (username) VALUES (?)').run(username);
	}
	
	return result?.lastInsertRowid;
}

export function verifyUser(username: string, password: string) {
	const user = db?.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password) as { id: number, username: string } | undefined;
	return user;
}

export function getMessages(limit = 50) {
	return db?.prepare(`
		SELECT m.*, u.username 
		FROM messages m 
		LEFT JOIN users u ON m.user_id = u.id 
		ORDER BY m.created_at DESC 
		LIMIT ?
	`).all(limit) ?? [];
}

export function createMessage(content: string, userId?: number) {
	const stmt = db?.prepare('INSERT INTO messages (content, user_id) VALUES (?, ?)');
	const result = stmt?.run(content, userId || null);
	return result?.lastInsertRowid;
}

export function deleteMessage(id: number) {
	const stmt = db?.prepare('DELETE FROM messages WHERE id = ?');
	return stmt?.run(id);
}

// Session helpers
export function createSession(id: string, userId: number, data: object, expiresAt: Date) {
	const stmt = db?.prepare('INSERT OR REPLACE INTO sessions (id, user_id, data, expires_at) VALUES (?, ?, ?, ?)');
	return stmt?.run(id, userId, JSON.stringify(data), expiresAt.toISOString());
}

export function getSession(id: string) {
	const session = db?.prepare(`SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')`).get(id) as { 
		id: string;
		user_id: number;
		data: string;
		expires_at: string;
	} | undefined;
	
	if (session) {
		return { 
			...session, 
			data: { 
				...JSON.parse(session.data),
				userId: session.user_id 
			}
		};
	}
	return null;
}

export function deleteSession(id: string) {
	return db?.prepare('DELETE FROM sessions WHERE id = ?').run(id);
}

// Cleanup expired sessions
export function cleanupSessions() {
	return db?.prepare(`DELETE FROM sessions WHERE expires_at <= datetime('now')`).run();
}

// ============ UNLOCK APPS ============

export interface UnlockApps {
	username: string;
	messages: boolean;
	gallery: boolean;
	message_preset: number;
	message_done: boolean;
}

export function getUnlockApps(username: string): UnlockApps | null {
	const row = db?.prepare('SELECT * FROM unlock_apps WHERE username = ?').get(username) as {
		username: string;
		messages: number;
		gallery: number;
		message_preset: number;
		message_done: number;
	} | undefined;
	
	if (!row) return null;
	
	return {
		username: row.username,
		messages: row.messages === 1,
		gallery: row.gallery === 1,
		message_preset: row.message_preset,
		message_done: row.message_done === 1
	};
}

export function createUnlockApps(username: string) {
	const stmt = db?.prepare('INSERT OR IGNORE INTO unlock_apps (username) VALUES (?)');
	return stmt?.run(username);
}

export function updateUnlockApps(
	username: string, 
	updates: Partial<{ messages: boolean; gallery: boolean; message_preset: number; message_done: boolean }>
) {
	const fields: string[] = [];
	const values: (number | string)[] = [];
	
	if (updates.messages !== undefined) {
		fields.push('messages = ?');
		values.push(updates.messages ? 1 : 0);
	}
	if (updates.gallery !== undefined) {
		fields.push('gallery = ?');
		values.push(updates.gallery ? 1 : 0);
	}
	if (updates.message_preset !== undefined) {
		fields.push('message_preset = ?');
		values.push(updates.message_preset);
	}
	if (updates.message_done !== undefined) {
		fields.push('message_done = ?');
		values.push(updates.message_done ? 1 : 0);
	}
	
	if (fields.length === 0) return null;
	
	values.push(username);
	const stmt = db?.prepare(`UPDATE unlock_apps SET ${fields.join(', ')} WHERE username = ?`);
	return stmt?.run(...values);
}

export function unlockMessages(username: string) {
	return updateUnlockApps(username, { messages: true });
}

export function unlockGallery(username: string) {
	return updateUnlockApps(username, { gallery: true });
}

export function setMessagePreset(username: string, preset: number) {
	return updateUnlockApps(username, { message_preset: preset });
}

export function setMessageDone(username: string, done: boolean) {
	return updateUnlockApps(username, { message_done: done });
}

// ============ CONTACTS ============

export interface Contact {
	id: number;
	user_id: number;
	name: string;
	avatar: string;
	gradient: string;
	online: boolean;
	status: string;
	lastMessage?: string;
	unreadCount?: number;
}

export function getContacts(userId: number): Contact[] {
	const rows = db?.prepare(`
		SELECT c.*, 
			(SELECT content FROM chat_messages WHERE contact_id = c.id ORDER BY id DESC LIMIT 1) as lastMessage,
			(SELECT COUNT(*) FROM chat_messages WHERE contact_id = c.id AND sent = 0 AND seen = 0) as unreadCount
		FROM contacts c
		WHERE c.user_id = ?
		ORDER BY c.id ASC
	`).all(userId) as Array<{
		id: number;
		user_id: number;
		name: string;
		avatar: string;
		gradient: string;
		online: number;
		status: string;
		lastMessage: string | null;
		unreadCount: number;
	}> ?? [];
	
	return rows.map(row => ({
		id: row.id,
		user_id: row.user_id,
		name: row.name,
		avatar: row.avatar,
		gradient: row.gradient,
		online: row.online === 1,
		status: row.status,
		lastMessage: row.lastMessage || undefined,
		unreadCount: row.unreadCount || 0
	}));
}

export function getContactById(id: number, userId: number): Contact | null {
	const row = db?.prepare('SELECT * FROM contacts WHERE id = ? AND user_id = ?').get(id, userId) as {
		id: number;
		user_id: number;
		name: string;
		avatar: string;
		gradient: string;
		online: number;
		status: string;
	} | undefined;
	
	if (!row) return null;
	
	return {
		id: row.id,
		user_id: row.user_id,
		name: row.name,
		avatar: row.avatar,
		gradient: row.gradient,
		online: row.online === 1,
		status: row.status
	};
}

export function createContact(userId: number, name: string, avatar: string, gradient: string, online: boolean = false, status: string = 'offline') {
	const stmt = db?.prepare('INSERT INTO contacts (user_id, name, avatar, gradient, online, status) VALUES (?, ?, ?, ?, ?, ?)');
	const result = stmt?.run(userId, name, avatar, gradient, online ? 1 : 0, status);
	return result?.lastInsertRowid;
}

export function createTutorialContact(userId: number) {
	// Create Tutorial contact for the user
	const contactId = createContact(
		userId,
		'Tutorial',
		'📚',
		'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
		true,
		'mereu online'
	);
	
	// Add welcome message
	if (contactId) {
		db?.prepare('INSERT INTO chat_messages (contact_id, content, sent) VALUES (?, ?, ?)').run(
			contactId,
			'Bună! Acesta este tutorialul. Bine ai venit în aplicație! 👋',
			0
		);
	}
	
	return contactId;
}

// ============ CHAT MESSAGES ============

export interface ChatMessage {
	id: number;
	contact_id: number;
	content: string;
	sent: boolean;
	seen: boolean;
}

export function getChatMessages(contactId: number, limit = 50): ChatMessage[] {
	const rows = db?.prepare(`
		SELECT * FROM chat_messages 
		WHERE contact_id = ? 
		ORDER BY id ASC 
		LIMIT ?
	`).all(contactId, limit) as Array<{
		id: number;
		contact_id: number;
		content: string;
		sent: number;
		seen: number;
	}> ?? [];
	
	return rows.map(row => ({
		id: row.id,
		contact_id: row.contact_id,
		content: row.content,
		sent: row.sent === 1,
		seen: row.seen === 1
	}));
}

export function markMessagesAsSeen(contactId: number) {
	const stmt = db?.prepare('UPDATE chat_messages SET seen = 1 WHERE contact_id = ? AND sent = 0 AND seen = 0');
	return stmt?.run(contactId);
}

export function getTotalUnreadCount(userId: number): number {
	const result = db?.prepare(`
		SELECT COUNT(*) as count 
		FROM chat_messages cm
		JOIN contacts c ON cm.contact_id = c.id
		WHERE c.user_id = ? AND cm.sent = 0 AND cm.seen = 0
	`).get(userId) as { count: number } | undefined;
	
	return result?.count || 0;
}

export function createChatMessage(contactId: number, content: string, sent: boolean = true) {
	const stmt = db?.prepare('INSERT INTO chat_messages (contact_id, content, sent) VALUES (?, ?, ?)');
	const result = stmt?.run(contactId, content, sent ? 1 : 0);
	return result?.lastInsertRowid;
}

export function deleteChatMessage(id: number) {
	const stmt = db?.prepare('DELETE FROM chat_messages WHERE id = ?');
	return stmt?.run(id);
}

export function clearChatMessages(contactId: number) {
	const stmt = db?.prepare('DELETE FROM chat_messages WHERE contact_id = ?');
	return stmt?.run(contactId);
}

// ============ PHOTO ACTIONS ============

export interface PhotoAction {
	action_id: number;
	user_id: number;
	action: number;
	done: boolean;
}

export function getPhotoActions(userId: number): PhotoAction[] {
	const rows = db?.prepare('SELECT * FROM photo_actions WHERE user_id = ? ORDER BY action_id ASC').all(userId) as Array<{
		action_id: number;
		user_id: number;
		action: number;
		done: number;
	}> ?? [];
	
	return rows.map(row => ({
		action_id: row.action_id,
		user_id: row.user_id,
		action: row.action,
		done: row.done === 1
	}));
}

export function getPhotoAction(userId: number, action: number): PhotoAction | null {
	const row = db?.prepare('SELECT * FROM photo_actions WHERE user_id = ? AND action = ?').get(userId, action) as {
		action_id: number;
		user_id: number;
		action: number;
		done: number;
	} | undefined;
	
	if (!row) return null;
	
	return {
		action_id: row.action_id,
		user_id: row.user_id,
		action: row.action,
		done: row.done === 1
	};
}

export function getPhotoActionById(actionId: number): PhotoAction | null {
	const row = db?.prepare('SELECT * FROM photo_actions WHERE action_id = ?').get(actionId) as {
		action_id: number;
		user_id: number;
		action: number;
		done: number;
	} | undefined;
	
	if (!row) return null;
	
	return {
		action_id: row.action_id,
		user_id: row.user_id,
		action: row.action,
		done: row.done === 1
	};
}

export function createPhotoAction(userId: number, action: number, done: boolean = false) {
	const stmt = db?.prepare('INSERT INTO photo_actions (user_id, action, done) VALUES (?, ?, ?)');
	const result = stmt?.run(userId, action, done ? 1 : 0);
	return result?.lastInsertRowid;
}

export function updatePhotoAction(userId: number, action: number, done: boolean) {
	const stmt = db?.prepare('UPDATE photo_actions SET done = ? WHERE user_id = ? AND action = ?');
	return stmt?.run(done ? 1 : 0, userId, action);
}

export function updatePhotoActionById(actionId: number, done: boolean) {
	const stmt = db?.prepare('UPDATE photo_actions SET done = ? WHERE action_id = ?');
	return stmt?.run(done ? 1 : 0, actionId);
}

export function setPhotoActionDone(userId: number, action: number) {
	return updatePhotoAction(userId, action, true);
}

export function deletePhotoAction(actionId: number) {
	const stmt = db?.prepare('DELETE FROM photo_actions WHERE action_id = ?');
	return stmt?.run(actionId);
}

export function deleteAllPhotoActions(userId: number) {
	const stmt = db?.prepare('DELETE FROM photo_actions WHERE user_id = ?');
	return stmt?.run(userId);
}

// ============ PLAYER SENT MESSAGES ============

export interface PlayerSentMessage {
	id: number;
	username: string;
	contact_name: string;
	message: string;
	created_at: string;
}

export function savePlayerSentMessage(username: string, contactName: string, message: string) {
	const stmt = db?.prepare('INSERT INTO player_sent_messages (username, contact_name, message) VALUES (?, ?, ?)');
	const result = stmt?.run(username, contactName, message);
	return result?.lastInsertRowid;
}

export function getPlayerSentMessages(username?: string): PlayerSentMessage[] {
	let query = 'SELECT * FROM player_sent_messages';
	const params: string[] = [];
	
	if (username) {
		query += ' WHERE username = ?';
		params.push(username);
	}
	
	query += ' ORDER BY created_at DESC';
	
	const rows = db?.prepare(query).all(...params) as PlayerSentMessage[] ?? [];
	return rows;
}

export function getPlayerSentMessagesByContact(username: string, contactName: string): PlayerSentMessage[] {
	const rows = db?.prepare(`
		SELECT * FROM player_sent_messages 
		WHERE username = ? AND contact_name = ?
		ORDER BY created_at DESC
	`).all(username, contactName) as PlayerSentMessage[] ?? [];
	return rows;
}

