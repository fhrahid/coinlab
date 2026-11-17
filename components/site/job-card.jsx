import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, isJobOpen } from "@/lib/jobs";
import { cn } from "@/lib/utils";

const meta = "inline-flex items-center gap-1.5";

// One posting in the jobs list. `wingNames` are the titles of its wings.
export default function JobCard({ job, wingNames = [] }) {
  const open = isJobOpen(job);
  return (
    <Link className="group/job reveal rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" href={`/jobs/${job.slug}`}>
      <Card className={cn("rounded-3xl transition-[translate,box-shadow] duration-300 group-hover/job:-translate-y-1 group-hover/job:shadow-[0_24px_60px_-30px_var(--brand)]", !open && "opacity-70")} data-spotlight>
        <CardHeader>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant={open ? "default" : "secondary"}>{open ? "Open" : "Closed"}</Badge>
            {job.type && <Badge variant="outline">{job.type}</Badge>}
            {wingNames.map((name) => <Badge key={name} variant="outline">{name}</Badge>)}
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight">{job.title}</CardTitle>
          {job.summary && <CardDescription className="max-w-2xl text-sm leading-relaxed">{job.summary}</CardDescription>}
        </CardHeader>
        <CardContent className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          {job.location && <span className={meta}><MapPin aria-hidden="true" className="size-3.5" /> {job.location}</span>}
          {job.salary && <span className={meta}><Wallet aria-hidden="true" className="size-3.5" /> {job.salary}</span>}
          {job.deadline && <span className={meta}><CalendarDays aria-hidden="true" className="size-3.5" /> {open ? "Apply by" : "Closed"} {formatDate(job.deadline)}</span>}
        </CardContent>
        <CardFooter className="justify-end gap-1.5 text-sm font-medium text-brand">
          View posting
          <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover/job:translate-x-0.5 group-hover/job:-translate-y-0.5" />
        </CardFooter>
      </Card>
    </Link>
  );
}
