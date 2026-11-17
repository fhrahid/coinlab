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
    bio: "Leads the lab’s research direction, collaborations, and day-to-day research activities at Southeast University.",
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

export async function getCollection(collection) {
  if (
    !["wings", "people", "papers", "partners", "slides", "jobs"].includes(
      collection,
    )
  )
    return [];
  const seeds =
    collection === "wings"
      ? seedWings
      : collection === "people"
        ? seedPeople
        : collection === "partners"
          ? seedPartners
          : [];
  if (!process.env.MONGODB_URI) return seeds;
  try {
    const { getDb } = await import("./mongodb");
    const db = await getDb();
    const items = await db
      .collection(collection)
      .find({})
      .sort(
        collection === "papers"
          ? { year: -1 }
          : collection === "jobs"
            ? { postedAt: -1 }
            : { number: 1, name: 1 },
      )
      .toArray();
    return items.map(({ _id, ...item }) => normalize(item));
  } catch (error) {
    // During `next build` the database may be unreachable (CI, Docker build
    // stage, Atlas IP allow-list). Prerender from the seeds instead of failing
    // the build; pages revalidate every 10 s and pick up real data at runtime.
    // At runtime the error is rethrown so ISR keeps serving the last good page.
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.warn(
        `[content] ${collection}: database unavailable during build, using seed content (${error.message})`,
      );
      return seeds;
    }
    throw error;
  }
}

// Records edited by hand in Atlas (or saved by older CMS versions) may store
// list fields as strings or omit them; the pages call .map/.join on them.
const asList = (value, separator) =>
  (Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(separator)
      : []
  )
    .map((v) => String(v).trim())
    .filter(Boolean);
function normalize(item) {
  const out = { ...item };
  if ("focusPoints" in out) out.focusPoints = asList(out.focusPoints, "\n");
  if ("authors" in out) out.authors = asList(out.authors, ",");
  if ("wingSlugs" in out) out.wingSlugs = asList(out.wingSlugs, ",");
  if (out.updatedAt instanceof Date)
    out.updatedAt = out.updatedAt.toISOString();
  return out;
}

export async function getWing(slug) {
  return (await getCollection("wings")).find((item) => item.slug === slug);
}
export async function getPeopleForWing(slug) {
  return (await getCollection("people")).filter((item) =>
    item.wingSlugs?.includes(slug),
  );
}
export async function getPapersForWing(slug) {
  return (await getCollection("papers")).filter((item) =>
    item.wingSlugs?.includes(slug),
  );
}
