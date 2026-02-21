import { getTurso } from '$lib/server/db.js';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const CLIENT_ID = '64823134414-44hmn7s4ro6bhdu9ub82a5gi092pq0nj.apps.googleusercontent.com';

export async function POST({ request }) {
    try {
        const { code } = await request.json();
        if (!code) return json({ error: 'No code provided' }, { status: 400 });

        // Exchange code for tokens
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: CLIENT_ID,
                client_secret: env.GOOGLE_CLIENT_SECRET,
                redirect_uri: 'postmessage', // Used for GIS initCodeClient
                grant_type: 'authorization_code'
            })
        });

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok) {
            console.error("Token Exchange Error:", tokenData);
            throw new Error(tokenData.error_description || tokenData.error || 'Token exchange failed');
        }

        const { access_token, refresh_token, id_token, expires_in } = tokenData;

        // Verify id_token to get user info
        const idTokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`);
        if (!idTokenRes.ok) throw new Error('Failed to verify ID token');
        const userInfo = await idTokenRes.json();

        const userId = userInfo.sub;
        const turso = getTurso();

        // Upsert user
        if (refresh_token) {
            await turso.execute({
                sql: `INSERT INTO users (id, email, name, picture, refreshToken) 
                      VALUES (?, ?, ?, ?, ?) 
                      ON CONFLICT (id) DO UPDATE SET email=excluded.email, name=excluded.name, picture=excluded.picture, refreshToken=excluded.refreshToken`,
                args: [userId, userInfo.email, userInfo.name, userInfo.picture, refresh_token]
            });
        } else {
            await turso.execute({
                sql: `INSERT INTO users (id, email, name, picture) 
                      VALUES (?, ?, ?, ?) 
                      ON CONFLICT (id) DO UPDATE SET email=excluded.email, name=excluded.name, picture=excluded.picture`,
                args: [userId, userInfo.email, userInfo.name, userInfo.picture]
            });
        }

        // Create a new session
        const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days

        await turso.execute({
            sql: 'INSERT INTO sessions (id, userId, expiresAt) VALUES (?, ?, ?)',
            args: [sessionId, userId, expiresAt]
        });

        return json({
            sessionToken: sessionId,
            userProfile: {
                id: userId,
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture,
            }
        });

    } catch (e) {
        console.error('Google Auth Error:', e);
        return json({ error: e.message }, { status: 500 });
    }
}
