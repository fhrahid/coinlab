"use client";
import { useEffect } from "react";

// One passive listener for the whole site: tells the element under the cursor
// marked `data-spotlight` where the cursor is, so CSS can draw the glow.
export default function PointerGlow() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;
    const onMove = (event) => {
      const target = event.target.closest?.("[data-spotlight]");
      if (!target) return;
      const box = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${event.clientX - box.left}px`);
      target.style.setProperty("--my", `${event.clientY - box.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);
  return null;
}
