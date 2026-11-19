"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const icon = "absolute transition-[rotate,scale,opacity] duration-500 ease-out";

// Both icons render and CSS picks one, so the markup is identical on the
// server and the client whatever the stored theme is.
export default function ThemeToggle({ className }) {
  const { resolvedTheme, setTheme } = useTheme();

  const toggle = (event) => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!document.startViewTransition || reduced) {
      setTheme(next);
      return;
    }
    // The new theme grows in a circle from the button (see globals.css).
    const box = event.currentTarget.getBoundingClientRect();
    const root = document.documentElement;
    root.style.setProperty("--reveal-x", `${box.left + box.width / 2}px`);
    root.style.setProperty("--reveal-y", `${box.top + box.height / 2}px`);
    document.startViewTransition(() => {
      // Applied synchronously so the transition captures the new theme;
      // next-themes then stores the choice.
      root.classList.toggle("dark", next === "dark");
      setTheme(next);
    });
  };

  return (
    <Button
      aria-label="Switch between light and dark theme"
      className={className}
      onClick={toggle}
      size="icon"
      variant="ghost"
    >
      <Sun
        className={`${icon} scale-0 -rotate-90 opacity-0 dark:scale-100 dark:rotate-0 dark:opacity-100`}
      />
      <Moon
        className={`${icon} scale-100 rotate-0 opacity-100 dark:scale-0 dark:rotate-90 dark:opacity-0`}
      />
    </Button>
  );
}
