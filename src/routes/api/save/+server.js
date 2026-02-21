import { getTurso } from '$lib/server/db.js';
import { json } from '@sveltejs/kit';

function generateShortId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function POST({ request }) {
    try {
        const body = await request.json();
        const turso = getTurso();
        const shortId = generateShortId(8);
        const editToken = Math.random().toString(36).substring(2, 15);
        let ownerId = null;

        if (body.sessionToken) {
            const { validateSession } = await import('$lib/server/session.js');
            ownerId = await validateSession(body.sessionToken);
        } else if (body.googleToken) {
            // Fallback for older clients
            try {
                const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${body.googleToken}`);
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
            args: [shortId, editToken, body.data, ownerId]
        });

        return json({ shortId, editToken });
    } catch (error) {
        console.error('Save error:', error);
        return json({ error: error.message }, { status: 500 });
    }
}
