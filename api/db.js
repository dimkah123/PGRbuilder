import { createClient } from '@libsql/client';

let _client = null;

export function getTurso() {
    if (!_client) {
        if (!process.env.TURSO_DATABASE_URL) {
            throw new Error('TURSO_DATABASE_URL is not set. Configure it in Vercel Environment Variables.');
        }
        _client = createClient({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN
        });
    }
    return _client;
}

export function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}
