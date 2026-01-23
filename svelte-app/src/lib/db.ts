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

export function createUser(username: string, email?: string) {
	const stmt = db?.prepare('INSERT INTO users (username, email) VALUES (?, ?)');
	const result = stmt?.run(username, email || null);
	return result?.lastInsertRowid;
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
	const session = db?.prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")').get(id) as { data: string } | undefined;
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
	return db?.prepare('DELETE FROM sessions WHERE expires_at <= datetime("now")').run();
}
