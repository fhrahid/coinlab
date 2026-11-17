import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import RichText from "@/components/site/rich-text";
import { Eyebrow } from "@/components/site/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getCollection, mediaUrl } from "@/lib/content";
import { initials } from "@/lib/media";

export const revalidate = 10;

async function findPerson(slug) {
  return (await getCollection("people")).find((item) => item.slug === slug);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const person = await findPerson(slug);
  return person ? { title: person.name } : {};
}

export async function generateStaticParams() {
  return (await getCollection("people"))
    .filter((person) => person.slug)
    .map((person) => ({ slug: person.slug }));
}

export default async function PersonPage({ params }) {
  const { slug } = await params;
  const [person, wings] = await Promise.all([
    findPerson(slug),
    getCollection("wings"),
  ]);
  if (!person) notFound();
  const photo = mediaUrl(person.photoKey);
  const personWings = (person.wingSlugs || [])
    .map((wingSlug) => wings.find((wing) => wing.slug === wingSlug))
    .filter(Boolean);

  return (
    <div className="min-h-full bg-surface pb-24">
      <div className="wrap max-w-[980px] pt-6 md:pt-8">
        <Button asChild className="-ml-2.5 text-brand" variant="ghost">
          <Link href="/people">
            <ArrowLeft data-icon="inline-start" /> All people
          </Link>
        </Button>
        <div className="mt-8 grid items-start gap-10 md:mt-10 md:grid-cols-[264px_minmax(0,1fr)] md:gap-12">
          <div className="relative w-[min(220px,66vw)] md:w-[264px]">
            {photo ? (
              <img
                alt={person.name}
                className="aspect-4/5 w-full border bg-card object-cover shadow-[14px_14px_0_var(--sky)]"
                src={photo}
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex aspect-4/5 w-full items-center justify-center border bg-navy text-[54px] font-extrabold tracking-[-0.05em] text-white shadow-[14px_14px_0_var(--sky)]"
              >
                {initials(person.name)}
              </div>
            )}
            <Badge className="label-caps absolute bottom-0 left-0 h-auto px-3 py-2 text-[0.5625rem]">
              {person.type || "researcher"}
            </Badge>
          </div>
          <div className="min-w-0">
            <Eyebrow>COiN community</Eyebrow>
            <h1 className="mt-3 mb-3.5 text-[clamp(2.25rem,5.5vw,3.875rem)] leading-[1.02] font-extrabold tracking-[-0.06em] text-balance">
              {person.name}
            </h1>
            <p className="label-caps text-brand">{person.role}</p>
            {person.bio && (
              <RichText
                className="mt-5 max-w-[650px] text-[15px] text-[#4d5a7c] md:text-base"
                text={person.bio}
              />
            )}
            <Separator className="mt-9 mb-4 bg-[#c9d3ea]" />
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="label-caps mr-1 text-[0.5625rem] text-muted-foreground">
                Research connection
              </span>
              {personWings.map((wing) => (
                <Button
                  asChild
                  className="bg-card"
                  key={wing.slug}
                  variant="outline"
                >
                  <Link href={`/wings/${wing.slug}`}>
                    {wing.title} <ArrowUpRight data-icon="inline-end" />
                  </Link>
                </Button>
              ))}
              {!personWings.length && (
                <span className="text-xs text-muted-foreground">
                  Works across the lab — wing connections coming soon.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
