import Link from "next/link";
import { LazyContactForm } from "@/components/home/lazy";
import {
  BookOpen,
  Database,
  FlaskConical,
  HelpCircle,
  Rocket,
  Scale,
  Users,
} from "lucide-react";
import PersonCard from "@/components/site/person-card";
import PublicationList from "@/components/site/publication-list";
import {
  ArrowBadge,
  Chip,
  Highlight,
  SectionHeader,
} from "@/components/site/typography";
import WingCard from "@/components/site/wing-card";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Marquee } from "@/components/ui/marquee";
import { ShineBorder } from "@/components/ui/shine-border";
import { cn } from "@/lib/utils";

const section = "py-20 md:py-28";

export function Wings({ wings, counts }) {
  // Five wings form a 2 + 3 mosaic; any other count is an even grid.
  const mosaic = wings.length === 5;
  return (
    <section className={section} id="research">
      <div className="wrap flex flex-col gap-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeader
            chip="Research wings"
            title={
              <>
                What we <Highlight>study</Highlight>
              </>
            }
          >
            {wings.length} research wings, each applying computational
            intelligence to a field where better decisions matter.
          </SectionHeader>
          <Button
            asChild
            className="reveal shrink-0"
            size="lg"
            variant="outline"
          >
            <Link href="/wings">
              All research wings <ArrowBadge className="size-6" />
            </Link>
          </Button>
        </div>
        <div
          className={cn(
            "grid gap-5 sm:grid-cols-2",
            mosaic ? "lg:grid-cols-6" : "lg:grid-cols-3",
          )}
        >
          {wings.map((wing, index) => (
            <WingCard
              className={cn(
                mosaic && (index < 2 ? "lg:col-span-3" : "lg:col-span-2"),
                mosaic && index === 4 && "sm:max-lg:col-span-2",
              )}
              counts={counts[wing.slug] || { people: 0, papers: 0 }}
              index={index}
              key={wing.slug}
              wing={wing}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function RecentWork({ publications }) {
  return (
    <section className={cn(section, "border-y bg-card/40")} id="recent-work">
      <div className="wrap flex flex-col gap-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeader
            chip="Recent work"
            title={
              <>
                Latest <Highlight>publications</Highlight>
              </>
            }
          >
            Peer-reviewed papers and preprints from the lab, newest first.
          </SectionHeader>
          <Button
            asChild
            className="reveal shrink-0"
            size="lg"
            variant="outline"
          >
            <Link href="/papers">
              All publications <ArrowBadge className="size-6" />
            </Link>
          </Button>
        </div>
        {publications.length ? (
          <PublicationList publications={publications} />
        ) : (
          <Empty className="reveal rounded-3xl border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookOpen />
              </EmptyMedia>
              <EmptyTitle>Publications are on the way</EmptyTitle>
              <EmptyDescription>
                Papers appear here as soon as they are added to the lab archive.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </section>
  );
}

const steps = [
  {
    icon: HelpCircle,
    title: "Question",
    text: "Start from a real problem raised by clinicians, farmers, analysts or network operators — not from a dataset that happens to exist.",
  },
  {
    icon: Database,
    title: "Data",
    text: "Collect, clean and document data carefully, with attention to consent, bias and low-resource settings such as Bangla.",
  },
  {
    icon: FlaskConical,
    title: "Model",
    text: "Design and train models that fit the problem, favouring methods we can explain over ones we can only measure.",
  },
  {
    icon: Scale,
    title: "Evaluate",
    text: "Test against strong baselines, report failure cases, and check that results hold outside the lab.",
  },
  {
    icon: BookOpen,
    title: "Publish",
    text: "Share papers, code and data so others can reproduce the work and build on it.",
  },
  {
    icon: Rocket,
    title: "Translate",
    text: "Work with partners to turn results into tools that people can use.",
  },
];

export function Method() {
  return (
    <section className={section} id="method">
      <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeader
            chip="Method"
            title={
              <>
                From question <Highlight>to impact</Highlight>
              </>
            }
          >
            Every project follows the same path, so results are rigorous,
            understandable and useful beyond the lab.
          </SectionHeader>
        </div>
        <ol className="flex flex-col gap-4">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li
              className="reveal flex gap-4 rounded-3xl border bg-card p-5 sm:gap-5 sm:p-6"
              key={title}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand to-brand-2 font-mono text-sm font-medium text-white">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                  <Icon
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Stats({ stats }) {
  return (
    <section aria-label="The lab in numbers" className="border-y bg-card/40">
      <dl className="wrap grid grid-cols-2 divide-border max-lg:gap-y-10 py-12 lg:grid-cols-4 lg:divide-x">
        {stats.map((stat) => (
          <div
            className="flex flex-col items-center gap-2 px-4 text-center"
            key={stat.label}
          >
            <dd className="text-5xl font-bold tracking-[-0.05em] tabular-nums md:text-6xl">
              <span
                aria-hidden="true"
                className="count-up text-gradient"
                style={{ "--num": stat.value }}
              />
              <span className="sr-only">{stat.value}</span>
            </dd>
            <dt className="label-caps text-muted-foreground">{stat.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function People({ people }) {
  return (
    <section className={section} id="people">
      <div className="wrap flex flex-col gap-12">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeader
            chip="People"
            title={
              <>
                The people <Highlight>behind the work</Highlight>
              </>
            }
          >
            Faculty, researchers and students who share ideas, build carefully
            and help each other learn.
          </SectionHeader>
          <Button
            asChild
            className="reveal shrink-0"
            size="lg"
            variant="outline"
          >
            <Link href="/people">
              Everyone at the lab <ArrowBadge className="size-6" />
            </Link>
          </Button>
        </div>
        {people.length ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {people.map((person) => (
              <PersonCard
                key={person.slug}
                person={person}
                photo={person.photo}
              />
            ))}
          </div>
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
    </section>
  );
}

export function Partners({ partners }) {
  if (!partners.length) return null;
  return (
    <section
      aria-labelledby="partners-title"
      className="border-y bg-card/40 py-12"
    >
      <div className="wrap mb-8 flex justify-center">
        <Chip id="partners-title">Academic partners</Chip>
      </div>
      {/* The scrolling strip repeats its items, so screen readers get one plain list instead. */}
      <ul className="sr-only">
        {partners.map((partner) => (
          <li key={partner.slug}>{partner.name}</li>
        ))}
      </ul>
      <Marquee
        aria-hidden="true"
        className="mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] [--duration:36s] [--gap:3rem] motion-reduce:[&>div]:animate-none"
        pauseOnHover
      >
        {partners.map((partner) => (
          <span
            className="flex items-center gap-3 text-sm font-medium whitespace-nowrap text-muted-foreground"
            key={partner.slug}
          >
            {partner.logo && (
              <img
                alt=""
                className="h-8 w-auto max-w-[140px] object-contain"
                loading="lazy"
                src={partner.logo}
              />
            )}
            {partner.name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}

export function Contact() {
  return (
    <section className={section} id="contact">
      <div className="wrap">
        <div className="bezel relative isolate grid items-center gap-10 overflow-hidden rounded-[2rem] border bg-card p-6 sm:p-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,460px)] lg:gap-14 lg:p-14">
          <ShineBorder
            borderWidth={1.5}
            duration={12}
            shineColor={["var(--brand)", "var(--brand-2)"]}
          />
          <div
            aria-hidden="true"
            className="absolute -top-32 left-1/4 -z-10 size-96 rounded-full bg-brand/15 blur-[110px]"
          />
          <SectionHeader
            chip="Collaborate"
            title={
              <>
                Bring us your <Highlight>next question</Highlight>
              </>
            }
          >
            Interested in research, collaboration, or a problem we should be
            thinking about? Students who want to join a wing are welcome too.
            Messages land directly in the lab inbox.
          </SectionHeader>
          <div className="reveal">
            <LazyContactForm />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Or email{" "}
              <a
                className="font-medium text-foreground underline underline-offset-4 hover:text-brand"
                href="mailto:info@coinlabai.com"
              >
                info@coinlabai.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
