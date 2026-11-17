import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Wallet,
} from "lucide-react";
import RichText from "@/components/site/rich-text";
import { Accent } from "@/components/site/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCollection } from "@/lib/content";

export const revalidate = 10;

const today = () => new Date().toISOString().slice(0, 10);
const isOpen = (job) =>
  job.active !== false && (!job.deadline || job.deadline >= today());
const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const job = (await getCollection("jobs")).find((item) => item.slug === slug);
  return { title: job?.title ? `${job.title} · Jobs` : "Jobs" };
}

export default async function JobPage({ params }) {
  const { slug } = await params;
  const [job, wings] = await Promise.all([
    getCollection("jobs"),
    getCollection("wings"),
  ]);
  const posting = job.find((item) => item.slug === slug);
  if (!posting) notFound();
  const open = isOpen(posting);
  const wingLinks = (posting.wingSlugs || [])
    .map((slug) => wings.find((wing) => wing.slug === slug))
    .filter(Boolean);
  const applySubject = encodeURIComponent(
    `Application: ${posting.title} — COiN Lab`,
  );

  return (
    <div className="wrap pb-20 pt-8 sm:pt-10">
      <Link
        className="text-xs font-semibold text-brand hover:underline"
        href="/jobs"
      >
        <ArrowLeft data-icon="inline-start" /> All positions
      </Link>

      <header className="mt-8 border-b pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className="label-caps text-[0.5625rem]"
            variant={open ? "default" : "secondary"}
          >
            {open ? "Open" : "Closed"}
          </Badge>
          <Badge className="label-caps text-[0.5625rem]" variant="outline">
            {posting.type}
          </Badge>
          <Badge className="label-caps text-[0.5625rem]" variant="outline">
            {posting.location}
          </Badge>
        </div>
        <h1 className="mt-5 max-w-3xl text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
          {posting.title}
        </h1>
        {posting.summary && (
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
            {posting.summary}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2.5 text-xs text-muted-foreground">
          {posting.postedAt && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays aria-hidden="true" className="size-3.5" />
              Posted {formatDate(posting.postedAt)}
            </span>
          )}
          {posting.deadline && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays aria-hidden="true" className="size-3.5" />
              {open ? "Apply by" : "Closed"} {formatDate(posting.deadline)}
            </span>
          )}
          {posting.salary && (
            <span className="inline-flex items-center gap-1.5">
              <Wallet aria-hidden="true" className="size-3.5" />
              {posting.salary}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <MapPin aria-hidden="true" className="size-3.5" />
            {posting.location}
          </span>
        </div>
        {wingLinks.length > 0 && (
          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            Research group:
            {wingLinks.map((wing) => (
              <Link
                className="font-semibold text-brand hover:underline"
                href={`/wings/${wing.slug}`}
                key={wing.slug}
              >
                {wing.title}
              </Link>
            ))}
          </p>
        )}
      </header>

      <div className="mt-8 flex max-w-3xl flex-col gap-10">
        {posting.description && (
          <section>
            <h2 className="text-lg font-extrabold tracking-[-0.02em]">
              About the <Accent>role.</Accent>
            </h2>
            <RichText className="mt-4" text={posting.description} />
          </section>
        )}

        {Array.isArray(posting.requirements) &&
          posting.requirements.length > 0 && (
            <section>
              <h2 className="text-lg font-extrabold tracking-[-0.02em]">
                What we are <Accent>looking for.</Accent>
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {posting.requirements.map((requirement) => (
                  <li
                    className="flex gap-3 leading-relaxed text-muted-foreground"
                    key={requirement}
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-brand"
                    />
                    {requirement}
                  </li>
                ))}
              </ul>
            </section>
          )}

        <section>
          <h2 className="text-lg font-extrabold tracking-[-0.02em]">
            How to <Accent>apply.</Accent>
          </h2>
          {posting.applyInfo && (
            <RichText className="mt-4" text={posting.applyInfo} />
          )}
          {open ? (
            <Button asChild className="mt-5" size="xl">
              <a
                href={`mailto:coinlab@seu.edu.bd?subject=${applySubject}`}
                rel="noreferrer"
                target="_blank"
              >
                Apply by email <ArrowUpRight data-icon="inline-end" />
              </a>
            </Button>
          ) : (
            <Card className="mt-5 bg-accent py-0">
              <CardContent className="p-4 text-sm text-muted-foreground">
                This position is no longer accepting applications. Keep an eye
                on the{" "}
                <Link className="font-semibold text-brand" href="/jobs">
                  open positions
                </Link>{" "}
                page for new roles.
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
