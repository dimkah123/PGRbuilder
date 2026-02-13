import { getTurso, setCorsHeaders } from './db.js';

export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const turso = getTurso();
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS builds (
                shortId TEXT PRIMARY KEY,
                editToken TEXT NOT NULL,
                data TEXT NOT NULL,
                createdAt TEXT DEFAULT (datetime('now')),
                lastUpdated TEXT
            )
        `);

        res.status(200).json({ success: true, message: 'Table "builds" created or already exists.' });
    } catch (error) {
        console.error('Init error:', error);
        res.status(500).json({ error: error.message });
    }
}
