import { getTurso } from '$lib/server/db.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    try {
        const turso = getTurso();

        // Check if column exists or just add it
        try {
            await turso.execute("ALTER TABLE builds ADD COLUMN ownerId TEXT");
            return json({ message: "Successfully added ownerId column." });
        } catch (e) {
            // Check for specific error message regarding duplicate column
            if (e.message && e.message.includes('duplicate column')) {
                return json({ message: "Column ownerId already exists." });
            } else {
                // If it's another error, throw it
                throw e;
            }
        }

    } catch (error) {
        console.error('Migration error:', error);
        return json({ error: error.message }, { status: 500 });
    }
}
