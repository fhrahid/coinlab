import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import SiteHeader from '../../components/SiteHeader';
import { getCollection } from '../../lib/content';

export const revalidate = 10;
export default async function WingsPage() {
  const wings = await getCollection('wings');
  return <><SiteHeader /><main className="inner-page"><div className="container page-hero"><p className="eyebrow dark"><span className="eyebrow-dot" /> Research wings</p><h1>Five lenses on<br /><em>what matters.</em></h1><p>Explore the research areas that make up COiN Lab.</p></div><div className="container wing-directory">{wings.map((wing) => <Link className="wing-directory-card" href={`/wings/${wing.slug}`} key={wing.slug}><span>{wing.number}</span><h2>{wing.title}</h2><p>{wing.description}</p><ArrowUpRight /></Link>)}</div></main></>;
}
