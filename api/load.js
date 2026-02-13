import { getTurso, setCorsHeaders } from './db.js';

export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id parameter' });

    try {
        const turso = getTurso();
        const result = await turso.execute({
            sql: 'SELECT data FROM builds WHERE shortId = ?',
            args: [id]
        });

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Сборка не найдена' });
        }

        res.status(200).json({ data: result.rows[0].data });
    } catch (error) {
        console.error('Load error:', error);
        res.status(500).json({ error: error.message });
    }
}
