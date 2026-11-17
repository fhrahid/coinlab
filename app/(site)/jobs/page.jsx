import Link from "next/link";
import { Briefcase } from "lucide-react";
import JobCard from "@/components/site/job-card";
import PageHero from "@/components/site/page-hero";
import { ArrowBadge, Chip, Highlight } from "@/components/site/typography";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { getList } from "@/lib/content";
import { isJobOpen } from "@/lib/jobs";

export const revalidate = 10;
export const metadata = {
  title: "Jobs",
  description: "Open research roles, internships and collaborations at COiN Lab, Southeast University.",
};

export default async function JobsPage() {
  const [jobs, wings] = await Promise.all([
    getList("jobs", "slug,title,type,location,deadline,salary,summary,wingSlugs,active"),
    getList("wings", "slug,title,shortTitle"),
  ]);
  const wingNames = (job) => (job.wingSlugs || []).map((slug) => wings.find((wing) => wing.slug === slug)).filter(Boolean).map((wing) => wing.shortTitle || wing.title);
  const open = jobs.filter((job) => isJobOpen(job));
  const closed = jobs.filter((job) => !isJobOpen(job));

  return (
    <>
      <PageHero chip="Careers" title={<>Work that <Highlight>counts</Highlight></>}>
        Open positions at COiN Lab — research roles, internships and collaborations for people who want their work to matter.
      </PageHero>
      <div className="wrap flex flex-col gap-14 py-12 md:py-16">
        <section aria-labelledby="open-roles" className="flex flex-col gap-6">
          <h2 className="reveal" id="open-roles">
            <Chip className="bg-card text-foreground" dot>Open positions <span className="text-muted-foreground">· {open.length}</span></Chip>
          </h2>
          {open.length ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {open.map((job) => <JobCard job={job} key={job.slug} wingNames={wingNames(job)} />)}
            </div>
          ) : (
            <Empty className="rounded-3xl border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon"><Briefcase /></EmptyMedia>
                <EmptyTitle>No open positions right now</EmptyTitle>
                <EmptyDescription>New roles are posted here as the lab grows. Check back soon, or introduce yourself through the contact form.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </section>

        {closed.length > 0 && (
          <section aria-labelledby="closed-roles" className="flex flex-col gap-6">
            <h2 className="reveal" id="closed-roles"><Chip>Recently closed · {closed.length}</Chip></h2>
            <div className="grid gap-5 lg:grid-cols-2">
              {closed.map((job) => <JobCard job={job} key={job.slug} wingNames={wingNames(job)} />)}
            </div>
          </section>
        )}

        <div className="bezel reveal flex flex-col items-start justify-between gap-5 rounded-3xl border bg-card p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-semibold tracking-tight">Nothing that fits — yet?</h2>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">Send an open application through the contact form and tell us what you would like to work on.</p>
          </div>
          <Button asChild className="shrink-0" size="lg" variant="glow">
            <Link href="/#contact">Get in touch <ArrowBadge className="size-6" /></Link>
          </Button>
        </div>
      </div>
    </>
  );
}
