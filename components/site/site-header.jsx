"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/wings", label: "Research wings", hasMenu: true },
  { href: "/people", label: "People" },
  { href: "/papers", label: "Papers" },
];

const mobileLink =
  "flex min-h-12 items-center px-3 text-sm font-semibold hover:bg-muted focus-visible:bg-muted focus-visible:outline-none";
const mobileSubLink =
  "flex min-h-11 items-center justify-between gap-2 px-3 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:outline-none";

// `wings` comes from the CMS (via the site layout), so wings added there show
// up in the menu without a code change.
export default function SiteHeader({ wings = [] }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
      <div className="wrap flex h-[68px] items-center justify-between gap-4 lg:h-20">
        <Link
          className="flex min-w-0 items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:gap-3"
          href="/"
        >
          <img
            alt="COiN Lab logo"
            className="size-9 shrink-0 rounded-full bg-white object-contain p-0.5 lg:size-[42px]"
            height={42}
            src="/coinlab-logo.jpg"
            width={42}
          />
          <span className="min-w-0">
            <b className="block text-[15px] leading-tight font-extrabold tracking-[0.11em] lg:text-[17px]">
              COiN LAB
            </b>
            <small className="block truncate font-mono text-[0.5625rem] tracking-[0.02em] text-muted-foreground">
              SOUTHEAST UNIVERSITY
            </small>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {links.map((link) =>
            link.hasMenu && wings.length ? (
              <DropdownMenu key={link.href}>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="font-semibold text-ink-soft"
                    size="lg"
                    variant="ghost"
                  >
                    {link.label}
                    <ChevronDown data-icon="inline-end" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-60">
                  <DropdownMenuGroup>
                    {wings.map((wing) => (
                      <DropdownMenuItem asChild key={wing.slug}>
                        <Link
                          className="justify-between"
                          href={`/wings/${wing.slug}`}
                        >
                          {wing.shortTitle || wing.title}
                          <ArrowUpRight />
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link className="font-semibold" href="/wings">
                        All research wings
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                className="font-semibold text-ink-soft"
                key={link.href}
                size="lg"
                variant="ghost"
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ),
          )}
          <Button asChild className="ml-3" size="xl">
            <Link href="/#contact">
              Get in touch
              <ArrowUpRight data-icon="inline-end" />
            </Link>
          </Button>
        </nav>

        <Sheet onOpenChange={setOpen} open={open}>
          <SheetTrigger asChild>
            <Button
              aria-label="Open menu"
              className="size-11 lg:hidden"
              size="icon-lg"
              variant="outline"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent
            className="w-[min(88vw,360px)] gap-0 overflow-y-auto"
            side="right"
          >
            <SheetHeader className="border-b">
              <SheetTitle className="text-base font-extrabold tracking-[0.08em]">
                COiN LAB
              </SheetTitle>
              <SheetDescription>
                Computational Intelligence Lab
              </SheetDescription>
            </SheetHeader>
            <nav aria-label="Mobile" className="flex flex-col p-2">
              {links.map((link) => (
                <div key={link.href}>
                  <SheetClose asChild>
                    <Link className={mobileLink} href={link.href}>
                      {link.label}
                    </Link>
                  </SheetClose>
                  {link.hasMenu && wings.length > 0 && (
                    <div className="mb-1 ml-3 flex flex-col border-l">
                      {wings.map((wing) => (
                        <SheetClose asChild key={wing.slug}>
                          <Link
                            className={mobileSubLink}
                            href={`/wings/${wing.slug}`}
                          >
                            {wing.shortTitle || wing.title}
                            <ArrowUpRight
                              aria-hidden="true"
                              className="size-3.5 shrink-0"
                            />
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
                <Button asChild className="w-full" size="xl">
                  <Link href="/#contact">
                    Get in touch
                    <ArrowUpRight data-icon="inline-end" />
                  </Link>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
