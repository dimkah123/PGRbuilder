import { getTurso } from '$lib/server/db.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    try {
        const turso = getTurso();

        // 1. Check if column exists or just add it to builds
        let message1 = "";
        try {
            await turso.execute("ALTER TABLE builds ADD COLUMN ownerId TEXT");
            message1 = "Successfully added ownerId column.";
        } catch (e) {
            if (e.message && e.message.includes('duplicate column')) {
                message1 = "Column ownerId already exists.";
            } else if (e.message && e.message.includes('no such table')) {
                // Ignore if table builds doesn't exist yet, assumed it does
                console.log("builds table missing");
            } else {
                throw e;
            }
        }

        // 2. Create users table
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT,
                name TEXT,
                picture TEXT,
                refreshToken TEXT
            )
        `);

        // 3. Create sessions table
        await turso.execute(`
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                userId TEXT,
                expiresAt INTEGER
            )
        `);

        return json({
            message: "Migration completed.",
            details: {
                builds: message1,
                users: "Created/verified users table",
                sessions: "Created/verified sessions table"
            }
        });

    } catch (error) {
        console.error('Migration error:', error);
        return json({ error: error.message }, { status: 500 });
    }
}
