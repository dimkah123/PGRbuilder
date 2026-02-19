import { getTurso, setCorsHeaders } from './db.js';

export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { googleToken } = req.body;

    if (!googleToken) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
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
        const result = await turso.execute({
            sql: "SELECT shortId, data, lastUpdated FROM builds WHERE ownerId = ? ORDER BY lastUpdated DESC",
            args: [ownerId]
        });

        const builds = result.rows.map(row => {
            let title = 'Untitled Build';
            try {
                // Try to parse data to get the title
                const parsed = JSON.parse(row.data);
                // Data structure version 2 has 'b' array for builds, taking first one's title 't'
                if (parsed.b && parsed.b[0] && parsed.b[0].t) {
                    title = parsed.b[0].t;
                } else if (parsed.builds && parsed.builds[0] && parsed.builds[0].title) {
                    // Fallback for older format if any
                    title = parsed.builds[0].title;
                }
            } catch (e) {
                // ignore parse error
            }

            return {
                shortId: row.shortId,
                title: title,
                lastUpdated: row.lastUpdated
            };
        });

        res.status(200).json({ builds });
    } catch (error) {
        console.error('My Builds error:', error);
        res.status(500).json({ error: error.message });
    }
}
