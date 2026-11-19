"use client";
import { useMemo, useState } from "react";
import { Briefcase, ChevronRight, Inbox, Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { isJobOpen } from "@/lib/jobs";
import { collections } from "@/lib/collections";
import { initials, slideDeliveryUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

const markClass =
  "flex size-9 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-[0.5625rem] text-brand";

function Mark({ collection, item }) {
  if (collection === "slides") {
    return (
      <span
        aria-hidden="true"
        className="h-9 w-12 shrink-0 bg-muted bg-cover bg-center"
        style={{
          backgroundImage: `url(${slideDeliveryUrl(item.image, item.transform, { w: 120, h: 80 })})`,
        }}
      />
    );
  }
  if (collection === "jobs") {
    return (
      <span aria-hidden="true" className={markClass}>
        <Briefcase className="size-3.5" />
      </span>
    );
  }
  const text =
    collection === "wings"
      ? item.number
      : collection === "papers"
        ? item.year
        : collection === "partners"
          ? item.abbr
          : collection === "roles"
            ? (item.serial ?? "–")
            : initials(item.name);
  return (
    <span aria-hidden="true" className={markClass}>
      {text}
    </span>
  );
}

const describe = (collection, item) =>
  collection === "slides"
    ? {
        title: item.caption || "Untitled slide",
        detail: `${item.active === false ? "Hidden" : "Live"} · order ${item.number || "–"}`,
      }
    : collection === "jobs"
      ? {
          title: item.title,
          detail: `${isJobOpen(item) ? "Open" : "Closed"} · ${item.type || "Job"}${item.deadline ? ` · by ${item.deadline}` : ""}`,
        }
      : {
          title: item.title || item.name,
          detail:
            item.shortTitle ||
            item.role ||
            item.venue ||
            item.abbr ||
            item.tier,
        };

export default function RecordList({
  collection,
  items,
  loading,
  selectedSlug,
  onSelect,
  className,
}) {
  const noun = collection === "slides" ? "slides" : "records";
  // Filtering waits for a pause in typing, and each record's searchable text
  // is built once per load rather than on every keystroke.
  const [query, setQuery] = useState("");
  const needle = useDebouncedValue(query.trim().toLowerCase(), 200);
  const indexed = useMemo(
    () =>
      items.map((item) => {
        const { title, detail } = describe(collection, item);
        return {
          item,
          title,
          detail,
          text: `${title} ${detail}`.toLowerCase(),
        };
      }),
    [items, collection],
  );
  const shown = needle
    ? indexed.filter((entry) => entry.text.includes(needle))
    : indexed;
  return (
    <Card className={cn("gap-0 py-0", className)}>
      <CardHeader className="label-caps flex items-center justify-between border-b py-3.5 text-[0.5625rem] text-muted-foreground">
        <span>{loading ? "Loading…" : `${items.length} ${noun}`}</span>
        <span>Select to edit</span>
      </CardHeader>
      {items.length > 6 && (
        <div className="relative border-b p-2.5">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-5.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label={`Search ${noun}`}
            className="pl-9"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            type="search"
            value={query}
          />
        </div>
      )}
      <CardContent className="max-h-[420px] overflow-y-auto px-0 lg:max-h-[calc(100svh-15rem)]">
        {loading ? (
          <div className="flex flex-col gap-3 p-4">
            {[0, 1, 2, 3].map((row) => (
              <Skeleton className="h-9 w-full" key={row} />
            ))}
          </div>
        ) : shown.length ? (
          <ul>
            {shown.map(({ item, title, detail }) => {
              return (
                <li className="border-b last:border-b-0" key={item.slug}>
                  <Item
                    asChild
                    className={cn(
                      "cursor-pointer border-0 px-3.5 py-3 text-left hover:bg-muted focus-visible:bg-muted focus-visible:ring-0",
                      selectedSlug === item.slug && "bg-accent",
                    )}
                  >
                    <button
                      aria-current={selectedSlug === item.slug || undefined}
                      onClick={() => onSelect(item)}
                      type="button"
                    >
                      <ItemMedia>
                        <Mark collection={collection} item={item} />
                      </ItemMedia>
                      <ItemContent className="min-w-0 gap-0.5">
                        <ItemTitle className="block w-full truncate font-bold">
                          {title}
                        </ItemTitle>
                        {detail && (
                          <ItemDescription className="line-clamp-1">
                            {detail}
                          </ItemDescription>
                        )}
                      </ItemContent>
                      <ItemActions>
                        <ChevronRight
                          aria-hidden="true"
                          className="size-4 text-muted-foreground"
                        />
                      </ItemActions>
                    </button>
                  </Item>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Inbox />
              </EmptyMedia>
              <EmptyTitle>
                {items.length ? "Nothing matches" : `No ${noun} yet`}
              </EmptyTitle>
              <EmptyDescription>
                {items.length
                  ? "Try a different search term."
                  : `Fill in the form and save to add the first ${collections[collection].singular}.`}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
