import { getTurso, setCorsHeaders } from './db.js';

export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const turso = getTurso();

        // Check if column exists or just add it
        try {
            await turso.execute("ALTER TABLE builds ADD COLUMN ownerId TEXT");
            res.status(200).json({ message: "Successfully added ownerId column." });
        } catch (e) {
            // Check for specific error message regarding duplicate column
            if (e.message && e.message.includes('duplicate column')) {
                res.status(200).json({ message: "Column ownerId already exists." });
            } else {
                // If it's another error, throw it
                throw e;
            }
        }

    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({ error: error.message });
    }
}
