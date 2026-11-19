import { cache } from "react";
import { seedRoles } from "./roles";

export const seedWings = [
  {
    slug: "ai-in-healthcare",
    number: "01",
    title: "AI in Healthcare",
    shortTitle: "Healthcare",
    description:
      "Building intelligent tools for diagnosis, biomedical discovery, clinical decision support, and digital health.",
    longDescription:
      "Our healthcare wing applies computational intelligence to medical and biomedical challenges. We work across imaging, signals, predictive analytics, health informatics, and responsible AI to support better decisions and better care.",
    focusPoints: [
      "Medical image analysis",
      "Disease prediction and diagnosis",
      "Biomedical signal processing",
      "Clinical decision-support systems",
      "Explainable and responsible AI",
    ],
  },
  {
    slug: "financial-technology",
    number: "02",
    title: "Financial Technology",
    shortTitle: "FinTech",
    description:
      "Using data and intelligence to make financial systems more secure, transparent, and useful.",
    longDescription:
      "The FinTech wing studies intelligent systems for financial services and decision-making. Our work spans forecasting, risk, fraud, financial language analytics, and responsible automation.",
    focusPoints: [
      "Financial forecasting",
      "Credit risk assessment",
      "Fraud detection",
      "Financial NLP and sentiment analysis",
      "Portfolio and investment analytics",
    ],
  },
  {
    slug: "networking-and-security",
    number: "03",
    title: "AI in Networking & Security",
    shortTitle: "Networking & Security",
    description:
      "Designing intelligent, resilient, and secure networks for an increasingly connected world.",
    longDescription:
      "This wing explores computational intelligence for network management, threat detection, IoT, and secure communications. We combine systems thinking with learning-based methods to make connected infrastructure more adaptive.",
    focusPoints: [
      "Intelligent network management",
      "Traffic analysis and prediction",
      "Intrusion and anomaly detection",
      "IoT and edge security",
      "Next-generation communication networks",
    ],
  },
  {
    slug: "smart-agriculture",
    number: "04",
    title: "Smart Agriculture",
    shortTitle: "Smart Agriculture",
    description:
      "Turning sensing, prediction, and AI into practical tools for resilient agriculture.",
    longDescription:
      "Our smart agriculture research connects AI, IoT, computer vision, and environmental data. We focus on tools that help growers and decision-makers use resources more effectively while responding to climate and crop challenges.",
    focusPoints: [
      "Crop disease detection",
      "Crop yield prediction",
      "Precision agriculture",
      "Smart irrigation",
      "Agricultural image and sensor analytics",
    ],
  },
  {
    slug: "natural-language-processing",
    number: "05",
    title: "Natural Language Processing",
    shortTitle: "NLP",
    description:
      "Helping machines understand and communicate across Bangla, low-resource languages, and beyond.",
    longDescription:
      "The NLP wing works on the computational understanding and generation of human language. We are especially interested in Bangla and low-resource settings, where useful systems require careful data, evaluation, and context.",
    focusPoints: [
      "Bangla and low-resource language processing",
      "Large language models",
      "Machine translation",
      "Sentiment and text analytics",
      "Conversational AI and question answering",
    ],
  },
];

export const seedPeople = [
  {
    slug: "prof-akm-masum",
    name: "Prof. A. K. M. Masum, PhD",
    role: "In-Charge, COiN Lab",
    type: "leadership",
    bio: "Leads the lab’s research direction, collaborations, and day-to-day research activities.",
    wingSlugs: [],
  },
];

export const seedPapers = [];

export const seedPartners = [
  {
    slug: "uiu",
    number: "01",
    abbr: "UIU",
    name: "United International University",
    logoUrl: "",
  },
  {
    slug: "iut",
    number: "02",
    abbr: "IUT",
    name: "Islamic University of Technology",
    logoUrl: "",
  },
  {
    slug: "diu",
    number: "03",
    abbr: "DIU",
    name: "Daffodil International University",
    logoUrl: "",
  },
  {
    slug: "iiuc",
    number: "04",
    abbr: "IIUC",
    name: "International Islamic University Chittagong",
    logoUrl: "",
  },
];

export function mediaUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (!process.env.CLOUDINARY_CLOUD_NAME) return "";
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${value}`.replace(
    /([^:]\/)\/+/g,
    "$1",
  );
}

// How each collection is ordered when read. The fields match the indexes
// created in lib/mongodb.js, so the database sorts without scanning.
const sorts = {
  wings: { number: 1 },
  people: { name: 1 },
  papers: { featured: -1, year: -1 },
  partners: { number: 1 },
  slides: { number: 1 },
  jobs: { postedAt: -1 },
  roles: { serial: 1, name: 1 },
};

// Shown when there is no database (local development, build without access).
const seeds = {
  wings: seedWings,
  people: seedPeople,
  papers: seedPapers,
  partners: seedPartners,
  roles: seedRoles,
};

const asList = (value, separator) =>
  (Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(separator)
      : []
  )
    .map((v) => String(v).trim())
    .filter(Boolean);

// Records edited by hand in Atlas (or saved by older CMS versions) may store
// list fields as strings or omit them; the pages call .map/.join on them.
function normalize(item) {
  const out = { ...item };
  if ("focusPoints" in out) out.focusPoints = asList(out.focusPoints, "\n");
  if ("requirements" in out) out.requirements = asList(out.requirements, "\n");
  if ("authors" in out) out.authors = asList(out.authors, ",");
  if ("wingSlugs" in out) out.wingSlugs = asList(out.wingSlugs, ",");
  for (const key of ["updatedAt", "postedAt"])
    if (out[key] instanceof Date) out[key] = out[key].toISOString();
  return out;
}

// Equality filters only, with MongoDB's rule that a value matches an array
// field when the array contains it. Lets seed data answer the same queries.
const matches = (item, filter) =>
  Object.entries(filter).every(([key, value]) =>
    Array.isArray(item[key]) ? item[key].includes(value) : item[key] === value,
  );
const pick = (item, fields) =>
  fields
    ? Object.fromEntries(
        fields
          .filter((field) => field in item)
          .map((field) => [field, item[field]]),
      )
    : item;

/**
 * The one function that reads content. Every query names what it needs:
 *   filter  equality filter, e.g. { slug } or { wingSlugs: slug }
 *   fields  list of fields to return (omit for the whole record)
 *   limit   maximum number of records
 * Falls back to seed data when no database is configured, and during
 * `next build` if the database cannot be reached.
 */
async function read(collection, { filter = {}, fields, limit = 0 } = {}) {
  if (!sorts[collection]) return [];
  const fromSeeds = () => {
    const found = (seeds[collection] || [])
      .filter((item) => matches(item, filter))
      .map((item) => pick(item, fields));
    return limit ? found.slice(0, limit) : found;
  };
  if (!process.env.MONGODB_URI) return fromSeeds();
  try {
    const { getDb } = await import("./mongodb");
    const db = await getDb();
    const projection = {
      _id: 0,
      ...(fields ? Object.fromEntries(fields.map((field) => [field, 1])) : {}),
    };
    const cursor = db
      .collection(collection)
      .find(filter, { projection })
      .sort(sorts[collection]);
    if (limit) cursor.limit(limit);
    const items = await cursor.toArray();
    // Roles fall back to the built-in list until the first one is saved.
    if (collection === "roles" && !items.length) return fromSeeds();
    return items.map(normalize);
  } catch (error) {
    // During `next build` the database may be unreachable (CI, Docker build
    // stage, Atlas IP allow-list). Prerender from the seeds instead of failing
    // the build; pages revalidate every 10 s and pick up real data at runtime.
    // At runtime the error is rethrown so ISR keeps serving the last good page.
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.warn(
        `[content] ${collection}: database unavailable during build, using seed content (${error.message})`,
      );
      return fromSeeds();
    }
    throw error;
  }
}

const split = (csv) => (csv ? csv.split(",") : undefined);

/*
 * Public query functions. They take plain strings and numbers (not option
 * objects) so React cache() can recognise a repeated call: a page, its layout
 * and its metadata asking for the same thing share one database query.
 */

// Every field of every record. For the CMS and for small collections.
export const getCollection = cache((collection) => read(collection));

// Selected fields of every record: getList("people", "slug,name,role").
export const getList = cache((collection, fields) =>
  read(collection, { fields: split(fields) }),
);

// One record by slug (indexed lookup), or undefined.
export const getRecord = cache(
  async (collection, slug) =>
    (await read(collection, { filter: { slug }, limit: 1 }))[0],
);

// Records attached to a research wing: getByWing("people", slug, "slug,name").
export const getByWing = cache((collection, wingSlug, fields) =>
  read(collection, { filter: { wingSlugs: wingSlug }, fields: split(fields) }),
);

// How many people and papers each wing has: { [wingSlug]: { people, papers } }.
export const getWingCounts = cache(async () => {
  const counts = {};
  const add = (kind, slug, n) => {
    (counts[slug] ||= { people: 0, papers: 0 })[kind] += n;
  };
  const fromSeeds = () => {
    for (const kind of ["people", "papers"])
      for (const item of seeds[kind])
        for (const slug of asList(item.wingSlugs, ",")) add(kind, slug, 1);
    return counts;
  };
  if (!process.env.MONGODB_URI) return fromSeeds();
  try {
    const { getDb } = await import("./mongodb");
    const db = await getDb();
    // Counted inside the database; no documents are sent to the server.
    const group = [
      { $unwind: "$wingSlugs" },
      { $group: { _id: "$wingSlugs", n: { $sum: 1 } } },
    ];
    const [people, papers] = await Promise.all(
      ["people", "papers"].map((kind) =>
        db.collection(kind).aggregate(group).toArray(),
      ),
    );
    for (const row of people) add("people", row._id, row.n);
    for (const row of papers) add("papers", row._id, row.n);
    return counts;
  } catch (error) {
    if (process.env.NEXT_PHASE === "phase-production-build") return fromSeeds();
    throw error;
  }
});

// Number of records in a collection, without fetching them.
export const getCount = cache(async (collection) => {
  if (!sorts[collection]) return 0;
  if (!process.env.MONGODB_URI) return (seeds[collection] || []).length;
  try {
    const { getDb } = await import("./mongodb");
    return await (await getDb()).collection(collection).countDocuments();
  } catch (error) {
    if (process.env.NEXT_PHASE === "phase-production-build")
      return (seeds[collection] || []).length;
    throw error;
  }
});

const PAPER_FIELDS = [
  "slug",
  "title",
  "authors",
  "year",
  "venue",
  "type",
  "featured",
  "doi",
  "pdfKey",
  "codeUrl",
  "wingSlugs",
];

/**
 * Papers shaped for display (author profile links, wing names, resolved file
 * links), featured first, then newest.
 *   wing   only papers of this wing ("" for all)
 *   limit  at most this many (0 for all); applied in the database
 */
export const getPublications = cache(async (wing = "", limit = 0) => {
  const [
    { nameKey, sortPapers, toPublication },
    { doiUrl },
    papers,
    people,
    wings,
  ] = await Promise.all([
    import("./publications"),
    import("./media"),
    read("papers", {
      filter: wing ? { wingSlugs: wing } : {},
      fields: PAPER_FIELDS,
      limit,
    }),
    getList("people", "slug,name"),
    getList("wings", "slug,title,shortTitle"),
  ]);
  const lookup = {
    people: new Map(
      people
        .filter((person) => person.slug)
        .map((person) => [nameKey(person.name), person.slug]),
    ),
    wings: new Map(
      wings.map((wing) => [wing.slug, wing.shortTitle || wing.title]),
    ),
    pdf: mediaUrl,
    doi: doiUrl,
  };
  return sortPapers(papers).map((paper) => toPublication(paper, lookup));
});
