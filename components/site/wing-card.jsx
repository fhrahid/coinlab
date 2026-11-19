import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { wingIcon } from "@/components/site/wing-icons";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const plural = (n, word) => `${n} ${n === 1 ? word : `${word}s`}`;

// Research-wing card (homepage grid and /wings). `counts` = { people, papers }.
export default function WingCard({ wing, index, counts, className }) {
  const Icon = wingIcon(wing.slug);
  return (
    <Link
      className={cn(
        "group/wing reveal rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-ring",
        className,
      )}
      href={`/wings/${wing.slug}`}
    >
      <Card
        data-spotlight
        className="bezel h-full rounded-3xl transition-[translate,box-shadow] duration-300 group-hover/wing:-translate-y-1 group-hover/wing:shadow-[0_24px_60px_-30px_var(--brand)]"
      >
        <CardHeader>
          <div className="mb-3 flex items-center justify-between">
            <span className="flex size-11 items-center justify-center rounded-full border bg-muted text-brand">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {wing.number || String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight">
            {wing.title}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {wing.description}
          </CardDescription>
        </CardHeader>
        {wing.focusPoints?.length > 0 && (
          <CardContent className="flex flex-wrap gap-1.5">
            {wing.focusPoints.slice(0, 3).map((point) => (
              <Badge
                className="h-auto py-1 font-normal whitespace-normal"
                key={point}
                variant="secondary"
              >
                {point}
              </Badge>
            ))}
          </CardContent>
        )}
        <CardFooter className="mt-auto justify-between gap-3 text-xs text-muted-foreground">
          <span className="font-mono">
            {plural(counts.people, "researcher")} ·{" "}
            {plural(counts.papers, "paper")}
          </span>
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 text-brand transition-transform group-hover/wing:translate-x-0.5 group-hover/wing:-translate-y-0.5"
          />
        </CardFooter>
      </Card>
    </Link>
  );
}
