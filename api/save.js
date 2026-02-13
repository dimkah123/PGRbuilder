import { getTurso, setCorsHeaders } from './db.js';

function generateShortId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const turso = getTurso();
        const shortId = generateShortId(8);
        const editToken = Math.random().toString(36).substring(2, 15);

        await turso.execute({
            sql: 'INSERT INTO builds (shortId, editToken, data) VALUES (?, ?, ?)',
            args: [shortId, editToken, req.body.data]
        });

        res.status(200).json({ shortId, editToken });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: error.message });
    }
}
