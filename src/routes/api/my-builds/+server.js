import { getTurso } from '$lib/server/db.js';
import { json } from '@sveltejs/kit';
import { MEMORY_NAMES } from '$lib/data.js';

export async function POST({ request }) {
    const { googleToken, sessionToken } = await request.json();

    if (!googleToken && !sessionToken) {
        return json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    try {
        let ownerId = null;
        if (sessionToken) {
            const { validateSession } = await import('$lib/server/session.js');
            ownerId = await validateSession(sessionToken);
        } else if (googleToken) {
            // Verify Token
            const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`);
            if (!tokenRes.ok) {
                const errText = await tokenRes.text();
                console.error('Google Token Verification Failed:', tokenRes.status, tokenRes.statusText, errText);
                return json({ error: `Invalid token: ${tokenRes.status} ${errText}` }, { status: 401 });
            }
            const tokenData = await tokenRes.json();
            ownerId = tokenData.sub;
        }

        if (!ownerId) {
            return json({ error: 'Invalid token data or expired session' }, { status: 401 });
        }

        const turso = getTurso();
        let result;
        try {
            result = await turso.execute({
                sql: "SELECT shortId, data, lastUpdated FROM builds WHERE ownerId = ? ORDER BY lastUpdated DESC",
                args: [ownerId]
            });
        } catch (e) {
            if (e.message && e.message.includes("no such column: ownerId")) {
                console.log("Column ownerId missing, migrating...");
                await turso.execute("ALTER TABLE builds ADD COLUMN ownerId TEXT");
                // Retry
                result = await turso.execute({
                    sql: "SELECT shortId, data, lastUpdated FROM builds WHERE ownerId = ? ORDER BY lastUpdated DESC",
                    args: [ownerId]
                });
            } else {
                throw e;
            }
        }

        const builds = result.rows.map(row => {
            let title = 'Untitled Build';
            let memorySummary = '';

            try {
                // Try to parse data to get the title
                const parsed = JSON.parse(row.data);

                // Data structure version 2 has 'b' array for builds, taking first one
                let buildData = null;

                if (parsed.b && parsed.b[0]) {
                    buildData = parsed.b[0];
                    if (parsed.b[0].t) title = parsed.b[0].t;
                } else if (parsed.builds && parsed.builds[0]) {
                    // Fallback for older format if any
                    buildData = parsed.builds[0];
                    if (parsed.builds[0].title) title = parsed.builds[0].title;
                }

                // Version 2 global title 'gt' fallback
                if (parsed.gt) {
                    title = parsed.gt;
                }

                // Calculate Memory Summary
                if (buildData) {
                    const mems = buildData.m || buildData.mems || []; // 'm' is indices, 'mems' is strings
                    const counts = {};

                    mems.forEach(m => {
                        let name = '';
                        if (typeof m === 'number') {
                            name = MEMORY_NAMES[m];
                        } else {
                            name = m;
                        }

                        if (name && name !== '') {
                            counts[name] = (counts[name] || 0) + 1;
                        }
                    });

                    // Format: "Cottie x4 / Darwin x2"
                    const parts = [];
                    for (const [name, count] of Object.entries(counts)) {
                        if (count >= 2) { // Only show sets of 2 or more ideally, or all
                            parts.push(`${name} x${count}`);
                        }
                    }
                    // Sort by count desc
                    parts.sort((a, b) => {
                        const countA = parseInt(a.split('x')[1]);
                        const countB = parseInt(b.split('x')[1]);
                        return countB - countA;
                    });

                    if (parts.length > 0) {
                        memorySummary = parts.join(' / ');
                    } else {
                        memorySummary = 'No Sets';
                    }
                }

            } catch (e) {
                // ignore parse error
            }

            return {
                shortId: row.shortId,
                title: title,
                memorySummary: memorySummary,
                lastUpdated: row.lastUpdated
            };
        });

        return json({ builds });
    } catch (error) {
        console.error('My Builds error:', error);
        return json({ error: error.message }, { status: 500 });
    }
}
