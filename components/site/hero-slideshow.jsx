"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Crossfading hero slideshow with a subtle Ken Burns drift. Respects
// prefers-reduced-motion (no auto-advance, no zoom). Dots allow manual pick.
export default function HeroSlideshow({ slides }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (
      slides.length < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % slides.length),
      5200,
    );
    return () => clearInterval(timer);
  }, [slides.length]);
  const current = slides[index];
  return (
    <div className="relative size-full overflow-hidden bg-navy">
      {slides.map((slide, i) => (
        <div
          aria-hidden={i !== index}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            i === index ? "opacity-100" : "opacity-0",
          )}
          key={slide.slug}
        >
          <div
            className={cn(
              "absolute inset-0 bg-cover bg-center",
              i === index && "animate-kenburns motion-reduce:animate-none",
            )}
            style={{ backgroundImage: `url(${slide.url})` }}
          />
          {slide.dim > 0 && (
            <div
              className="absolute inset-0 bg-navy"
              style={{ opacity: slide.dim / 100 }}
            />
          )}
        </div>
      ))}
      {current?.caption && (
        <div
          className="absolute bottom-4 left-3.5 max-w-[75%] animate-fade-up motion-reduce:animate-none"
          key={`caption-${current.slug}`}
        >
          <span className="label-caps inline-block bg-white/92 px-2.5 py-1.5 tracking-[0.08em] text-foreground">
            {current.caption}
          </span>
        </div>
      )}
      {slides.length > 1 && (
        <div className="absolute right-2 bottom-2 flex">
          {slides.map((slide, i) => (
            <button
              aria-current={i === index}
              aria-label={`Show slide ${i + 1}`}
              className="group/dot flex size-6 items-center justify-center focus-visible:outline-2 focus-visible:outline-white"
              key={slide.slug}
              onClick={() => setIndex(i)}
              type="button"
            >
              <span
                className={cn(
                  "size-2 rounded-full border border-white/80 transition-transform",
                  i === index
                    ? "scale-125 bg-white"
                    : "group-hover/dot:bg-white/50",
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
