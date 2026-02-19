import { createClient } from '@libsql/client';
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from '$env/static/private';

let _client = null;

export function getTurso() {
    if (!_client) {
        if (!TURSO_DATABASE_URL) {
            throw new Error('TURSO_DATABASE_URL is not set in environment variables.');
        }
        _client = createClient({
            url: TURSO_DATABASE_URL,
            authToken: TURSO_AUTH_TOKEN
        });
    }
    return _client;
}
