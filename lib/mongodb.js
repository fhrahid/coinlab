import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const building = process.env.NEXT_PHASE === "phase-production-build";
// Fail fast during `next build` so an unreachable database cannot stall the
// build for 30 s per page (content.js then falls back to seed data).
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: building ? 4000 : 15000,
};

// Cache the connection promise globally (survives hot reloads in development
// and is shared by every route in production). At runtime a failed connection
// attempt is cleared so the next request retries, instead of reusing a
// permanently rejected promise until the server restarts. During the build a
// failure is remembered, so the remaining pages fall back to seeds instantly.
function connect() {
  const promise = new MongoClient(uri, options).connect();
  promise.catch(() => {
    if (!building && global._mongoClientPromise === promise)
      global._mongoClientPromise = undefined;
  });
  return promise;
}

export async function getDb() {
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (!global._mongoClientPromise) global._mongoClientPromise = connect();
  const client = await global._mongoClientPromise;
  return client.db(process.env.MONGODB_DB || "coinlab");
}
