import Link from "next/link";
import { ArrowUpRight, ChevronRight, Users } from "lucide-react";
import ContactForm from "@/components/site/contact-form";
import PersonRow from "@/components/site/person-row";
import Reveal from "@/components/site/reveal";
import { Accent, ArrowLink, SectionTag } from "@/components/site/typography";
import { wingIcon } from "@/components/site/wing-icons";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

const pad = (n) => String(n).padStart(2, "0");

export function Intro() {
  return (
    <section className="scroll-mt-20 py-16 md:py-28" id="about">
      <div className="wrap grid gap-6 md:grid-cols-[minmax(130px,0.35fr)_minmax(0,1.65fr)] md:gap-12">
        <SectionTag className="md:self-center" number="01">
          WHY COiN
        </SectionTag>
        <div>
          <h2 className="display-heading">
            Good research
            <br />
            <Accent>changes the frame.</Accent>
          </h2>
          <div className="mt-6 flex max-w-[820px] flex-col gap-5 md:mt-9 md:flex-row md:items-end md:justify-between md:gap-8">
            <p className="max-w-[560px] text-[15px] leading-[1.8] text-muted-foreground">
              We are a collaborative research community focused on building
              computational systems that are rigorous, understandable, and
              useful beyond the lab.
            </p>
            <ArrowLink href="/wings">What we work on</ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Partners({ partners }) {
  if (!partners.length) return null;
  return (
    <section
      aria-label="Academic partners"
      className="border-y bg-card py-13 md:py-16"
    >
      <div className="wrap mb-7 flex flex-col gap-3.5 md:mb-9 md:flex-row md:items-end md:justify-between md:gap-7">
        <SectionTag number="02">ACADEMIC PARTNERS</SectionTag>
        <p className="max-w-[430px] text-xs leading-[1.75] text-muted-foreground">
          COiN Lab works alongside researchers at partner universities in
          Bangladesh and collaborating institutions worldwide.
        </p>
      </div>
      <div className="group/strip relative overflow-hidden before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-14 before:bg-linear-to-r before:from-card before:to-transparent after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-10 after:w-14 after:bg-linear-to-l after:from-card after:to-transparent motion-reduce:overflow-x-auto md:before:w-24 md:after:w-24">
        <div className="flex w-max animate-marquee group-focus-within/strip:[animation-play-state:paused] group-hover/strip:[animation-play-state:paused] motion-reduce:animate-none">
          {[0, 1].map((copy) => (
            <ul
              aria-hidden={copy === 1}
              className="flex shrink-0 items-center"
              key={copy}
            >
              {partners.map((partner) => (
                <li
                  className="flex items-center gap-3 border-r px-6 py-3 whitespace-nowrap md:px-9 md:py-3.5"
                  key={partner.slug}
                >
                  {partner.logo && (
                    <img
                      alt={`${partner.name} logo`}
                      className="h-7 w-auto max-w-[150px] object-contain md:h-8"
                      loading="lazy"
                      src={partner.logo}
                    />
                  )}
                  <span className="label-caps tracking-[0.08em] text-muted-foreground">
                    {partner.name}
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}

const tones = ["bg-wing-1", "bg-wing-2", "bg-wing-3", "bg-wing-4", "bg-wing-5"];

export function Wings({ wings }) {
  // With exactly five wings the grid is a 3 + 2 mosaic; any other count falls
  // back to an even three-column grid.
  const mosaic = wings.length === 5;
  return (
    <section className="bg-surface py-16 md:py-26">
      <div className="wrap">
        <Reveal>
          <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div>
              <SectionTag number="03">THE RESEARCH MAP</SectionTag>
              <h2 className="display-heading mt-6">
                {mosaic ? "Five" : wings.length} wings.
                <br />
                <Accent>One lab.</Accent>
              </h2>
            </div>
            <ArrowLink href="/wings">View all research</ArrowLink>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div
            className={cn(
              "grid gap-2.5 sm:grid-cols-2 lg:gap-3",
              mosaic ? "lg:grid-cols-6" : "lg:grid-cols-3",
            )}
          >
            {wings.map((wing, index) => {
              const Icon = wingIcon(wing.slug);
              return (
                <Link
                  className={cn(
                    "group/wing relative flex min-h-[200px] flex-col overflow-hidden p-5 text-white transition-[translate,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-22px_rgb(14_27_64/0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:min-h-[235px] lg:p-6",
                    tones[index % tones.length],
                    mosaic &&
                      (index < 3
                        ? "lg:col-span-2 lg:min-h-[280px]"
                        : "lg:col-span-3"),
                    mosaic && index === 4 && "sm:max-lg:col-span-2",
                  )}
                  href={`/wings/${wing.slug}`}
                  key={wing.slug}
                >
                  <div className="flex justify-between font-mono text-[0.625rem] text-sky">
                    <span>{wing.number || pad(index + 1)}</span>
                    <Icon aria-hidden="true" className="size-[22px]" />
                  </div>
                  <h3 className="mt-auto max-w-[270px] pt-8 text-xl leading-[1.15] font-bold tracking-[-0.04em] lg:text-2xl">
                    {wing.title}
                  </h3>
                  <p className="mt-3 max-w-[300px] pr-6 text-xs leading-[1.7] text-[#d5ddf2]">
                    {wing.description}
                  </p>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="absolute right-5 bottom-5 size-4 text-sky transition-transform group-hover/wing:translate-x-0.5 group-hover/wing:-translate-y-0.5"
                  />
                </Link>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Impact({ stats }) {
  return (
    <section className="bg-sky py-16 md:py-26">
      <div className="wrap grid items-center gap-7 md:grid-cols-[70px_minmax(0,1.4fr)_minmax(180px,0.9fr)] md:gap-6 lg:grid-cols-[minmax(82px,0.35fr)_minmax(0,1.3fr)_minmax(220px,0.75fr)] lg:gap-10">
        <div
          aria-hidden="true"
          className="flex size-[68px] flex-col items-center justify-center bg-navy font-mono text-xs tracking-[0.13em] text-sky lg:size-[82px]"
        >
          <span>COiN</span>
          <b className="mt-1 text-lg">↗</b>
        </div>
        <div>
          <SectionTag className="text-[#4c5a80]" number="04">
            FROM IDEA TO IMPACT
          </SectionTag>
          <h2 className="display-heading mt-5">
            Make the question
            <br />
            <Accent>worth asking.</Accent>
          </h2>
          <p className="my-6 max-w-[500px] text-sm leading-[1.8] text-[#3d4a70]">
            Our research grows through shared infrastructure, open
            conversations, and teams that move from a first experiment to a
            useful contribution.
          </p>
          <Button asChild size="xl">
            <Link href="/papers">
              Explore the research archive{" "}
              <ArrowUpRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
        <dl className="border-t border-navy/15">
          {stats.map((stat) => (
            <div
              className="flex items-center justify-between gap-3 border-b border-navy/15 py-3.5"
              key={stat.label}
            >
              <dd className="font-serif text-[34px] leading-tight text-[#1b2c6b]">
                {pad(stat.value)}
              </dd>
              <dt className="label-caps text-right text-[0.5625rem] tracking-[0.07em] text-[#4c5a80]">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function People({ people }) {
  return (
    <section className="bg-card py-16 md:py-28">
      <div className="wrap grid gap-9 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-10 lg:gap-16">
        <Reveal>
          <SectionTag number="05">THE HUMAN LAYER</SectionTag>
          <h2 className="display-heading my-6">
            Ideas need
            <br />
            <Accent>each other.</Accent>
          </h2>
          <p className="my-6 max-w-[440px] text-sm leading-[1.8] text-muted-foreground">
            Researchers, students, and collaborators bring different lenses to
            the same hard problems. That is where the interesting work begins.
          </p>
          <ArrowLink href="/people">Meet the COiN community</ArrowLink>
        </Reveal>
        <Reveal delay={140}>
          {people.length ? (
            <div className="flex flex-col border-t">
              {people.map((person) => (
                <PersonRow
                  key={person.slug}
                  person={person}
                  photo={person.photo}
                />
              ))}
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
        </Reveal>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section
      className="scroll-mt-20 bg-navy py-16 text-white md:py-24"
      id="contact"
    >
      <div className="wrap grid items-center gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,460px)] lg:gap-16">
        <div>
          <div
            aria-hidden="true"
            className="mb-6 flex size-12 items-center justify-center border border-navy-foreground/60 text-sky md:size-14"
          >
            <Users className="size-6" />
          </div>
          <SectionTag
            className="text-navy-foreground/70 *:first:text-sky"
            number="06"
          >
            YOUR NEXT QUESTION
          </SectionTag>
          <h2 className="display-heading mt-5 mb-4">
            Come build
            <br />
            <Accent className="text-sky">with us.</Accent>
          </h2>
          <p className="max-w-[520px] text-sm leading-[1.7] text-navy-foreground">
            Interested in research, collaboration, or a problem we should be
            thinking about? Send a message — it lands directly in the COiN Lab
            inbox.
          </p>
          <Button
            asChild
            className="mt-4 -ml-4 text-navy-foreground hover:bg-white/10 hover:text-white"
            size="xl"
            variant="ghost"
          >
            <a href="mailto:coinlab@seu.edu.bd">
              Or email coinlab@seu.edu.bd{" "}
              <ChevronRight data-icon="inline-end" />
            </a>
          </Button>
        </div>
        <Reveal delay={100}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
