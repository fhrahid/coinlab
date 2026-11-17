import Link from "next/link";
import { ArrowUpRight, Briefcase, MapPin, Wallet } from "lucide-react";
import PageHero from "@/components/site/page-hero";
import { Accent } from "@/components/site/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getCollection } from "@/lib/content";

export const revalidate = 10;
export const metadata = { title: "Jobs" };

const today = () => new Date().toISOString().slice(0, 10);
const isOpen = (job) =>
  job.active !== false && (!job.deadline || job.deadline >= today());
const formatDeadline = (deadline) =>
  deadline
    ? new Date(`${deadline}T00:00:00`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

function JobCard({ job, wings }) {
  const wingLabel = (job.wingSlugs || [])
    .map((slug) => wings.find((wing) => wing.slug === slug)?.shortTitle)
    .filter(Boolean)
    .join(" · ");
  return (
    <Card className="py-0 transition-transform duration-200 hover:-translate-y-1">
      <Link className="block" href={`/jobs/${job.slug}`}>
        <CardContent className="flex flex-col gap-3.5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className="label-caps text-[0.5625rem]"
              variant={isOpen(job) ? "default" : "secondary"}
            >
              {isOpen(job) ? "Open" : "Closed"}
            </Badge>
            <Badge className="label-caps text-[0.5625rem]" variant="outline">
              {job.type}
            </Badge>
            {wingLabel && (
              <Badge className="label-caps text-[0.5625rem]" variant="outline">
                {wingLabel}
              </Badge>
            )}
            {job.deadline && (
              <span className="label-caps ml-auto text-[0.5625rem] tracking-[0.08em] text-muted-foreground">
                {isOpen(job) ? "Apply by" : "Closed"}{" "}
                {formatDeadline(job.deadline)}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-[-0.02em] sm:text-xl">
              {job.title}
            </h2>
            {job.summary && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {job.summary}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin aria-hidden="true" className="size-3.5" />
              {job.location}
            </span>
            {job.salary && (
              <span className="inline-flex items-center gap-1.5">
                <Wallet aria-hidden="true" className="size-3.5" />
                {job.salary}
              </span>
            )}
            <span className="ml-auto inline-flex items-center gap-1 font-semibold text-brand">
              View posting{" "}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

export default async function JobsPage() {
  const [jobs, wings] = await Promise.all([
    getCollection("jobs"),
    getCollection("wings"),
  ]);
  const open = jobs.filter(isOpen);
  const closed = jobs.filter((job) => !isOpen(job));
  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Careers"
        title={
          <>
            Work that
            <br />
            <Accent>counts.</Accent>
          </>
        }
      >
        Open positions at COiN Lab — research roles, internships and
        collaborations for people who want their work to matter.
      </PageHero>
      <div className="wrap flex flex-col gap-12">
        <section aria-label="Open positions" className="flex flex-col gap-5">
          <div className="flex items-baseline gap-3.5 border-b pb-3">
            <span className="font-mono text-[11px] font-medium tracking-[0.1em] text-brand">
              01
            </span>
            <h2 className="text-xl font-extrabold tracking-[-0.03em] md:text-2xl">
              Open positions
            </h2>
            <span className="label-caps ml-auto text-[0.5625rem] tracking-[0.1em] text-muted-foreground">
              {open.length} {open.length === 1 ? "role" : "roles"}
            </span>
          </div>
          {open.length ? (
            <div className="flex flex-col gap-4">
              {open.map((job) => (
                <JobCard job={job} key={job.slug} wings={wings} />
              ))}
            </div>
          ) : (
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Briefcase />
                </EmptyMedia>
                <EmptyTitle>No open positions right now.</EmptyTitle>
                <EmptyDescription>
                  New roles are posted here as the lab grows — check back soon,
                  or reach out through the contact form to introduce yourself.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </section>
        {closed.length > 0 && (
          <section
            aria-label="Recently closed positions"
            className="flex flex-col gap-5"
          >
            <div className="flex items-baseline gap-3.5 border-b pb-3">
              <span className="font-mono text-[11px] font-medium tracking-[0.1em] text-brand">
                02
              </span>
              <h2 className="text-xl font-extrabold tracking-[-0.03em] md:text-2xl">
                Recently closed
              </h2>
            </div>
            <div className="flex flex-col gap-4 opacity-60">
              {closed.map((job) => (
                <JobCard job={job} key={job.slug} wings={wings} />
              ))}
            </div>
          </section>
        )}
        <Card className="bg-accent py-0">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-extrabold tracking-[-0.02em]">
                Nothing that fits — yet?
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Send an open application through the contact form and tell us
                what you would like to work on.
              </p>
            </div>
            <Button asChild size="lg" variant="outline">
              <Link href="/#contact">
                Introduce yourself <ArrowUpRight data-icon="inline-end" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
