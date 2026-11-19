import { Users } from "lucide-react";
import PageHero from "@/components/site/page-hero";
import PersonCard from "@/components/site/person-card";
import { Chip, Highlight } from "@/components/site/typography";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getCollection, getList, mediaUrl } from "@/lib/content";
import { thumbUrl } from "@/lib/media";
import { buildHierarchy } from "@/lib/roles";

export const revalidate = 10;
export const metadata = {
  title: "People",
  description: "Faculty, researchers and students of COiN Lab.",
};

// Card width narrows with each step down the hierarchy.
const widths = [
  "w-[min(100%,260px)]",
  "w-[min(100%,230px)]",
  "w-[min(47%,210px)] sm:w-[200px]",
];

export default async function PeoplePage() {
  // Roles (and their order) come from the CMS, so the hierarchy follows it.
  const [people, roles] = await Promise.all([
    getList("people", "slug,name,role,photoKey"),
    getCollection("roles"),
  ]);
  const tiers = buildHierarchy(people, roles);

  return (
    <>
      <PageHero
        chip="People"
        title={
          <>
            The people <Highlight>behind the work</Highlight>
          </>
        }
      >
        COiN Lab grows through people who share ideas, build carefully, and help
        each other learn.
      </PageHero>
      <div className="wrap py-12 md:py-16">
        {tiers.length ? (
          <ol className="flex flex-col items-center">
            {tiers.map((tier, index) => (
              <li className="flex w-full flex-col items-center" key={tier.key}>
                {/* Connector from the tier above: reads as an organisation chart. */}
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="reveal h-12 w-px bg-linear-to-b from-brand/60 to-border md:h-16"
                  />
                )}
                <section
                  aria-labelledby={`tier-${tier.key}`}
                  className="flex w-full flex-col items-center gap-7"
                >
                  <h2 className="reveal" id={`tier-${tier.key}`}>
                    <Chip className="bg-card text-foreground" dot>
                      <span className="text-brand">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {tier.label}
                      <span className="text-muted-foreground">
                        · {tier.members.length}
                      </span>
                    </Chip>
                  </h2>
                  <div className="flex w-full flex-wrap justify-center gap-4 sm:gap-5">
                    {tier.members.map((person) => (
                      <div
                        className={widths[Math.min(index, widths.length - 1)]}
                        key={person.slug}
                      >
                        <PersonCard
                          large={index === 0}
                          person={person}
                          photo={thumbUrl(mediaUrl(person.photoKey), 150)}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              </li>
            ))}
          </ol>
        ) : (
          <Empty className="rounded-3xl border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>Profiles are being added</EmptyTitle>
              <EmptyDescription>
                Visit again soon to meet the researchers behind COiN Lab.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </>
  );
}
