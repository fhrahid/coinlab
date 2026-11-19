"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Client-only pieces that are not needed for first paint. Loading them after
// hydration keeps their JavaScript out of the homepage's initial bundle.
export const LazyParticles = dynamic(
  () => import("@/components/ui/particles").then((mod) => mod.Particles),
  { ssr: false },
);

export const LazyContactForm = dynamic(
  () => import("@/components/site/contact-form"),
  {
    ssr: false,
    // Same footprint as the form, so nothing shifts when it arrives.
    loading: () => <Skeleton className="h-[520px] w-full rounded-2xl" />,
  },
);
