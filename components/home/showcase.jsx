"use client";
import { useEffect, useRef, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const DELAY = 6000;
const arrow = "size-11 border-white/25 bg-black/35 text-white backdrop-blur-md hover:bg-black/55 hover:text-white disabled:opacity-0";

/**
 * Photo panel shown after the people section. Photos come from
 * the CMS "Hero slideshow" collection. Autoplay stops for reduced-motion users
 * and anyone can pause it (WCAG 2.2.2).
 */
export default function Showcase({ slides }) {
  const [api, setApi] = useState(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(slides.length > 1);
  const plugins = useRef([Autoplay({ delay: DELAY, stopOnInteraction: false, stopOnMouseEnter: true })]);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setIndex(api.selectedScrollSnap());
    api.on("select", onSelect);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      api.plugins().autoplay?.stop();
      setPlaying(false);
    }
    return () => api.off("select", onSelect);
  }, [api]);

  const toggle = () => {
    const autoplay = api?.plugins().autoplay;
    if (!autoplay) return;
    if (playing) autoplay.stop();
    else autoplay.play();
    setPlaying(!playing);
  };

  const many = slides.length > 1;
  return (
    <section aria-label="The lab in pictures" className="pb-20 md:pb-28">
      <div className="wrap">
        <Carousel className="bezel reveal overflow-hidden rounded-[2rem] border bg-card shadow-2xl shadow-black/20" opts={{ loop: true }} plugins={plugins.current} setApi={setApi}>
          <CarouselContent className="ml-0">
            {slides.map((slide, i) => (
              <CarouselItem className="relative aspect-4/3 overflow-hidden pl-0 sm:aspect-2/1" key={slide.slug}>
                <img
                  alt={slide.caption || ""}
                  className={cn("size-full object-cover", i === index && playing && "animate-kenburns")}
                  decoding="async"
                  loading={i === 0 ? "eager" : "lazy"}
                  sizes="(min-width: 1280px) 1216px, 100vw"
                  src={slide.src}
                  srcSet={slide.srcSet}
                />
                {slide.dim > 0 && <div className="absolute inset-0 bg-navy" style={{ opacity: slide.dim / 100 }} />}
              </CarouselItem>
            ))}
          </CarouselContent>

          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/70 to-transparent" />
          {many && <CarouselPrevious className={cn(arrow, "left-3 sm:left-5")} />}
          {many && <CarouselNext className={cn(arrow, "right-3 sm:right-5")} />}

          <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-4 sm:p-6">
            {slides[index]?.caption && <p className="mr-auto line-clamp-1 min-w-0 animate-fade-up text-sm font-medium text-white sm:text-base" key={slides[index].slug}>{slides[index].caption}</p>}
            {many && (
              <div className="ml-auto flex shrink-0 items-center gap-1">
                {slides.map((slide, i) => (
                  <button aria-current={i === index} aria-label={`Show photo ${i + 1} of ${slides.length}`} className="group/dot flex h-8 w-8 items-center focus-visible:outline-2 focus-visible:outline-white sm:w-10" key={slide.slug} onClick={() => api?.scrollTo(i)} type="button">
                    <span className="relative h-0.5 w-full overflow-hidden rounded-full bg-white/35 group-hover/dot:bg-white/60">
                      {i === index && <span className={cn("absolute inset-0 origin-left bg-white", playing && "animate-[slide-progress_linear_both]")} style={{ animationDuration: `${DELAY}ms` }} />}
                    </span>
                  </button>
                ))}
                <Button aria-label={playing ? "Pause slideshow" : "Play slideshow"} className="ml-1 text-white hover:bg-white/15 hover:text-white" onClick={toggle} size="icon-sm" variant="ghost">
                  {playing ? <Pause /> : <Play />}
                </Button>
              </div>
            )}
          </div>
        </Carousel>
      </div>
    </section>
  );
}
