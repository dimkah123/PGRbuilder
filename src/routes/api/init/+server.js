import { getTurso } from '$lib/server/db.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    try {
        const turso = getTurso();
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS builds (
                shortId TEXT PRIMARY KEY,
                editToken TEXT NOT NULL,
                data TEXT NOT NULL,
                createdAt TEXT DEFAULT (datetime('now')),
                lastUpdated TEXT,
                ownerId TEXT
            )
        `);

        return json({ success: true, message: 'Table "builds" created or already exists.' });
    } catch (error) {
        console.error('Init error:', error);
        return json({ error: error.message }, { status: 500 });
    }
}
