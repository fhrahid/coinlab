import Link from "next/link";
import { Users } from "lucide-react";
import { wingIcon } from "@/components/site/wing-icons";

const round = (n) => Math.round(n * 100) / 100;

/**
 * The lab motto as a picture: computational intelligence (centre) drawn into
 * contact with each real-world field and the people in it. Lines sketch
 * themselves outward on load; every node links to its wing.
 *
 * `fields`: [{ label, href, slug? }] placed evenly around the centre.
 */
export default function MottoDiagram({ fields }) {
  const nodes = fields.map((field, i) => {
    const angle = (-90 + (360 / fields.length) * i) * (Math.PI / 180);
    const x = 50 + 38 * Math.cos(angle);
    const y = 50 + 38 * Math.sin(angle);
    // Control point pushed sideways so each line bows like a pen stroke.
    const cx = 50 + 21 * Math.cos(angle + 0.45);
    const cy = 50 + 21 * Math.sin(angle + 0.45);
    return { ...field, x: round(x), y: round(y), d: `M50 50 Q ${round(cx)} ${round(cy)} ${round(x)} ${round(y)}`, delay: 500 + i * 140 };
  });

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      <div aria-hidden="true" className="absolute inset-[18%] rounded-full bg-brand/20 blur-[70px]" />
      <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="motto-line" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="var(--brand)" />
            <stop offset="1" stopColor="var(--brand-2)" />
          </linearGradient>
        </defs>
        <circle className="animate-draw motion-reduce:animate-none" cx="50" cy="50" fill="none" pathLength="1" r="38" stroke="var(--border)" strokeDasharray="1" strokeWidth="0.3" style={{ animationDuration: "1.6s" }} />
        <circle cx="50" cy="50" fill="none" r="24" stroke="var(--border)" strokeDasharray="0.6 1.6" strokeWidth="0.3" />
        {nodes.map((node) => (
          <path className="animate-draw motion-reduce:animate-none" d={node.d} fill="none" key={node.label} pathLength="1" stroke="url(#motto-line)" strokeDasharray="1" strokeLinecap="round" strokeWidth="0.5" style={{ animationDelay: `${node.delay}ms` }} />
        ))}
      </svg>

      <div className="absolute top-1/2 left-1/2 flex size-[26%] -translate-1/2 flex-col items-center justify-center rounded-full border border-brand/40 bg-card text-center shadow-[0_0_60px_-10px_var(--brand)]">
        <span className="text-lg leading-none font-bold tracking-tight sm:text-2xl">COiN</span>
        <span className="label-caps mt-1 text-[0.5rem] text-muted-foreground sm:text-[0.5625rem]">intelligence</span>
      </div>

      <ul aria-label="Fields the lab works in">
        {nodes.map((node, i) => {
          const Icon = node.slug ? wingIcon(node.slug) : Users;
          return (
            <li className="absolute -translate-1/2 animate-fade-up" key={node.label} style={{ left: `${node.x}%`, top: `${node.y}%`, animationDelay: `${node.delay + 500}ms` }}>
              <Link
                className="group/node flex animate-float flex-col items-center gap-1.5 rounded-2xl p-1 focus-visible:outline-2 focus-visible:outline-ring motion-reduce:animate-none"
                href={node.href}
                style={{ animationDelay: `${-i * 900}ms` }}
              >
                <span className="flex size-11 items-center justify-center rounded-full border bg-card text-brand shadow-lg transition-[scale,border-color] duration-300 group-hover/node:scale-110 group-hover/node:border-brand sm:size-14">
                  <Icon aria-hidden="true" className="size-5 sm:size-6" />
                </span>
                <span className="label-caps rounded-full bg-background/85 px-1.5 text-[0.5625rem] text-muted-foreground transition-colors group-hover/node:text-foreground sm:text-[0.625rem]">{node.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
