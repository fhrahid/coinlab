import Link from 'next/link';
import { Users } from 'lucide-react';
import SiteHeader from '../../components/SiteHeader';
import { getCollection, mediaUrl } from '../../lib/content';
import { labRoles, peopleTiers, roleTier } from '../../lib/roles';

export const revalidate = 10;

export default async function PeoplePage() {
  const people = await getCollection('people');
  const initials = (name) => name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  const tiers = peopleTiers
    .map((tier) => ({ ...tier, members: people.filter((person) => roleTier(person.role).key === tier.key).sort((a, b) => (labRoles.indexOf(a.role) - labRoles.indexOf(b.role)) || a.name.localeCompare(b.name)) }))
    .filter((tier) => tier.members.length);
  return <><SiteHeader /><main className="inner-page"><div className="container page-hero"><p className="eyebrow dark"><span className="eyebrow-dot" /> People</p><h1>The people<br /><em>behind the work.</em></h1><p>COiN Lab grows through people who share ideas, build carefully, and help each other learn.</p></div>
    {tiers.length ? <div className="container people-hierarchy">{tiers.map((tier, index) => <section className={`people-tier tier-${tier.key}`} key={tier.key}><div className="tier-head"><span className="tier-index">0{index + 1}</span><h2 className="tier-title">{tier.label}</h2><span className="tier-count">{tier.members.length} {tier.members.length === 1 ? 'person' : 'people'}</span></div><div className="tier-row">{tier.members.map((person) => <Link className="person-card" href={`/people/${person.slug}`} key={person.slug}><div className="person-photo">{mediaUrl(person.photoKey) ? <img alt={person.name} src={mediaUrl(person.photoKey)} /> : initials(person.name)}</div><div className="person-meta"><strong>{person.name}</strong><span>{person.role}</span></div></Link>)}</div></section>)}</div>
    : <div className="container content-empty"><Users size={22} /><strong>People profiles are being added.</strong><span>Visit again soon to meet the researchers behind COiN Lab.</span></div>}
  </main></>;
}
