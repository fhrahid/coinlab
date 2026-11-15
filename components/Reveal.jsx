'use client';
import { useEffect, useRef } from 'react';

// Scroll-reveal wrapper: fades content up the first time it enters the
// viewport. Falls back to instantly visible for reduced-motion users and
// when IntersectionObserver is unavailable.
export default function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.classList.add('is-visible'); return; }
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { el.classList.add('is-visible'); observer.disconnect(); } }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return <div className={`reveal ${className}`.trim()} ref={ref} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>{children}</div>;
}
