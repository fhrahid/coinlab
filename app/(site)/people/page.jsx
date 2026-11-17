import Link from "next/link";
import { Users } from "lucide-react";
import PageHero from "@/components/site/page-hero";
import PersonAvatar from "@/components/site/person-avatar";
import { Accent } from "@/components/site/typography";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getCollection, mediaUrl } from "@/lib/content";
import { labRoles, peopleTiers, roleTier } from "@/lib/roles";
import { cn } from "@/lib/utils";

export const revalidate = 10;
export const metadata = { title: "People" };

// Photo and card sizes step down with each tier of the hierarchy.
const tierSizes = {
  founders: {
    card: "w-[160px] sm:w-[216px]",
    photo: "size-[144px] sm:size-48",
    initials: "text-[30px] sm:text-[38px]",
  },
  leadership: {
    card: "w-[150px] sm:w-[200px]",
    photo: "size-[132px] sm:size-44",
    initials: "text-[28px] sm:text-[34px]",
  },
  heads: {
    card: "w-[140px] sm:w-[172px]",
    photo: "size-[120px] sm:size-[150px]",
    initials: "text-2xl sm:text-[28px]",
  },
  researchers: {
    card: "w-[132px] sm:w-[152px]",
    photo: "size-[110px] sm:size-[130px]",
    initials: "text-[22px] sm:text-2xl",
  },
  students: {
    card: "w-[118px] sm:w-[136px]",
    photo: "size-[96px] sm:size-28",
    initials: "text-lg sm:text-xl",
  },
};

export default async function PeoplePage() {
  const people = await getCollection("people");
  const tiers = peopleTiers
    .map((tier) => ({
      ...tier,
      members: people
        .filter((person) => roleTier(person.role).key === tier.key)
        .sort(
          (a, b) =>
            labRoles.indexOf(a.role) - labRoles.indexOf(b.role) ||
            String(a.name || "").localeCompare(String(b.name || "")),
        ),
    }))
    .filter((tier) => tier.members.length);

  return (
    <div className="pb-20">
      <PageHero
        eyebrow="People"
        title={
          <>
            The people
            <br />
            <Accent>behind the work.</Accent>
          </>
        }
      >
        COiN Lab grows through people who share ideas, build carefully, and help
        each other learn.
      </PageHero>
      <div className="wrap">
        {tiers.length ? (
          <div className="flex flex-col gap-9 md:gap-12">
            {tiers.map((tier, index) => {
              const size = tierSizes[tier.key] || tierSizes.researchers;
              return (
                <section key={tier.key}>
                  <div className="mb-6 flex items-baseline gap-3.5 border-b pb-3">
                    <span className="font-mono text-[11px] font-medium tracking-[0.1em] text-brand">
                      0{index + 1}
                    </span>
                    <h2 className="text-xl font-extrabold tracking-[-0.03em] md:text-2xl">
                      {tier.label}
                    </h2>
                    <span className="label-caps ml-auto text-[0.5625rem] tracking-[0.1em] text-muted-foreground">
                      {tier.members.length}{" "}
                      {tier.members.length === 1 ? "person" : "people"}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-around gap-x-4 gap-y-7 sm:justify-start sm:gap-x-9 sm:gap-y-8">
                    {tier.members.map((person) => (
                      <Link
                        className={cn(
                          "group/person flex flex-col items-center gap-3.5 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
                          size.card,
                        )}
                        href={`/people/${person.slug}`}
                        key={person.slug}
                      >
                        <PersonAvatar
                          className={cn(
                            "border-[3px] border-navy shadow-[6px_6px_0_var(--sky)] transition-transform duration-200 after:hidden group-hover/person:-translate-y-1 sm:shadow-[9px_9px_0_var(--sky)]",
                            size.photo,
                          )}
                          fallbackClassName={cn(
                            "bg-navy font-sans font-extrabold tracking-[-0.03em]",
                            size.initials,
                          )}
                          name={person.name}
                          src={mediaUrl(person.photoKey)}
                        />
                        <span>
                          <strong className="block text-sm leading-snug font-bold tracking-[-0.01em]">
                            {person.name}
                          </strong>
                          <span className="label-caps mt-1.5 block text-[0.5625rem] tracking-[0.08em] text-muted-foreground">
                            {person.role}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>People profiles are being added.</EmptyTitle>
              <EmptyDescription>
                Visit again soon to meet the researchers behind COiN Lab.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  );
}
