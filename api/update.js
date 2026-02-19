import { getTurso, setCorsHeaders } from './db.js';

export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { shortId, editToken, data, googleToken } = req.body;

    if (!shortId || !data) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        let ownerId = null;
        if (googleToken) {
            try {
                const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`);
                if (tokenRes.ok) {
                    const tokenData = await tokenRes.json();
                    ownerId = tokenData.sub;
                }
            } catch (e) {
                console.error('Token verification failed', e);
            }
        }

        const turso = getTurso();

        let result;
        if (ownerId) {
            result = await turso.execute({
                sql: "UPDATE builds SET data = ?, lastUpdated = datetime('now') WHERE shortId = ? AND (editToken = ? OR ownerId = ?)",
                args: [data, shortId, editToken || '', ownerId]
            });
        } else {
            result = await turso.execute({
                sql: "UPDATE builds SET data = ?, lastUpdated = datetime('now') WHERE shortId = ? AND editToken = ?",
                args: [data, shortId, editToken]
            });
        }

        if (result.rowsAffected === 0) {
            return res.status(403).json({ error: 'Доступ запрещен: вы не владелец этой сборки' });
        }

        res.status(200).json({ success: true, message: 'Сборка обновлена' });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: error.message });
    }
}
