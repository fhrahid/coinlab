import Hero from "@/components/home/hero";
import { Contact, Method, Partners, People, RecentWork, Stats, Wings } from "@/components/home/sections";
import Showcase from "@/components/home/showcase";
import { getCollection, getCount, getList, getPublications, getWingCounts, mediaUrl } from "@/lib/content";
import { slideDeliveryUrl, thumbUrl } from "@/lib/media";
import { rankPeople } from "@/lib/roles";

export const revalidate = 10;

const byNumber = (a, b) => String(a.number || "").localeCompare(String(b.number || ""), undefined, { numeric: true });
// Display widths for the showcase photos; slideDeliveryUrl renders each at 2x.
const SLIDE_WIDTHS = [480, 800, 1200];

function showcaseSlide(slide) {
  const url = (w) => slideDeliveryUrl(slide.image, slide.transform, { w, h: Math.round(w * 0.5) });
  return {
    slug: slide.slug,
    caption: slide.caption,
    dim: slide.transform?.dim || 0,
    src: url(800),
    srcSet: SLIDE_WIDTHS.map((w) => `${url(w)} ${w * 2}w`).join(", "),
  };
}

export default async function HomePage() {
  // Each section asks only for what it shows: listed fields, five papers, and
  // totals counted in the database instead of whole collections.
  const [wings, people, roles, partners, slideRecords, publications, wingCounts, paperCount] = await Promise.all([
    getList("wings", "slug,number,title,shortTitle,description,focusPoints"),
    getList("people", "slug,name,role,photoKey"),
    getCollection("roles"),
    getList("partners", "slug,name,logoUrl"),
    getCollection("slides"),
    getPublications("", 5),
    getWingCounts(),
    getCount("papers"),
  ]);

  const slides = slideRecords.filter((slide) => slide.active !== false && slide.image).sort(byNumber).map(showcaseSlide);
  const featuredPeople = rankPeople(people, roles)
    .slice(0, 8)
    .map((person) => ({ slug: person.slug, name: person.name, role: person.role, photo: thumbUrl(mediaUrl(person.photoKey), 240) }));
  const stats = [
    { value: wings.length, label: "Research wings" },
    { value: paperCount, label: "Publications" },
    { value: people.length, label: "Researchers" },
    { value: partners.length, label: "Partner institutions" },
  ];

  return (
    <>
      <Hero wings={wings.map(({ slug }) => ({ slug }))} />
      <Partners partners={partners.map((partner) => ({ slug: partner.slug, name: partner.name, logo: thumbUrl(mediaUrl(partner.logoUrl), 280, { square: false }) }))} />
      <Wings counts={wingCounts} wings={wings} />
      <RecentWork publications={publications} />
      <Method />
      <Stats stats={stats} />
      <People people={featuredPeople} />
      {slides.length > 0 && <Showcase slides={slides} />}
      <Contact />
    </>
  );
}
