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

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id parameter' });

    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('builds');

        const build = await collection.findOne({ shortId: id });

        if (!build) {
            return res.status(404).json({ error: 'Сборка не найдена' });
        }

        res.status(200).json({ data: build.data });
    } catch (error) {
        console.error('Load error:', error);
        res.status(500).json({ error: error.message });
    }
}
