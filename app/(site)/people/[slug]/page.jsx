import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, BookOpen, User } from "lucide-react";
import Crumbs from "@/components/site/crumbs";
import PublicationList from "@/components/site/publication-list";
import RichText from "@/components/site/rich-text";
import { Chip } from "@/components/site/typography";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getList, getPublications, getRecord, mediaUrl } from "@/lib/content";
import { thumbUrl } from "@/lib/media";

export const revalidate = 10;

const findPerson = (slug) => getRecord("people", slug);

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const person = await findPerson(slug);
  return person ? { title: person.name, description: `${person.name}, ${person.role} at COiN Lab.` } : {};
}

export async function generateStaticParams() {
  return (await getList("people", "slug")).filter((person) => person.slug).map((person) => ({ slug: person.slug }));
}

export default async function PersonPage({ params }) {
  const { slug } = await params;
  const [person, wings, allPublications] = await Promise.all([findPerson(slug), getList("wings", "slug,title,shortTitle"), getPublications()]);
  if (!person) notFound();
  const photo = thumbUrl(mediaUrl(person.photoKey), 320, { square: false });
  const personWings = (person.wingSlugs || []).map((wingSlug) => wings.find((wing) => wing.slug === wingSlug)).filter(Boolean);
  const publications = allPublications.filter((pub) => pub.authors.some((author) => author.href === `/people/${slug}`));

  return (
    <div className="relative isolate">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-[420px] dot-grid mask-[linear-gradient(to_bottom,black,transparent)] opacity-70" />
      <div className="wrap flex max-w-[1080px] flex-col gap-10 pt-32 pb-16 md:pt-40 md:pb-24">
        <Crumbs current={person.name} trail={[{ href: "/", label: "Home" }, { href: "/people", label: "People" }]} />
        <div className="grid items-start gap-10 md:grid-cols-[280px_minmax(0,1fr)] md:gap-14">
          <div className="bezel relative w-[min(240px,70vw)] animate-fade-up overflow-hidden rounded-3xl border md:w-full">
            {/* Avatar swaps to the icon when there is no photo or it fails to load. */}
            <Avatar className="aspect-4/5 size-auto w-full rounded-none after:hidden">
              {photo && <AvatarImage alt={person.name} className="aspect-auto rounded-none" src={photo} />}
              <AvatarFallback className="rounded-none bg-linear-to-br from-brand/25 to-brand-2/10 text-brand">
                <User aria-hidden="true" className="size-24" strokeWidth={1.25} />
              </AvatarFallback>
            </Avatar>
            <Badge className="label-caps absolute bottom-3 left-3 h-auto px-3 py-1">{person.type || "researcher"}</Badge>
          </div>
          <div className="flex min-w-0 animate-fade-up flex-col items-start gap-5 [animation-delay:80ms]">
            <Chip dot>{person.role}</Chip>
            <h1 className="display-heading">{person.name}</h1>
            {person.bio && <RichText className="max-w-[640px] text-base text-muted-foreground md:text-lg" text={person.bio} />}
            <div className="flex w-full flex-wrap items-center gap-2 border-t pt-5">
              <span className="label-caps mr-2 text-muted-foreground">Research wings</span>
              {personWings.map((wing) => (
                <Button asChild key={wing.slug} variant="outline">
                  <Link href={`/wings/${wing.slug}`}>{wing.shortTitle || wing.title} <ArrowUpRight data-icon="inline-end" /></Link>
                </Button>
              ))}
              {!personWings.length && <span className="text-sm text-muted-foreground">Works across the lab.</span>}
            </div>
          </div>
        </div>
        {publications.length > 0 && (
          <section aria-labelledby="person-papers" className="flex flex-col gap-5">
            <Chip id="person-papers"><BookOpen aria-hidden="true" /> Publications</Chip>
            <PublicationList publications={publications} />
          </section>
        )}
      </div>
    </div>
  );
}
