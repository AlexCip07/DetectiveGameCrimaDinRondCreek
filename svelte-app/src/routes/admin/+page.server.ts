import type { PageServerLoad, Actions } from './$types';
import db from '$lib/db';

interface TableInfo {
	name: string;
	columns: { name: string; type: string }[];
	rowCount: number;
}

interface TableData {
	columns: string[];
	rows: Record<string, unknown>[];
}

export const load: PageServerLoad = async ({ url }) => {
	if (!db) {
		return { tables: [], selectedTable: null, tableData: null, error: 'Database not available' };
	}

	// Get all tables
	const tablesResult = db.prepare(`
		SELECT name FROM sqlite_master 
		WHERE type='table' AND name NOT LIKE 'sqlite_%'
		ORDER BY name
	`).all() as { name: string }[];

	const tables: TableInfo[] = tablesResult.map((t) => {
		const columns = db!.prepare(`PRAGMA table_info(${t.name})`).all() as { name: string; type: string }[];
		const countResult = db!.prepare(`SELECT COUNT(*) as count FROM ${t.name}`).get() as { count: number };
		return {
			name: t.name,
			columns: columns.map((c) => ({ name: c.name, type: c.type })),
			rowCount: countResult.count
		};
	});

	// Get selected table data
	const selectedTable = url.searchParams.get('table');
	let tableData: TableData | null = null;

	if (selectedTable && tables.some((t) => t.name === selectedTable)) {
		const columns = db.prepare(`PRAGMA table_info(${selectedTable})`).all() as { name: string }[];
		const rows = db.prepare(`SELECT * FROM ${selectedTable} ORDER BY rowid DESC LIMIT 100`).all() as Record<string, unknown>[];
		tableData = {
			columns: columns.map((c) => c.name),
			rows
		};
	}

	// Get chat stats
	let chatStats = null;
	try {
		const contactCount = db.prepare('SELECT COUNT(*) as count FROM contacts').get() as { count: number };
		const messageCount = db.prepare('SELECT COUNT(*) as count FROM chat_messages').get() as { count: number };
		const recentMessages = db.prepare(`
			SELECT cm.*, c.name as contact_name 
			FROM chat_messages cm 
			LEFT JOIN contacts c ON cm.contact_id = c.id 
			ORDER BY cm.id DESC 
			LIMIT 5
		`).all() as Array<{id: number; contact_id: number; content: string; sent: number; contact_name: string}>;
		
		chatStats = {
			contactCount: contactCount.count,
			messageCount: messageCount.count,
			recentMessages
		};
	} catch (e) {
		// Tables might not exist yet
	}

	return { tables, selectedTable, tableData, error: null, chatStats };
};

export const actions: Actions = {
	// Execute raw SQL query
	query: async ({ request }) => {
		if (!db) return { success: false, error: 'Database not available' };

		const formData = await request.formData();
		const sql = formData.get('sql') as string;

		if (!sql?.trim()) {
			return { success: false, error: 'No SQL query provided' };
		}

		try {
			const isSelect = sql.trim().toLowerCase().startsWith('select');
			
			if (isSelect) {
				const result = db.prepare(sql).all();
				return { 
					success: true, 
					result, 
					columns: result.length > 0 ? Object.keys(result[0] as object) : [],
					type: 'select'
				};
			} else {
				const result = db.prepare(sql).run();
				return { 
					success: true, 
					result: { changes: result.changes, lastInsertRowid: result.lastInsertRowid },
					type: 'execute'
				};
			}
		} catch (err) {
			return { success: false, error: (err as Error).message };
		}
	},

	// Delete a row
	delete: async ({ request }) => {
		if (!db) return { success: false, error: 'Database not available' };

		const formData = await request.formData();
		const table = formData.get('table') as string;
		const id = formData.get('id') as string;
		const idColumn = formData.get('idColumn') as string;

		if (!table || !id || !idColumn) {
			return { success: false, error: 'Missing parameters' };
		}

		try {
			// Sanitize table name (prevent SQL injection)
			const validTables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all() as { name: string }[];
			if (!validTables.some((t) => t.name === table)) {
				return { success: false, error: 'Invalid table name' };
			}

			const result = db.prepare(`DELETE FROM ${table} WHERE ${idColumn} = ?`).run(id);
			return { success: true, changes: result.changes };
		} catch (err) {
			return { success: false, error: (err as Error).message };
		}
	},

	// Insert a row
	insert: async ({ request }) => {
		if (!db) return { success: false, error: 'Database not available' };

		const formData = await request.formData();
		const table = formData.get('table') as string;
		const data = formData.get('data') as string;

		if (!table || !data) {
			return { success: false, error: 'Missing parameters' };
		}

		try {
			const parsedData = JSON.parse(data);
			const columns = Object.keys(parsedData);
			const values = Object.values(parsedData);
			const placeholders = columns.map(() => '?').join(', ');

			const result = db.prepare(
				`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
			).run(...values);

			return { success: true, lastInsertRowid: result.lastInsertRowid };
		} catch (err) {
			return { success: false, error: (err as Error).message };
		}
	},

	// Update a row
	update: async ({ request }) => {
		if (!db) return { success: false, error: 'Database not available' };

		const formData = await request.formData();
		const table = formData.get('table') as string;
		const id = formData.get('id') as string;
		const idColumn = formData.get('idColumn') as string;
		const data = formData.get('data') as string;

		if (!table || !id || !idColumn || !data) {
			return { success: false, error: 'Missing parameters' };
		}

		try {
			const parsedData = JSON.parse(data);
			const updates = Object.entries(parsedData)
				.map(([key]) => `${key} = ?`)
				.join(', ');
			const values = [...Object.values(parsedData), id];

			const result = db.prepare(
				`UPDATE ${table} SET ${updates} WHERE ${idColumn} = ?`
			).run(...values);

			return { success: true, changes: result.changes };
		} catch (err) {
			return { success: false, error: (err as Error).message };
		}
	}
};
