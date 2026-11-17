import { Fragment } from "react";
import Link from "next/link";
import { LazyParticles } from "@/components/home/lazy";
import MottoDiagram from "@/components/home/motto-diagram";
import { ArrowBadge, Chip, Highlight, Scribble } from "@/components/site/typography";
import { Button } from "@/components/ui/button";

// The fields named in the motto, matched to CMS wings by a slug keyword.
const FIELDS = [
  { word: "health", label: "Health", key: "health" },
  { word: "finance", label: "Finance", key: "financ" },
  { word: "security", label: "Security", key: "security" },
  { word: "language", label: "Language", key: "language" },
  { word: "agriculture", label: "Agriculture", key: "agricultur" },
];

const mottoLink = "font-medium text-foreground transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";

/**
 * Opens with the lab motto. Each field in the sentence links to its research
 * wing and is underlined by a pen stroke; the diagram beside it draws the
 * same idea.
 */
export default function Hero({ wings }) {
  const fields = FIELDS.map((field) => {
    const wing = wings.find((item) => item.slug.includes(field.key));
    return { ...field, slug: wing?.slug, href: wing ? `/wings/${wing.slug}` : "/wings" };
  });

  return (
    <section className="relative isolate overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 dot-grid mask-[radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="absolute -top-40 left-1/3 size-[640px] -translate-x-1/2 rounded-full bg-brand/15 blur-[130px]" />
        <LazyParticles className="absolute inset-0 hidden dark:block" color="#7db8ff" quantity={70} size={0.5} staticity={40} />
      </div>

      <div className="wrap grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-8">
        <div className="flex flex-col items-start gap-6 *:animate-fade-up">
          <Chip dot>Computational Intelligence Lab<span className="max-sm:hidden"> · Southeast University</span></Chip>
          <h1 className="text-[clamp(2.5rem,5.6vw+0.5rem,4.75rem)] leading-[1.03] font-bold tracking-[-0.05em] text-balance [animation-delay:80ms]">
            Computational intelligence, in contact with <Scribble delay={900}><Highlight>real questions.</Highlight></Scribble>
          </h1>
          <p className="max-w-[600px] text-base leading-[1.85] text-pretty text-muted-foreground [animation-delay:160ms] md:text-lg">
            COiN Lab brings computational intelligence into contact with real questions—
            {fields.map((field, i) => (
              <Fragment key={field.word}>
                <Link className={mottoLink} href={field.href}><Scribble delay={1300 + i * 180}>{field.word}</Scribble></Link>
                {", "}
              </Fragment>
            ))}
            and the <Link className={mottoLink} href="/people"><Scribble delay={1300 + fields.length * 180}>people</Scribble></Link> living through them.
          </p>
          <div className="flex flex-wrap items-center gap-3 [animation-delay:240ms]">
            <Button asChild size="xl" variant="glow">
              <Link href="/papers">Read our research <ArrowBadge /></Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/people">Meet the lab <ArrowBadge /></Link>
            </Button>
          </div>
        </div>
        <MottoDiagram fields={[...fields.map(({ label, href, slug }) => ({ label, href, slug })), { label: "People", href: "/people" }]} />
      </div>
    </section>
  );
}
