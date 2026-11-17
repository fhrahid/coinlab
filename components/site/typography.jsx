import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Small mono caption with a dot, used above page titles.
export function Eyebrow({ className, children, ...props }) {
  return (
    <p
      className={cn(
        "label-caps flex items-center gap-2.5 text-muted-foreground",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="size-2 shrink-0 rounded-full bg-brand"
      />
      {children}
    </p>
  );
}

// Numbered section marker on the homepage: "03  THE RESEARCH MAP".
export function SectionTag({ number, className, children, ...props }) {
  return (
    <p
      className={cn(
        "label-caps flex items-center gap-2.5 text-muted-foreground",
        className,
      )}
      {...props}
    >
      <span className="text-brand">{number}</span>
      <span>{children}</span>
    </p>
  );
}

// The serif second line of every display headline.
export function Accent({ className, ...props }) {
  return (
    <em
      className={cn(
        "font-serif font-medium tracking-[-0.06em] text-brand not-italic",
        className,
      )}
      {...props}
    />
  );
}

// Underlined text link with an arrow ("View all research ↗").
export function ArrowLink({ className, children, ...props }) {
  return (
    <Link
      className={cn(
        "group/link inline-flex w-fit items-center gap-2 border-b border-brand/35 pb-2 text-xs font-bold whitespace-nowrap text-brand transition-colors hover:border-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      {children}
      <ArrowUpRight
        aria-hidden="true"
        className="size-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
      />
    </Link>
  );
}
