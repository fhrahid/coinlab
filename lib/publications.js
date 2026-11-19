// Shapes CMS paper records for display. Dependency-free on purpose so it can
// run on the server, in the browser and under `node --test`.

const HONORIFICS = /\b(prof|professor|dr|md|mr|mrs|ms|engr|phd)\b\.?/g;

// "Prof. A. K. M. Masum, PhD" and "a k m masum" compare equal.
export function nameKey(name) {
  return String(name || "")
    .toLowerCase()
    .replace(HONORIFICS, " ")
    .replace(/[^\p{L}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Featured papers first, then newest first.
export function sortPapers(papers) {
  return [...papers].sort(
    (a, b) =>
      Number(b.featured === true) - Number(a.featured === true) ||
      (Number(b.year) || 0) - (Number(a.year) || 0),
  );
}

/**
 * @param paper   CMS record
 * @param lookup  { people: Map<nameKey, slug>, wings: Map<slug, title>, pdf: (key) => url, doi: (doi) => url }
 */
export function toPublication(paper, { people, wings, pdf, doi }) {
  return {
    slug: paper.slug,
    title: paper.title,
    year: paper.year,
    venue: paper.venue || "",
    type: paper.type || "",
    abstract: paper.abstract || "",
    featured: paper.featured === true,
    // Authors who are lab members link to their profile.
    authors: (paper.authors || []).map((name) => {
      const slug = people.get(nameKey(name));
      return slug ? { name, href: `/people/${slug}` } : { name };
    }),
    wings: (paper.wingSlugs || [])
      .map((slug) => ({ slug, title: wings.get(slug) }))
      .filter((wing) => wing.title),
    doiHref: paper.doi ? doi(paper.doi) : "",
    pdfHref: pdf(paper.pdfKey) || "",
    codeHref: /^https?:\/\//i.test(paper.codeUrl || "") ? paper.codeUrl : "",
  };
}
