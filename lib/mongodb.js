import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = { maxPoolSize: 10 };
let client;
let clientPromise;

if (uri && process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) { client = new MongoClient(uri, options); global._mongoClientPromise = client.connect(); }
  clientPromise = global._mongoClientPromise;
} else if (uri) { client = new MongoClient(uri, options); clientPromise = client.connect(); }

export async function getDb() { if (!clientPromise) throw new Error('MONGODB_URI is not configured'); const connected = await clientPromise; return connected.db(process.env.MONGODB_DB || 'coinlab'); }
