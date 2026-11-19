import { SectionHeader } from "@/components/site/typography";

// Title block shared by every inner page. `children` is the lead paragraph;
// `before` renders above the chip (breadcrumbs) and `after` below the lead.
export default function PageHero({ chip, title, children, before, after }) {
  return (
    <div className="relative isolate overflow-hidden border-b">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 dot-grid mask-[linear-gradient(to_bottom,black,transparent)] opacity-70"
      />
      <div
        aria-hidden="true"
        className="absolute -top-40 left-1/2 -z-10 h-80 w-[min(90vw,900px)] -translate-x-1/2 rounded-full bg-brand/15 blur-[100px]"
      />
      <div className="wrap flex flex-col gap-6 pt-32 pb-12 md:pt-40 md:pb-16">
        {before}
        <SectionHeader
          as="h1"
          chip={chip}
          className="animate-fade-up"
          title={title}
        >
          {children}
        </SectionHeader>
        {after}
      </div>
    </div>
  );
}
