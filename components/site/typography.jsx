import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Small mono pill above headings ("RESEARCH WINGS").
export function Chip({ className, dot = false, children, ...props }) {
  return (
    <Badge className={cn("label-caps h-auto gap-2 px-3 py-1 text-muted-foreground", className)} variant="outline" {...props}>
      {dot && <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-brand" />}
      {children}
    </Badge>
  );
}

// Gradient-highlighted word(s) inside a headline.
export function Highlight({ className, ...props }) {
  return <span className={cn("text-gradient", className)} {...props} />;
}

/**
 * Wraps text with a hand-drawn underline that draws itself, as if sketched
 * with a pen. `delay` (ms) staggers several marks; `onView` draws when the
 * text scrolls into view instead of on load.
 */
export function Scribble({ children, delay = 0, onView = false, className }) {
  return (
    <span className={cn("relative inline-block whitespace-nowrap", className)}>
      {children}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 -bottom-[0.18em] h-[0.32em] w-full overflow-visible text-brand-2" preserveAspectRatio="none" viewBox="0 0 100 12">
        <path
          className={cn("animate-draw motion-reduce:animate-none", onView && "supports-[animation-timeline:view()]:[animation-range:entry_20%_cover_40%] supports-[animation-timeline:view()]:[animation-timeline:view()]")}
          d="M2 8 C 18 2, 30 11, 48 6 S 80 3, 98 7"
          fill="none"
          pathLength="1"
          stroke="currentColor"
          strokeDasharray="1"
          strokeLinecap="round"
          strokeWidth="2.5"
          style={{ animationDelay: `${delay}ms` }}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}

// Chip + headline + supporting line: the opening of every section.
export function SectionHeader({ chip, title, children, align = "left", as: Heading = "h2", className }) {
  return (
    <div className={cn("reveal flex flex-col gap-4", align === "center" ? "items-center text-center" : "items-start", className)}>
      {chip && <Chip>{chip}</Chip>}
      <Heading className="display-heading">{title}</Heading>
      {children && <p className="max-w-[600px] text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">{children}</p>}
    </div>
  );
}

// The arrow-in-a-circle that ends pill buttons: <Button>Label <ArrowBadge /></Button>
export function ArrowBadge({ className }) {
  return (
    <span className={cn("flex size-8 items-center justify-center overflow-hidden rounded-full bg-current/15", className)} data-icon="inline-end">
      <ArrowUpRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
    </span>
  );
}
