import { getTurso } from '$lib/server/db.js';

export async function validateSession(sessionToken) {
    if (!sessionToken) return null;
    const turso = getTurso();

    try {
        const result = await turso.execute({
            sql: 'SELECT userId, expiresAt FROM sessions WHERE id = ?',
            args: [sessionToken]
        });

        if (result.rows.length === 0) return null;

        const session = result.rows[0];
        // If expired, return null
        if (Date.now() > session.expiresAt) {
            return null;
        }

        return session.userId;
    } catch (e) {
        console.error('Session validation error:', e);
        return null;
    }
}
