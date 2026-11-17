import Link from "next/link";
import PersonAvatar from "@/components/site/person-avatar";
import { cn } from "@/lib/utils";

// Portrait card used on the homepage and the people directory.
export default function PersonCard({ person, photo, large = false }) {
  return (
    <Link
      className="group/person reveal flex flex-col items-center gap-4 rounded-3xl border bg-card p-6 text-center transition-[translate,border-color] duration-300 hover:-translate-y-1 hover:border-brand/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      data-spotlight
      href={`/people/${person.slug}`}
    >
      <span className="rounded-full bg-linear-to-br from-brand to-brand-2 p-[3px]">
        <PersonAvatar className={cn("border-4 border-card after:hidden", large ? "size-32 sm:size-36" : "size-24 sm:size-28")} fallbackClassName={large ? "text-3xl" : "text-2xl"} name={person.name} src={photo} />
      </span>
      <span className="flex flex-col gap-1.5">
        <strong className="text-base leading-snug font-semibold text-balance">{person.name}</strong>
        <span className="label-caps text-muted-foreground">{person.role}</span>
      </span>
    </Link>
  );
}
