import { notFound } from "next/navigation";
import { BookOpen, Check, Users } from "lucide-react";
import Crumbs from "@/components/site/crumbs";
import PageHero from "@/components/site/page-hero";
import PersonRow from "@/components/site/person-row";
import PublicationList from "@/components/site/publication-list";
import { Chip } from "@/components/site/typography";
import { wingIcon } from "@/components/site/wing-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getByWing,
  getList,
  getPublications,
  getRecord,
  mediaUrl,
} from "@/lib/content";
import { thumbUrl } from "@/lib/media";

export const revalidate = 10;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const wing = await getRecord("wings", slug);
  return wing ? { title: wing.title, description: wing.description } : {};
}

export async function generateStaticParams() {
  return (await getList("wings", "slug"))
    .filter((wing) => wing.slug)
    .map((wing) => ({ slug: wing.slug }));
}

function EmptyNote({ children }) {
  return (
    <p className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
      {children}
    </p>
  );
}

export default async function WingPage({ params }) {
  const { slug } = await params;
  const wing = await getRecord("wings", slug);
  if (!wing) notFound();
  // Both lists are filtered by wing in the database.
  const [people, publications] = await Promise.all([
    getByWing("people", slug, "slug,name,role,photoKey"),
    getPublications(slug),
  ]);
  const cover = mediaUrl(wing.coverKey);
  const Icon = wingIcon(slug);

  return (
    <>
      <PageHero
        before={
          <Crumbs
            current={wing.shortTitle || wing.title}
            trail={[
              { href: "/", label: "Home" },
              { href: "/wings", label: "Research" },
            ]}
          />
        }
        chip={`Research wing ${wing.number || ""}`.trim()}
        title={wing.title}
      >
        {wing.longDescription || wing.description}
      </PageHero>

      <div className="wrap flex flex-col gap-14 py-12 md:py-16">
        {cover && (
          <img
            alt={`${wing.title} cover`}
            className="reveal max-h-[420px] w-full rounded-3xl border object-cover"
            src={cover}
          />
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
          <Card className="bezel reveal rounded-3xl lg:sticky lg:top-32 lg:self-start">
            <CardHeader>
              <span className="mb-2 flex size-11 items-center justify-center rounded-full border bg-muted text-brand">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <CardTitle className="text-xl font-semibold tracking-tight">
                Focus areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3">
                {(wing.focusPoints || []).map((point) => (
                  <li
                    className="flex gap-3 text-sm leading-relaxed"
                    key={point}
                  >
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-brand"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <section
            aria-labelledby="wing-people"
            className="flex flex-col gap-5"
          >
            <Chip id="wing-people">
              <Users aria-hidden="true" /> People in this wing
            </Chip>
            {people.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {people.map((person) => (
                  <PersonRow
                    key={person.slug}
                    person={person}
                    photo={thumbUrl(mediaUrl(person.photoKey), 40)}
                  />
                ))}
              </div>
            ) : (
              <EmptyNote>People will be added as the wing grows.</EmptyNote>
            )}
          </section>
        </div>

        <section aria-labelledby="wing-papers" className="flex flex-col gap-5">
          <Chip id="wing-papers">
            <BookOpen aria-hidden="true" /> Publications from this wing
          </Chip>
          {publications.length ? (
            <PublicationList publications={publications} />
          ) : (
            <EmptyNote>
              Publications will be added as research is published.
            </EmptyNote>
          )}
        </section>
      </div>
    </>
  );
}
