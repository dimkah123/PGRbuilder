import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('pgr_builder');
    cachedClient = client;
    cachedDb = db;
    return { client, db };
}

function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', 'https://pgrbuilder.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { shortId, editToken, data } = req.body;

    if (!shortId || !editToken || !data) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('builds');

        const result = await collection.updateOne(
            { shortId: shortId, editToken: editToken },
            { $set: { data: data, lastUpdated: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(403).json({ error: 'Доступ запрещен: вы не владелец этой сборки' });
        }

        res.status(200).json({ success: true, message: 'Сборка обновлена' });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: error.message });
    }
}
