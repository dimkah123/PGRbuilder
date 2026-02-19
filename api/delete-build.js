import { getTurso, setCorsHeaders } from './db.js';

export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { shortId, googleToken } = req.body;

    if (!shortId || !googleToken) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Verify Token
        const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`);
        if (!tokenRes.ok) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        const tokenData = await tokenRes.json();
        const ownerId = tokenData.sub;

        if (!ownerId) {
            return res.status(401).json({ error: 'Invalid token data' });
        }

        const turso = getTurso();

        // Check ownership and delete in one go if possible, or check then delete
        const result = await turso.execute({
            sql: "DELETE FROM builds WHERE shortId = ? AND ownerId = ?",
            args: [shortId, ownerId]
        });

        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: 'Build not found or you do not have permission to delete it.' });
        }

        res.status(200).json({ success: true, message: 'Build deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: error.message });
    }
}
