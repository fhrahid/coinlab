import Hero from "@/components/home/hero";
import {
  Contact,
  Impact,
  Intro,
  Partners,
  People,
  Wings,
} from "@/components/home/sections";
import { getCollection, mediaUrl } from "@/lib/content";
import { slideDeliveryUrl } from "@/lib/media";

export const revalidate = 10;

const byNumber = (a, b) =>
  String(a.number || "").localeCompare(String(b.number || ""), undefined, {
    numeric: true,
  });

export default async function HomePage() {
  const [wings, people, partners, slideRecords] = await Promise.all([
    getCollection("wings"),
    getCollection("people"),
    getCollection("partners"),
    getCollection("slides"),
  ]);

  // Only the fields each section renders are passed down, with media URLs
  // already resolved on the server.
  const slides = slideRecords
    .filter((slide) => slide.active !== false && slide.image)
    .sort(byNumber)
    .map((slide) => ({
      slug: slide.slug,
      caption: slide.caption,
      dim: slide.transform?.dim || 0,
      url: slideDeliveryUrl(slide.image, slide.transform),
    }));
  const partnerItems = partners.map((partner) => ({
    slug: partner.slug,
    name: partner.name,
    logo: mediaUrl(partner.logoUrl),
  }));
  const featuredPeople = people
    .slice(0, 4)
    .map((person) => ({
      slug: person.slug,
      name: person.name,
      role: person.role,
      photo: mediaUrl(person.photoKey),
    }));
  const stats = [
    { value: wings.length, label: "Research wings" },
    { value: partners.length, label: "Partner institutions" },
    { value: 4, label: "Collaborating countries" },
  ];

  return (
    <>
      <Hero slides={slides} />
      <Intro />
      <Partners partners={partnerItems} />
      <Wings wings={wings} />
      <Impact stats={stats} />
      <People people={featuredPeople} />
      <Contact />
    </>
  );
}
