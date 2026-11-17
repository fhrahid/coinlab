import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BookOpen, Users } from "lucide-react";
import PersonRow from "@/components/site/person-row";
import { Accent, Eyebrow } from "@/components/site/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import {
  getCollection,
  getPapersForWing,
  getPeopleForWing,
  getWing,
  mediaUrl,
} from "@/lib/content";
import { doiUrl } from "@/lib/media";

export const revalidate = 10;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const wing = await getWing(slug);
  return wing ? { title: wing.title, description: wing.description } : {};
}

export async function generateStaticParams() {
  return (await getCollection("wings"))
    .filter((wing) => wing.slug)
    .map((wing) => ({ slug: wing.slug }));
}

function MiniTitle({ icon: Icon, children }) {
  return (
    <h3 className="label-caps flex items-center gap-2 border-b pb-3 text-[0.5625rem] text-muted-foreground">
      <Icon aria-hidden="true" className="size-[18px] text-brand" />
      {children}
    </h3>
  );
}

export default async function WingPage({ params }) {
  const { slug } = await params;
  const wing = await getWing(slug);
  if (!wing) notFound();
  const [people, papers] = await Promise.all([
    getPeopleForWing(slug),
    getPapersForWing(slug),
  ]);
  const cover = mediaUrl(wing.coverKey);

  return (
    <div className="bg-surface pb-20">
      <div className="wrap relative pt-6 md:pt-8">
        <Button asChild className="-ml-2.5 text-brand" variant="ghost">
          <Link href="/wings">
            <ArrowLeft data-icon="inline-start" /> All research wings
          </Link>
        </Button>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-4 right-4 font-serif text-[64px] leading-[0.9] text-[#ccd6ea] select-none sm:text-[90px] lg:right-10 lg:text-[150px]"
        >
          {wing.number}
        </div>
        <div className="relative mt-9 md:mt-12">
          <Eyebrow>Research wing</Eyebrow>
          <h1 className="display-heading mt-4 mb-5 max-w-[850px]">
            {wing.title}
          </h1>
          <p className="max-w-[700px] text-sm leading-[1.8] text-[#4d5a7c] md:text-base">
            {wing.longDescription}
          </p>
          {cover && (
            <img
              alt={`${wing.title} cover`}
              className="mt-6 max-h-[380px] w-full border object-cover"
              src={cover}
            />
          )}
        </div>
      </div>

      <div className="wrap mt-8 md:mt-11">
        <Card className="py-6 [--card-spacing:--spacing(4)] sm:[--card-spacing:--spacing(6)] md:py-11 md:[--card-spacing:--spacing(11)]">
          <CardContent className="grid gap-9 md:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] md:gap-14">
            <section>
              <Eyebrow>Focus areas</Eyebrow>
              <h2 className="mt-4 mb-6 text-[34px] leading-[0.98] font-bold tracking-[-0.06em] md:text-[38px]">
                Questions we
                <br />
                <Accent>are exploring.</Accent>
              </h2>
              <ul className="border-t">
                {(wing.focusPoints || []).map((point) => (
                  <li
                    className="flex gap-2.5 border-b py-3.5 text-xs text-[#45527a]"
                    key={point}
                  >
                    <ArrowUpRight
                      aria-hidden="true"
                      className="mt-px size-3.5 shrink-0 text-brand"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            </section>

            <div className="flex min-w-0 flex-col gap-9">
              <section>
                <MiniTitle icon={Users}>People in this wing</MiniTitle>
                {people.length ? (
                  <div className="flex flex-col">
                    {people.map((person) => (
                      <PersonRow
                        key={person.slug}
                        person={person}
                        photo={mediaUrl(person.photoKey)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-xs text-muted-foreground">
                    People will be added as the wing grows.
                  </p>
                )}
              </section>
              <section>
                <MiniTitle icon={BookOpen}>Relevant papers</MiniTitle>
                {papers.length ? (
                  <div className="flex flex-col">
                    {papers.map((paper) => {
                      const href = mediaUrl(paper.pdfKey) || doiUrl(paper.doi);
                      return (
                        <Item
                          className="border-0 border-b border-border px-1 py-3.5"
                          key={paper.slug}
                        >
                          <ItemContent>
                            <ItemTitle className="line-clamp-none text-xs font-bold">
                              {paper.title}
                            </ItemTitle>
                            <ItemDescription className="line-clamp-none">
                              {[
                                (paper.authors || []).join(", "),
                                paper.year,
                                paper.venue,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </ItemDescription>
                          </ItemContent>
                          {href && (
                            <ItemActions>
                              <Button
                                asChild
                                className="text-brand"
                                size="icon-lg"
                                variant="ghost"
                              >
                                <a
                                  aria-label={`Open ${paper.title}`}
                                  href={href}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  <ArrowUpRight />
                                </a>
                              </Button>
                            </ItemActions>
                          )}
                        </Item>
                      );
                    })}
                  </div>
                ) : (
                  <p className="py-4 text-xs text-muted-foreground">
                    Publications will be added as research is published.
                  </p>
                )}
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
