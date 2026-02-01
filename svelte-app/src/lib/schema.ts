import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============ USERS TABLE ============
export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	username: text('username').notNull().unique(),
	password: text('password').notNull(),
	email: text('email').unique(),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// ============ MESSAGES TABLE (legacy) ============
export const messages = sqliteTable('messages', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	user_id: integer('user_id').references(() => users.id),
	content: text('content').notNull(),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// ============ CONTACTS TABLE ============
export const contacts = sqliteTable('contacts', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	user_id: integer('user_id').references(() => users.id).notNull(),
	name: text('name').notNull(),
	avatar: text('avatar').notNull().default('U'),
	gradient: text('gradient').notNull().default('linear-gradient(135deg, #667eea 0%, #764ba2 100%)'),
	online: integer('online').default(0),
	status: text('status').default('offline')
});

// ============ CHAT MESSAGES TABLE ============
export const chatMessages = sqliteTable('chat_messages', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	contact_id: integer('contact_id').references(() => contacts.id).notNull(),
	content: text('content').notNull(),
	sent: integer('sent').default(1), // 1 = sent by user, 0 = received
	seen: integer('seen').default(0) // 0 = not seen, 1 = seen
});

// ============ SESSIONS TABLE ============
export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	user_id: integer('user_id').references(() => users.id),
	data: text('data'),
	expires_at: text('expires_at')
});

// ============ UNLOCK APPS TABLE ============
export const unlockApps = sqliteTable('unlock_apps', {
	username: text('username').primaryKey().references(() => users.username),
	messages: integer('messages').default(0),
	gallery: integer('gallery').default(0),
	message_preset: integer('message_preset').default(0),
	message_done: integer('message_done').default(0)
});

// ============ PHOTO ACTIONS TABLE ============
export const photoActions = sqliteTable('photo_actions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	user_id: integer('user_id').references(() => users.id).notNull(),
	action: integer('action').notNull(),
	done: integer('done').default(0) // 0 = false, 1 = true
});

// ============ PLAYER SENT MESSAGES TABLE ============
export const playerSentMessages = sqliteTable('player_sent_messages', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	username: text('username').notNull(),
	contact_name: text('contact_name').notNull(),
	message: text('message').notNull(),
	created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// ============ TYPE EXPORTS ============
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type UnlockApp = typeof unlockApps.$inferSelect;
export type NewUnlockApp = typeof unlockApps.$inferInsert;

export type PhotoAction = typeof photoActions.$inferSelect;
export type NewPhotoAction = typeof photoActions.$inferInsert;

export type PlayerSentMessage = typeof playerSentMessages.$inferSelect;
export type NewPlayerSentMessage = typeof playerSentMessages.$inferInsert;
