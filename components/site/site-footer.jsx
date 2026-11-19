import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const linkClass =
  "w-fit py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground";

export default function SiteFooter({ wings = [] }) {
  return (
    <footer className="border-t bg-card/40 pt-14 pb-6">
      <div className="wrap grid grid-cols-2 gap-x-6 gap-y-10 pb-12 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
          <img
            alt="COiN Lab"
            className="h-10 w-fit rounded-md dark:bg-white/95 dark:px-1.5 dark:py-0.5"
            height={40}
            loading="lazy"
            src="/logo.svg"
            width={124}
          />
          <p className="max-w-[300px] text-sm leading-relaxed text-muted-foreground">
            Computational Intelligence Lab
            <br />
            Dhaka, Bangladesh
          </p>
          <p className="label-caps flex items-center gap-2 text-muted-foreground">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-success"
            />
            Research in progress
          </p>
        </div>
        <nav aria-label="Research wings" className="flex flex-col">
          <span className="label-caps mb-3 text-foreground">Research</span>
          {wings.map((wing) => (
            <Link
              className={linkClass}
              href={`/wings/${wing.slug}`}
              key={wing.slug}
            >
              {wing.shortTitle || wing.title}
            </Link>
          ))}
        </nav>
        <nav aria-label="Lab" className="flex flex-col">
          <span className="label-caps mb-3 text-foreground">Lab</span>
          <Link className={linkClass} href="/papers">
            Publications
          </Link>
          <Link className={linkClass} href="/people">
            People
          </Link>
          <Link className={linkClass} href="/jobs">
            Jobs
          </Link>
          <Link className={linkClass} href="/#method">
            Method
          </Link>
          <Link className={linkClass} href="/#contact">
            Collaborate
          </Link>
        </nav>
        <div className="flex min-w-0 flex-col">
          <span className="label-caps mb-3 text-foreground">Connect</span>
          <a
            className={`${linkClass} break-all`}
            href="mailto:info@coinlabai.com"
          >
            info@coinlabai.com
          </a>
        </div>
      </div>
      <div className="wrap">
        <Separator />
        <div className="label-caps flex flex-col justify-between gap-2 pt-5 text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} COiN Lab</span>
          <span>Responsible intelligence, together.</span>
        </div>
      </div>
    </footer>
  );
}
