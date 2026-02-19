import { getTurso } from '$lib/server/db.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    const { googleToken } = await request.json();

    if (!googleToken) {
        return json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    try {
        // Verify Token
        const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`);
        if (!tokenRes.ok) {
            return json({ error: 'Invalid token' }, { status: 401 });
        }
        const tokenData = await tokenRes.json();
        const ownerId = tokenData.sub;

        if (!ownerId) {
            return json({ error: 'Invalid token data' }, { status: 401 });
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
                // Version 2 global title 'gt' fallback
                if (parsed.gt) {
                    title = parsed.gt;
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

        return json({ builds });
    } catch (error) {
        console.error('My Builds error:', error);
        return json({ error: error.message }, { status: 500 });
    }
}
