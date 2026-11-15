'use client';
import { useEffect, useState } from 'react';

// Crossfading hero slideshow with a subtle Ken Burns drift. Respects
// prefers-reduced-motion (no auto-advance, no zoom). Dots allow manual pick.
export default function HeroSlideshow({ slides }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % slides.length), 5200);
    return () => clearInterval(timer);
  }, [slides.length]);
  return (
    <div className="hero-slideshow">
      {slides.map((slide, i) => (
        <div aria-hidden={i !== index} className={i === index ? 'hero-slide active' : 'hero-slide'} key={slide.slug}>
          <div className="hero-slide-image" style={{ backgroundImage: `url(${slide.url})` }} />
          {slide.dim > 0 && <div className="hero-slide-dim" style={{ opacity: slide.dim / 100 }} />}
        </div>
      ))}
      {slides[index]?.caption && <div className="hero-slide-caption" key={`caption-${slides[index].slug}`}><span>{slides[index].caption}</span></div>}
      {slides.length > 1 && <div className="hero-slide-dots">{slides.map((slide, i) => <button aria-label={`Show slide ${i + 1}`} className={i === index ? 'hero-dot active' : 'hero-dot'} key={slide.slug} onClick={() => setIndex(i)} type="button" />)}</div>}
    </div>
  );
}
