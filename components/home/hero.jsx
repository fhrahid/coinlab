import Link from "next/link";
import {
  ArrowUpRight,
  BrainCircuit,
  ChevronRight,
  FlaskConical,
  Network,
  Sparkles,
  Sprout,
} from "lucide-react";
import HeroSlideshow from "@/components/site/hero-slideshow";
import { Accent } from "@/components/site/typography";
import { Button } from "@/components/ui/button";

const nodes = [
  {
    label: "NETWORKS",
    icon: Network,
    position: "left-0 top-[26%] sm:left-[2%]",
    line: "left-[15%] top-[33%] w-[30%] rotate-[19deg]",
  },
  {
    label: "LANGUAGE",
    icon: Sparkles,
    position: "right-0 top-[31%]",
    line: "right-[17%] top-[36%] w-[26%] rotate-[155deg]",
  },
  {
    label: "DISCOVERY",
    icon: FlaskConical,
    position: "left-0 bottom-[17%] sm:left-[4%]",
    line: "left-[16%] bottom-[27%] w-[29%] -rotate-[10deg]",
  },
  {
    label: "IMPACT",
    icon: Sprout,
    position: "right-0 bottom-[15%] sm:right-[5%]",
    line: "right-[18%] bottom-[26%] w-[28%] rotate-[166deg]",
  },
];

// Decorative orbit diagram shown until hero photos are added in the CMS.
function HeroDiagram() {
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <div className="absolute top-1/2 left-1/2 h-[66%] w-[min(94%,490px)] -translate-1/2 -rotate-[28deg] rounded-full border border-sky/40" />
      <div className="absolute top-1/2 left-1/2 h-[86%] w-3/4 -translate-1/2 rotate-[43deg] rounded-full border border-sky/20" />
      <div className="label-caps absolute top-[5%] right-[2%] text-right text-[0.5625rem] text-navy-foreground/70">
        COMPUTATIONAL
        <br />
        INTELLIGENCE
      </div>
      <div className="absolute top-1/2 left-1/2 z-10 flex size-[122px] -translate-1/2 flex-col items-center justify-center gap-2 rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--brand),#15204e_70%)] text-sky shadow-[0_0_0_14px_rgb(156_205_238/0.06),0_0_80px_rgb(159_208_240/0.25)] sm:size-[168px]">
        <BrainCircuit className="size-9 sm:size-13" />
        <span className="text-center font-mono text-xs leading-tight tracking-[0.18em]">
          COiN
          <br />
          <small className="text-[0.5rem] text-white">LAB</small>
        </span>
      </div>
      {nodes.map(({ label, icon: Icon, position, line }) => (
        <div key={label}>
          <div
            className={`absolute z-10 flex items-center gap-1.5 font-mono text-[0.4375rem] tracking-[0.08em] text-navy-foreground sm:gap-2 sm:text-[0.5625rem] ${position}`}
          >
            <Icon className="size-4 sm:size-[19px]" />
            <span>{label}</span>
          </div>
          <div className={`absolute h-px origin-left bg-sky/40 ${line}`} />
        </div>
      ))}
    </div>
  );
}

export default function Hero({ slides }) {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(30deg,transparent_48%,#9fd0f0_49%,transparent_50%),linear-gradient(150deg,transparent_48%,#4a5fb8_49%,transparent_50%)] bg-size-[84px_84px] opacity-15 mask-[linear-gradient(90deg,#000,transparent_85%)]"
      />
      <div className="wrap relative grid items-center gap-6 pt-12 pb-4 md:min-h-[620px] md:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] md:gap-8 md:py-16 lg:gap-10">
        <div className="*:animate-fade-up motion-reduce:*:animate-none">
          <p className="label-caps flex items-center gap-2.5 text-[#a9bce4]">
            <span aria-hidden="true" className="size-2 rounded-full bg-sky" />
            SOUTHEAST UNIVERSITY · EST. 2025
          </p>
          <h1 className="my-6 text-[clamp(2.75rem,13vw,4.75rem)] leading-[0.92] font-extrabold tracking-[-0.075em] [animation-delay:90ms] md:my-7 md:text-[clamp(3.25rem,7.4vw,6.5rem)]">
            Research with
            <br />
            <Accent className="text-sky">consequence.</Accent>
          </h1>
          <p className="mb-8 max-w-[510px] text-sm leading-[1.8] text-navy-foreground [animation-delay:180ms] md:text-[15px]">
            COiN Lab brings computational intelligence into contact with real
            questions—health, finance, security, language, agriculture, and the
            people living through them.
          </p>
          <div className="flex flex-col items-start gap-3 [animation-delay:270ms] sm:flex-row sm:items-center sm:gap-4">
            <Button asChild size="xl" variant="secondary">
              <Link href="/wings">
                Explore our wings <ArrowUpRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button
              asChild
              className="text-navy-foreground hover:bg-white/10 hover:text-white"
              size="xl"
              variant="ghost"
            >
              <Link href="/people">
                Meet the people <ChevronRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative mx-auto h-[clamp(260px,70vw,370px)] w-full max-w-[560px] animate-fade-up [animation-delay:200ms] motion-reduce:animate-none md:h-[480px]">
          {slides.length ? <HeroSlideshow slides={slides} /> : <HeroDiagram />}
        </div>
      </div>
      <div className="wrap label-caps relative flex justify-between gap-3 pb-6 text-[0.5rem] text-navy-foreground/55 sm:text-[0.5625rem]">
        <span>BUILDING RESPONSIBLE INTELLIGENCE</span>
        <span>↓ Scroll to explore</span>
      </div>
    </section>
  );
}
