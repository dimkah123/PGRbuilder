import { getTurso, setCorsHeaders } from './db.js';

export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { shortId, editToken, data } = req.body;

    if (!shortId || !editToken || !data) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const turso = getTurso();
        const result = await turso.execute({
            sql: "UPDATE builds SET data = ?, lastUpdated = datetime('now') WHERE shortId = ? AND editToken = ?",
            args: [data, shortId, editToken]
        });

        if (result.rowsAffected === 0) {
            return res.status(403).json({ error: 'Доступ запрещен: вы не владелец этой сборки' });
        }

        res.status(200).json({ success: true, message: 'Сборка обновлена' });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: error.message });
    }
}
