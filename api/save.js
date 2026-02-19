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
        let ownerId = null;

        if (req.body.googleToken) {
            try {
                const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${req.body.googleToken}`);
                if (tokenRes.ok) {
                    const tokenData = await tokenRes.json();
                    ownerId = tokenData.sub;
                }
            } catch (e) {
                console.error('Token verification failed', e);
            }
        }

        await turso.execute({
            sql: 'INSERT INTO builds (shortId, editToken, data, ownerId) VALUES (?, ?, ?, ?)',
            args: [shortId, editToken, req.body.data, ownerId]
        });

        res.status(200).json({ shortId, editToken });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: error.message });
    }
}
