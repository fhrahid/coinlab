import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Check, MapPin, Wallet } from "lucide-react";
import ApplyForm from "@/components/site/apply-form";
import Crumbs from "@/components/site/crumbs";
import PageHero from "@/components/site/page-hero";
import RichText from "@/components/site/rich-text";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getList, getRecord } from "@/lib/content";
import { formatDate, isJobOpen } from "@/lib/jobs";

export const revalidate = 10;

// Postings change often: render each on first request, then cache it.
export function generateStaticParams() {
  return [];
}

const findJob = (slug) => getRecord("jobs", slug);

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const job = await findJob(slug);
  return job
    ? { title: `${job.title} · Jobs`, description: job.summary || undefined }
    : { title: "Jobs" };
}

const meta = "inline-flex items-center gap-1.5";

export default async function JobPage({ params }) {
  const { slug } = await params;
  const [job, wings] = await Promise.all([
    findJob(slug),
    getList("wings", "slug,title,shortTitle"),
  ]);
  if (!job) notFound();
  const open = isJobOpen(job);
  const jobWings = (job.wingSlugs || [])
    .map((wingSlug) => wings.find((wing) => wing.slug === wingSlug))
    .filter(Boolean);
  const mailto = `mailto:info@coinlabai.com?subject=${encodeURIComponent(`Application: ${job.title} — COiN Lab`)}`;

  return (
    <>
      <PageHero
        after={
          <div className="flex animate-fade-up flex-col gap-4 [animation-delay:120ms]">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={open ? "default" : "secondary"}>
                {open ? "Open" : "Closed"}
              </Badge>
              {job.type && <Badge variant="outline">{job.type}</Badge>}
              {jobWings.map((wing) => (
                <Badge
                  asChild
                  className="h-6"
                  key={wing.slug}
                  variant="outline"
                >
                  <Link href={`/wings/${wing.slug}`}>
                    {wing.shortTitle || wing.title}
                  </Link>
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {job.location && (
                <span className={meta}>
                  <MapPin aria-hidden="true" className="size-4" />{" "}
                  {job.location}
                </span>
              )}
              {job.salary && (
                <span className={meta}>
                  <Wallet aria-hidden="true" className="size-4" /> {job.salary}
                </span>
              )}
              {job.postedAt && (
                <span className={meta}>
                  <CalendarDays aria-hidden="true" className="size-4" /> Posted{" "}
                  {formatDate(job.postedAt)}
                </span>
              )}
              {job.deadline && (
                <span className={meta}>
                  <CalendarDays aria-hidden="true" className="size-4" />{" "}
                  {open ? "Apply by" : "Closed"} {formatDate(job.deadline)}
                </span>
              )}
            </div>
          </div>
        }
        before={
          <Crumbs
            current={job.title}
            trail={[
              { href: "/", label: "Home" },
              { href: "/jobs", label: "Jobs" },
            ]}
          />
        }
        chip="Job posting"
        title={job.title}
      >
        {job.summary}
      </PageHero>

      <div className="wrap grid items-start gap-10 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-14">
        <div className="flex min-w-0 flex-col gap-10">
          {job.description && (
            <section
              aria-labelledby="job-about"
              className="reveal flex flex-col gap-4"
            >
              <h2
                className="text-2xl font-semibold tracking-tight"
                id="job-about"
              >
                About the role
              </h2>
              <RichText
                className="text-muted-foreground"
                text={job.description}
              />
            </section>
          )}
          {job.requirements?.length > 0 && (
            <section
              aria-labelledby="job-requirements"
              className="reveal flex flex-col gap-4"
            >
              <h2
                className="text-2xl font-semibold tracking-tight"
                id="job-requirements"
              >
                What we are looking for
              </h2>
              <ul className="flex flex-col gap-3">
                {job.requirements.map((requirement) => (
                  <li
                    className="flex gap-3 leading-relaxed text-muted-foreground"
                    key={requirement}
                  >
                    <Check
                      aria-hidden="true"
                      className="mt-1 size-4 shrink-0 text-brand"
                    />
                    {requirement}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <Card
          className="bezel reveal rounded-3xl lg:sticky lg:top-28"
          id="apply"
        >
          <CardHeader>
            <CardTitle className="text-xl font-semibold tracking-tight">
              How to apply
            </CardTitle>
            {job.applyInfo && (
              <CardDescription>
                <RichText className="text-sm" text={job.applyInfo} />
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {open ? (
              <>
                <ApplyForm jobSlug={job.slug} />
                <p className="text-xs text-muted-foreground">
                  Prefer email? Write to{" "}
                  <a
                    className="font-medium text-foreground underline underline-offset-4 hover:text-brand"
                    href={mailto}
                  >
                    info@coinlabai.com
                  </a>{" "}
                  with the job title in the subject line.
                </p>
              </>
            ) : (
              <Alert>
                <AlertTitle>This position is closed</AlertTitle>
                <AlertDescription>
                  It is no longer accepting applications. See the{" "}
                  <Link href="/jobs">open positions</Link> for new roles.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
