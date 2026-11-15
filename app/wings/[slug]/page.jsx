import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, BookOpen, Users } from 'lucide-react';
import SiteHeader from '../../../components/SiteHeader';
import { getCollection, getPapersForWing, getPeopleForWing, getWing, mediaUrl } from '../../../lib/content';

export const revalidate = 10;
export async function generateStaticParams() { return (await getCollection('wings')).filter((wing) => wing.slug).map((wing) => ({ slug: wing.slug })); }

export default async function WingPage({ params }) {
  const wing = await getWing(params.slug);
  if (!wing) return <><SiteHeader /><main className="inner-page"><div className="container page-hero"><h1>Wing not found</h1></div></main></>;
  const [people, papers] = await Promise.all([getPeopleForWing(params.slug), getPapersForWing(params.slug)]);
  return <><SiteHeader /><main className="inner-page wing-page"><div className="container wing-page-hero"><Link className="back-link" href="/wings"><ArrowLeft size={15} /> All research wings</Link><div className="wing-page-number">{wing.number}</div><p className="eyebrow dark"><span className="eyebrow-dot" /> Research wing</p><h1>{wing.title}</h1><p className="wing-lede">{wing.longDescription}</p>{mediaUrl(wing.coverKey) && <img alt={`${wing.title} cover`} className="wing-cover" src={mediaUrl(wing.coverKey)} />}</div><section className="container wing-content"><div className="wing-focus"><p className="eyebrow dark"><span className="eyebrow-dot" /> Focus areas</p><h2>Questions we<br /><em>are exploring.</em></h2><ul>{wing.focusPoints.map((point) => <li key={point}>{point}</li>)}</ul></div><div className="wing-data"><section><div className="section-mini-title"><Users size={18} /> People in this wing</div>{people.length ? people.map((person) => <Link href={`/people/${person.slug}`} className="person-row" key={person.slug}><div className="avatar-placeholder">{person.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</div><div><strong>{person.name}</strong><span>{person.role}</span></div><ArrowUpRight size={16} /></Link>) : <p className="empty-state">People will be added as the wing grows.</p>}</section><section><div className="section-mini-title"><BookOpen size={18} /> Relevant papers</div>{papers.length ? papers.map((paper) => <article className="paper-row" key={paper.slug}><div><strong>{paper.title}</strong><span>{paper.authors.join(', ')} · {paper.year} · {paper.venue}</span></div>{paper.doi && <a href={paper.doi} target="_blank" rel="noreferrer"><ArrowUpRight size={16} /></a>}</article>) : <p className="empty-state">Publications will be added as research is published.</p>}</section></div></section></main></>;
}
