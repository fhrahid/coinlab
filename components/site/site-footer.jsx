import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const linkClass =
  "w-fit py-1.5 text-xs text-navy-foreground transition-colors hover:text-sky";

export default function SiteFooter() {
  return (
    <footer className="bg-navy-deep pt-14 pb-5 text-white">
      <div className="wrap grid grid-cols-2 gap-x-5 gap-y-8 pb-11 md:grid-cols-[2fr_0.7fr_1fr] md:gap-9">
        <div className="col-span-2 flex items-center gap-3 md:col-span-1">
          <img
            alt="COiN Lab logo"
            className="size-11 shrink-0 rounded-full bg-white object-contain p-0.5"
            height={44}
            src="/coinlab-logo.jpg"
            width={44}
          />
          <div>
            <strong className="text-[15px] tracking-[0.08em]">COiN Lab</strong>
            <p className="text-xs leading-relaxed text-navy-foreground/80">
              Computational Intelligence Lab
              <br />
              Southeast University, Dhaka
            </p>
          </div>
        </div>
        <nav aria-label="Explore" className="flex flex-col gap-1">
          <span className="label-caps mb-2 text-navy-foreground/70">
            Explore
          </span>
          <Link className={linkClass} href="/wings">
            Research wings
          </Link>
          <Link className={linkClass} href="/people">
            People
          </Link>
          <Link className={linkClass} href="/papers">
            Papers
          </Link>
        </nav>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="label-caps mb-2 text-navy-foreground/70">
            Connect
          </span>
          <a
            className={`${linkClass} break-all`}
            href="mailto:coinlab@seu.edu.bd"
          >
            coinlab@seu.edu.bd
          </a>
          <a
            className={linkClass}
            href="https://seu.edu.bd"
            rel="noreferrer"
            target="_blank"
          >
            Southeast University ↗
          </a>
        </div>
      </div>
      <div className="wrap">
        <Separator className="bg-white/15" />
        <div className="label-caps flex flex-col justify-between gap-2 pt-4 text-[0.5625rem] text-navy-foreground/60 sm:flex-row">
          <span>© {new Date().getFullYear()} COiN Lab</span>
          <span>Responsible intelligence, together.</span>
        </div>
      </div>
    </footer>
  );
}
