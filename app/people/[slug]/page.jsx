import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import SiteHeader from '../../../components/SiteHeader';
import { getCollection, mediaUrl } from '../../../lib/content';
import RichText from '../../../components/RichText';

export const revalidate = 10;
export async function generateStaticParams() { return (await getCollection('people')).filter((person) => person.slug).map((person) => ({ slug: person.slug })); }
export default async function PersonPage({ params }) {
  const person = (await getCollection('people')).find((item) => item.slug === params.slug);
  const wings = await getCollection('wings');
  if (!person) return <><SiteHeader /><main className="inner-page"><div className="container page-hero"><h1>Person not found</h1></div></main></>;
  return <><SiteHeader /><main className="inner-page profile-page"><div className="container profile-wrap"><Link className="back-link" href="/people"><ArrowLeft size={15} /> All people</Link><div className="profile-hero"><div className="profile-photo-card">{mediaUrl(person.photoKey) ? <img alt={person.name} className="profile-photo" src={mediaUrl(person.photoKey)} /> : <div className="profile-initials">{person.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</div>}<span className="profile-type-badge">{person.type || 'researcher'}</span></div><div className="profile-info"><p className="eyebrow dark"><span className="eyebrow-dot" /> COiN community</p><h1>{person.name}</h1><p className="profile-role">{person.role}</p>{person.bio && <RichText className="profile-bio" text={person.bio} />}<div className="profile-wings"><span>Research connection</span>{(person.wingSlugs || []).map((slug) => { const wing = wings.find((item) => item.slug === slug); return wing && <Link href={`/wings/${slug}`} key={slug}>{wing.title} <ArrowUpRight size={14} /></Link> })}{!(person.wingSlugs || []).length && <span className="profile-wings-empty">Works across the lab — wing connections coming soon.</span>}</div></div></div></div></main></>;
}
