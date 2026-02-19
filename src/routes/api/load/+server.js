import { getTurso } from '$lib/server/db.js';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
    const id = url.searchParams.get('id');
    if (!id) return json({ error: 'Missing id parameter' }, { status: 400 });

    try {
        const turso = getTurso();
        const result = await turso.execute({
            sql: 'SELECT data, ownerId FROM builds WHERE shortId = ?',
            args: [id]
        });

        if (result.rows.length === 0) {
            return json({ error: 'Сборка не найдена' }, { status: 404 });
        }

        return json({
            data: result.rows[0].data,
            ownerId: result.rows[0].ownerId
        });
    } catch (error) {
        console.error('Load error:', error);
        return json({ error: error.message }, { status: 500 });
    }
}
