import { Eyebrow } from "@/components/site/typography";

// Title block shared by the listing pages (wings, people, papers).
export default function PageHero({ eyebrow, title, children }) {
  return (
    <div className="wrap pt-12 pb-9 md:pt-20 md:pb-14">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="display-heading mt-4 mb-5">{title}</h1>
      {children && (
        <p className="max-w-[520px] text-sm leading-[1.8] text-muted-foreground">
          {children}
        </p>
      )}
    </div>
  );
}
