import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import SiteHeader from '../../components/SiteHeader';
import { getCollection, mediaUrl } from '../../lib/content';
export const revalidate = 10;
export default async function PeoplePage() { const people = await getCollection('people'); return <><SiteHeader /><main className="inner-page"><div className="container page-hero"><p className="eyebrow dark"><span className="eyebrow-dot" /> People</p><h1>The people<br /><em>behind the work.</em></h1><p>COiN Lab grows through people who share ideas, build carefully, and help each other learn.</p></div><div className="container people-directory">{people.map((person) => <Link href={`/people/${person.slug}`} className="directory-person" key={person.slug}><div className="avatar-placeholder">{mediaUrl(person.photoKey) ? <img alt={person.name} src={mediaUrl(person.photoKey)} /> : person.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</div><div><strong>{person.name}</strong><span>{person.role}</span></div><ArrowUpRight /></Link>)}</div></main></>; }
