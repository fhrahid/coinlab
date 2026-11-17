import { ArrowUpRight, BookOpen } from "lucide-react";
import PageHero from "@/components/site/page-hero";
import { Accent } from "@/components/site/typography";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getCollection, mediaUrl } from "@/lib/content";
import { doiUrl } from "@/lib/media";

export const revalidate = 10;
export const metadata = { title: "Papers" };

export default async function PapersPage() {
  const [papers, wings] = await Promise.all([
    getCollection("papers"),
    getCollection("wings"),
  ]);
  const wingNames = new Map(
    wings.map((wing) => [wing.slug, wing.shortTitle || wing.title]),
  );

  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Research archive"
        title={
          <>
            The work,
            <br />
            <Accent>in public.</Accent>
          </>
        }
      >
        A growing archive of papers, prototypes, and research outputs from the
        COiN Lab community.
      </PageHero>
      <div className="wrap">
        <div className="max-w-[980px]">
          {papers.length ? (
            papers.map((paper) => {
              const href = mediaUrl(paper.pdfKey) || doiUrl(paper.doi);
              return (
                <article
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 border-t py-6 sm:grid-cols-[60px_minmax(0,1fr)_auto] sm:gap-x-5"
                  key={paper.slug}
                >
                  <div className="col-span-2 font-mono text-[11px] text-brand sm:col-span-1">
                    {paper.year}
                  </div>
                  <div className="min-w-0">
                    <div className="label-caps text-[0.5625rem] tracking-[0.1em] text-brand">
                      {(paper.wingSlugs || [])
                        .map((slug) => wingNames.get(slug))
                        .filter(Boolean)
                        .join(" · ") || "COiN Lab"}
                    </div>
                    <h2 className="my-2 text-lg leading-snug font-bold tracking-[-0.04em] sm:text-[21px]">
                      {paper.title}
                    </h2>
                    <p className="mb-2 max-w-[680px] text-[13px] leading-[1.7] text-ink-soft">
                      {(paper.authors || []).join(", ")} ({paper.year}).{" "}
                      <em className="text-brand">{paper.venue}</em>
                      {paper.doi && (
                        <>
                          .{" "}
                          <a
                            className="break-all underline underline-offset-2 hover:text-brand"
                            href={doiUrl(paper.doi)}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {doiUrl(paper.doi)}
                          </a>
                        </>
                      )}
                    </p>
                    {paper.abstract && (
                      <p className="max-w-[680px] text-xs leading-[1.7] text-muted-foreground">
                        {paper.abstract}
                      </p>
                    )}
                  </div>
                  {href && (
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
                  )}
                </article>
              );
            })
          ) : (
            <Empty className="mb-6 min-h-[230px] border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BookOpen />
                </EmptyMedia>
                <EmptyTitle>Research outputs will appear here.</EmptyTitle>
                <EmptyDescription>
                  The archive is being prepared. Check back as COiN Lab
                  publications are added.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          <div className="flex items-center gap-2.5 border-t py-4 text-[11px] text-muted-foreground">
            <BookOpen aria-hidden="true" className="size-4 shrink-0" />
            <span>
              Research outputs are connected to their wings and authors.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
