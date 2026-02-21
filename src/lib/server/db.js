import { createClient } from '@libsql/client';
import { env } from '$env/dynamic/private';

let _client = null;

export function getTurso() {
    if (!_client) {
        if (!env.TURSO_DATABASE_URL) {
            throw new Error('TURSO_DATABASE_URL is not set in environment variables.');
        }
        _client = createClient({
            url: env.TURSO_DATABASE_URL,
            authToken: env.TURSO_AUTH_TOKEN
        });
    }
    return _client;
}
