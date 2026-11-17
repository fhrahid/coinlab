// Client-safe description of the CMS collections: labels, blank records and
// which field holds the uploaded file. Shared by every admin component.
export const collections = {
  wings: {
    label: "Research wings",
    singular: "wing",
    mediaField: "coverKey",
    mediaLabel: "Cover image",
    accept: "image/*",
  },
  people: {
    label: "People",
    singular: "person",
    mediaField: "photoKey",
    mediaLabel: "Photo",
    accept: "image/*",
  },
  papers: {
    label: "Papers",
    singular: "paper",
    mediaField: "pdfKey",
    mediaLabel: "PDF",
    accept: ".pdf,application/pdf",
  },
  partners: {
    label: "Partners",
    singular: "partner",
    mediaField: "logoUrl",
    mediaLabel: "Partner logo",
    accept: "image/*",
  },
  slides: {
    label: "Hero slideshow",
    singular: "slide",
    mediaField: "image",
    mediaLabel: "Slide image",
    accept: "image/*",
  },
  jobs: { label: "Job postings", singular: "job" },
  roles: { label: "Roles", singular: "role" },
};

export const collectionKeys = Object.keys(collections);

export const jobTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Volunteer",
];

export const jobLocations = [
  "On-site · Dhaka, Bangladesh",
  "Hybrid · Dhaka, Bangladesh",
  "Remote",
];

export const paperTypes = ["Journal", "Conference", "Preprint", "Thesis"];

export const slideGravities = [
  "auto",
  "center",
  "north",
  "south",
  "east",
  "west",
  "north_west",
  "north_east",
  "south_west",
  "south_east",
];

export function emptyRecord(collection) {
  switch (collection) {
    case "wings":
      return {
        slug: "",
        number: "",
        title: "",
        shortTitle: "",
        description: "",
        longDescription: "",
        focusPoints: "",
        coverKey: "",
      };
    case "people":
      return {
        slug: "",
        name: "",
        role: "Research Assistant",
        bio: "",
        wingSlugs: [],
        photoKey: "",
      };
    case "papers":
      return {
        slug: "",
        title: "",
        authors: "",
        year: new Date().getFullYear(),
        venue: "",
        abstract: "",
        doi: "",
        wingSlugs: [],
        pdfKey: "",
        type: paperTypes[0],
        featured: false,
        codeUrl: "",
      };
    case "partners":
      return { slug: "", number: "", abbr: "", name: "", logoUrl: "" };
    case "slides":
      return {
        slug: "",
        caption: "",
        number: "",
        image: "",
        active: true,
        transform: {
          gravity: "auto",
          x: 0,
          y: 0,
          zoom: 1,
          brightness: 0,
          contrast: 0,
          saturation: 0,
          dim: 0,
        },
      };
    case "jobs":
      return {
        slug: "",
        title: "",
        type: jobTypes[0],
        location: jobLocations[0],
        deadline: "",
        salary: "",
        summary: "",
        description: "",
        requirements: "",
        applyInfo: "",
        wingSlugs: [],
        active: true,
      };
    case "roles":
      return { slug: "", name: "", serial: "", tier: "" };
    default:
      return {};
  }
}

// API records store lists as arrays; the form edits them as text.
export function toFormRecord(collection, item) {
  if (!item) return emptyRecord(collection);
  return {
    ...emptyRecord(collection),
    ...item,
    ...("focusPoints" in item || collection === "wings"
      ? {
          focusPoints: Array.isArray(item.focusPoints)
            ? item.focusPoints.join("\n")
            : item.focusPoints || "",
        }
      : {}),
    ...("requirements" in item || collection === "jobs"
      ? {
          requirements: Array.isArray(item.requirements)
            ? item.requirements.join("\n")
            : item.requirements || "",
        }
      : {}),
    // Blank serials are stored as null; the form field wants a string.
    ...("serial" in item ? { serial: item.serial ?? "" } : {}),
    ...("authors" in item || collection === "papers"
      ? {
          authors: Array.isArray(item.authors)
            ? item.authors.join(", ")
            : item.authors || "",
        }
      : {}),
    ...(collection === "people" ||
    collection === "papers" ||
    collection === "jobs"
      ? { wingSlugs: Array.isArray(item.wingSlugs) ? item.wingSlugs : [] }
      : {}),
  };
}

export function recordTitle(item) {
  return item?.title || item?.name || item?.caption || "";
}
