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

// Indexes behind every lookup and sort the app performs. Slugs are unique.
const unique = { unique: true };
const indexes = {
  wings: [[{ slug: 1 }, unique], [{ number: 1 }]],
  people: [[{ slug: 1 }, unique], [{ name: 1 }], [{ role: 1 }], [{ wingSlugs: 1 }]],
  papers: [[{ slug: 1 }, unique], [{ featured: -1, year: -1 }], [{ wingSlugs: 1 }]],
  partners: [[{ slug: 1 }, unique], [{ number: 1 }]],
  slides: [[{ slug: 1 }, unique], [{ number: 1 }]],
  jobs: [[{ slug: 1 }, unique], [{ postedAt: -1 }]],
  roles: [[{ slug: 1 }, unique], [{ serial: 1, name: 1 }]],
  messages: [[{ createdAt: -1 }]],
  applications: [[{ createdAt: -1 }]],
};

// Runs once per server process, in the background: createIndex is a no-op
// when the index exists. A failure (for example legacy duplicate slugs
// blocking a unique index) is logged and never takes the site down.
function ensureIndexes(db) {
  if (building || global._mongoIndexesReady) return;
  global._mongoIndexesReady = true;
  for (const [collection, specs] of Object.entries(indexes))
    for (const [keys, options] of specs)
      db.collection(collection)
        .createIndex(keys, options)
        .catch((error) =>
          console.warn(`[mongodb] index on ${collection} ${JSON.stringify(keys)} not created: ${error.message}`),
        );
}

export async function getDb() {
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (!global._mongoClientPromise) global._mongoClientPromise = connect();
  const client = await global._mongoClientPromise;
  const db = client.db(process.env.MONGODB_DB || "coinlab");
  ensureIndexes(db);
  return db;
}
