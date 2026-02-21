import { getTurso } from '$lib/server/db.js';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const CLIENT_ID = '64823134414-44hmn7s4ro6bhdu9ub82a5gi092pq0nj.apps.googleusercontent.com';

export async function POST({ request }) {
    try {
        const { sessionToken } = await request.json();
        if (!sessionToken) return json({ error: 'No session token provided' }, { status: 400 });

        const turso = getTurso();

        // Find session
        const sessionResult = await turso.execute({
            sql: 'SELECT userId FROM sessions WHERE id = ?',
            args: [sessionToken]
        });

        if (sessionResult.rows.length === 0) {
            return json({ error: 'Invalid session' }, { status: 401 });
        }

        const userId = sessionResult.rows[0].userId;

        // Find refresh token for user
        const userResult = await turso.execute({
            sql: 'SELECT refreshToken, email, name, picture FROM users WHERE id = ?',
            args: [userId]
        });

        if (userResult.rows.length === 0 || !userResult.rows[0].refreshToken) {
            return json({ error: 'No refresh token available. User must re-login.' }, { status: 401 });
        }

        const refreshToken = userResult.rows[0].refreshToken;

        // Request new access token from Google
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: env.GOOGLE_CLIENT_SECRET,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            })
        });

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok) {
            console.error("Token Refresh Error:", tokenData);
            return json({ error: tokenData.error_description || 'Refresh failed' }, { status: 401 });
        }

        const { access_token, id_token } = tokenData;

        // Extend session validity
        const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // Extend by 30 days
        await turso.execute({
            sql: 'UPDATE sessions SET expiresAt = ? WHERE id = ?',
            args: [expiresAt, sessionToken]
        });

        return json({
            message: 'Session refreshed',
            sessionToken: sessionToken,
            googleAccessToken: access_token,
            userProfile: {
                id: userId,
                name: userResult.rows[0].name,
                email: userResult.rows[0].email,
                picture: userResult.rows[0].picture
            }
        });

    } catch (e) {
        console.error('Refresh Token Error:', e);
        return json({ error: e.message }, { status: 500 });
    }
}
