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
	const session = db?.prepare(`SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')`).get(id) as { data: string } | undefined;
	if (session) {
		return { ...session, data: JSON.parse(session.data) };
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
