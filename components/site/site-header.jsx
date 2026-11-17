"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Menu } from "lucide-react";
import ThemeToggle from "@/components/site/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { href: "/wings", label: "Research", hasMenu: true },
  { href: "/papers", label: "Publications" },
  { href: "/people", label: "People" },
  { href: "/jobs", label: "Jobs" },
  { href: "/#method", label: "Method" },
];

// Desktop link: a short bar grows under the current section.
const navLink = "relative text-muted-foreground after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-brand after:transition-transform after:duration-300 hover:after:scale-x-100 data-active:text-foreground data-active:after:scale-x-100";

const mobileLink = "flex min-h-12 items-center rounded-xl px-3 text-base font-medium hover:bg-muted focus-visible:bg-muted focus-visible:outline-none";
const mobileSubLink = "flex min-h-11 items-center justify-between gap-2 rounded-xl px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:outline-none";

// Floating pill navigation. `wings` comes from the CMS (via the site layout),
// so wings added there show up in the menu without a code change.
export default function SiteHeader({ wings = [] }) {
  const pathname = usePathname();
  const isActive = (href) => !href.includes("#") && pathname.startsWith(href);
  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-40 px-3 sm:top-4">
      <div className="pointer-events-auto mx-auto flex h-14 max-w-[1080px] items-center gap-2 rounded-full border bg-background/75 pr-2 pl-4 shadow-lg shadow-black/5 backdrop-blur-xl sm:h-16 sm:pl-6 dark:shadow-black/40">
        <Link aria-label="COiN Lab home" className="mr-auto flex shrink-0 items-center rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" href="/">
          {/* The logo is drawn in dark navy; on the dark theme it sits on a light plate. */}
          <img alt="COiN Lab" className="h-8 w-auto rounded-md sm:h-9 dark:bg-white/95 dark:px-1.5 dark:py-0.5" height={36} src="/logo.svg" width={112} />
        </Link>

        <nav aria-label="Main" className="hidden items-center lg:flex">
          {links.map((link) =>
            link.hasMenu && wings.length ? (
              <DropdownMenu key={link.href}>
                <DropdownMenuTrigger asChild>
                  <Button className={navLink} data-active={isActive(link.href)} variant="ghost">
                    {link.label}
                    <ChevronDown data-icon="inline-end" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuGroup>
                    {wings.map((wing) => (
                      <DropdownMenuItem asChild key={wing.slug}>
                        <Link className="justify-between" href={`/wings/${wing.slug}`}>
                          {wing.shortTitle || wing.title}
                          <ArrowUpRight />
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link className="font-medium" href="/wings">All research wings</Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className={navLink} data-active={isActive(link.href)} key={link.href} variant="ghost">
                <Link aria-current={isActive(link.href) ? "page" : undefined} href={link.href}>{link.label}</Link>
              </Button>
            ),
          )}
        </nav>

        <ThemeToggle className="size-10" />
        <Button asChild className="hidden sm:inline-flex" size="lg" variant="glow">
          <Link href="/#contact">Collaborate</Link>
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button aria-label="Open menu" className="size-10 lg:hidden" size="icon" variant="outline">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[min(88vw,360px)] gap-0 overflow-y-auto" side="right">
            <SheetHeader className="border-b">
              <SheetTitle>COiN Lab</SheetTitle>
              <SheetDescription>Computational Intelligence Lab</SheetDescription>
            </SheetHeader>
            <nav aria-label="Mobile" className="flex flex-col gap-0.5 p-3">
              <SheetClose asChild><Link className={mobileLink} href="/">Home</Link></SheetClose>
              {links.map((link) => (
                <div key={link.href}>
                  <SheetClose asChild><Link className={mobileLink} href={link.href}>{link.label}</Link></SheetClose>
                  {link.hasMenu && wings.length > 0 && (
                    <div className="mb-1 ml-3 flex flex-col border-l pl-1">
                      {wings.map((wing) => (
                        <SheetClose asChild key={wing.slug}>
                          <Link className={mobileSubLink} href={`/wings/${wing.slug}`}>
                            {wing.shortTitle || wing.title}
                            <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
            <div className="mt-auto border-t p-4">
              <SheetClose asChild>
                <Button asChild className="w-full" size="xl" variant="glow">
                  <Link href="/#contact">Collaborate with us</Link>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
