export function parseCitation(raw) {
  const text = (raw || '').replace(/\s+/g, ' ').trim();
  const out = { authors: '', year: '', title: '', venue: '', doi: '', missing: [] };
  if (!text) { out.missing = ['citation text']; return out; }

  const doiMatch = text.match(/10\.\d{4,9}\/[^\s"'<>]+/i);
  if (doiMatch) out.doi = doiMatch[0].replace(/[.,;)\]]+$/, '');

  const yearMatch = text.match(/\(\s*((?:19|20)\d{2})[a-z]?\s*\)/) || text.match(/\b((?:19|20)\d{2})\b/);
  if (yearMatch) out.year = Number(yearMatch[1]);

  const cleanVenue = (value) => {
    let v = value.replace(/https?:\/\/\S+/g, '').replace(/10\.\d{4,9}\/\S+/g, '').replace(/doi:/gi, '');
    for (let i = 0; i < 3; i++) v = v
      .replace(/[,.\s]+$/, '')
      .replace(/,\s*(?:19|20)\d{2}\b.*$/i, '')
      .replace(/,?\s*(?:vol|no|iss)\.\s*[\d()]+\s*/gi, '')
      .replace(/,?\s*(?:pp?\.|pages)\s*[\d\u2013-]+.*$/i, '')
      .replace(/,\s*\d+(?:\(\d+\))?(?:\s*,\s*[\d\u2013-]+)?\s*$/, '');
    return v.replace(/arxiv\s*:?\s*\d{4}\.\d{4,5}/i, 'arXiv');
  };

  const stripAuthors = (value) => value
    .replace(/\(\s*((?:19|20)\d{2})[a-z]?\s*\)/, '')
    .replace(/^(?:by|authors?)\s*[:\-]\s*/i, '')
    .replace(/[,;:]+$/, '')
    .replace(/[.\s]+$/, '');

  let title = '';
  let authors = '';
  let venue = '';

  const quoted = text.match(/["\u201C\u2018']([^"\u201D\u2018']{12,})["\u201D']/);
  const yearBlock = text.match(/^(.+?)\s*\(\s*((?:19|20)\d{2})[a-z]?\s*\)\s*[.,]\s*(.+)$/);

  if (quoted) {
    title = quoted[1];
    authors = text.slice(0, quoted.index);
    venue = text.slice(quoted.index + quoted[0].length).replace(/^[\s,.;]+/, '').replace(/^(?:in|at)\s+/i, '');
  } else if (yearBlock) {
    authors = yearBlock[1];
    const rest = yearBlock[3].split(/(?<=\.)\s+/);
    title = rest[0] || '';
    venue = rest.slice(1).join('. ');
  } else {
    const clean = text.replace(/https?:\/\/\S+/g, '').split(/(?<=\.)\s+/).map((s) => s.replace(/[.\s]+$/, '')).filter((s) => !/^\(?((?:19|20)\d{2})[a-z]?\)?$/.test(s));
    if (clean.length >= 3) { authors = clean[0]; title = clean[1]; venue = clean.slice(2).join('. '); }
    else if (clean.length === 2) { authors = clean[0]; title = clean[1]; }
  }

  if (/arxiv/i.test(text) && !venue) venue = 'arXiv';

  out.title = title.replace(/[,;:.\s]+$/, '');
  out.authors = stripAuthors(authors);
  out.venue = cleanVenue(venue);
  out.missing = [!out.title && 'title', !out.authors && 'authors', !out.year && 'year', !out.venue && 'venue'].filter(Boolean);
  return out;
}

export function slugify(value) {
  return (value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
}
