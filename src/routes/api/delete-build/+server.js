import { getTurso } from '$lib/server/db.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    try {
        const { shortId, googleToken, sessionToken } = await request.json();

        if (!shortId || (!googleToken && !sessionToken)) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        let ownerId = null;
        if (sessionToken) {
            const { validateSession } = await import('$lib/server/session.js');
            ownerId = await validateSession(sessionToken);
        } else if (googleToken) {
            // Verify Token
            const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`);
            if (!tokenRes.ok) {
                return json({ error: 'Invalid token' }, { status: 401 });
            }
            const tokenData = await tokenRes.json();
            ownerId = tokenData.sub;
        }

        if (!ownerId) {
            return json({ error: 'Invalid token data or expired session' }, { status: 401 });
        }

        const turso = getTurso();

        // Check ownership and delete in one go if possible, or check then delete
        const result = await turso.execute({
            sql: "DELETE FROM builds WHERE shortId = ? AND ownerId = ?",
            args: [shortId, ownerId]
        });

        if (result.rowsAffected === 0) {
            return json({ error: 'Build not found or you do not have permission to delete it.' }, { status: 404 });
        }

        return json({ success: true, message: 'Build deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        return json({ error: error.message }, { status: 500 });
    }
}
