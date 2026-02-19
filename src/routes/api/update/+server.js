import { getTurso } from '$lib/server/db.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    try {
        const { shortId, editToken, data, googleToken } = await request.json();

        if (!shortId || !data) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        let ownerId = null;
        if (googleToken) {
            try {
                const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${googleToken}`);
                if (tokenRes.ok) {
                    const tokenData = await tokenRes.json();
                    ownerId = tokenData.sub;
                }
            } catch (e) {
                console.error('Token verification failed', e);
            }
        }

        const turso = getTurso();
        let result;

        if (ownerId) {
            result = await turso.execute({
                sql: "UPDATE builds SET data = ?, lastUpdated = datetime('now') WHERE shortId = ? AND (editToken = ? OR ownerId = ?)",
                args: [data, shortId, editToken || '', ownerId]
            });
        } else {
            result = await turso.execute({
                sql: "UPDATE builds SET data = ?, lastUpdated = datetime('now') WHERE shortId = ? AND editToken = ?",
                args: [data, shortId, editToken]
            });
        }

        if (result.rowsAffected === 0) {
            return json({ error: 'Доступ запрещен: вы не владелец этой сборки' }, { status: 403 });
        }

        return json({ success: true, message: 'Сборка обновлена' });
    } catch (error) {
        console.error('Update error:', error);
        return json({ error: error.message }, { status: 500 });
    }
}
