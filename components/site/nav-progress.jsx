"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Thin loading bar under the browser's toolbar while a page loads.
 * The App Router has no "navigation started" event, so the bar starts when an
 * internal link is clicked and finishes when the pathname changes.
 */
export default function NavProgress() {
  const pathname = usePathname();
  const [state, setState] = useState("idle"); // idle | loading | done
  const timer = useRef(null);

  useEffect(() => {
    const onClick = (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest?.("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      // Same page (including #anchors) or another site: nothing will load here.
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      clearTimeout(timer.current);
      setState("loading");
      // Safety net: never leave the bar stuck if the navigation is cancelled.
      timer.current = setTimeout(() => setState("idle"), 10000);
    };
    // Capture phase: next/link cancels the click before it bubbles this far.
    document.addEventListener("click", onClick, true);
    return () => { document.removeEventListener("click", onClick, true); clearTimeout(timer.current); };
  }, []);

  // The new page has rendered: complete the bar, then reset it.
  useEffect(() => {
    setState((current) => (current === "loading" ? "done" : current));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 550);
  }, [pathname]);

  return <div aria-hidden="true" className="nav-progress" data-state={state} />;
}
