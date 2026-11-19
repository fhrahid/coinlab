"use client";
import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import PublicationList from "@/components/site/publication-list";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "all";

function Filter({ label, value, onChange, options }) {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger aria-label={label} className="w-full sm:w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={ALL}>All {label.toLowerCase()}s</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

// Search and filter over the archive. The list is small and already on the
// page, so filtering happens in the browser with no extra requests.
export default function PapersBrowser({ publications }) {
  const [query, setQuery] = useState("");
  const [wing, setWing] = useState(ALL);
  const [year, setYear] = useState(ALL);
  const [type, setType] = useState(ALL);

  const options = useMemo(() => {
    const wings = new Map(
      publications.flatMap((pub) => pub.wings.map((w) => [w.slug, w.title])),
    );
    const unique = (values) => [...new Set(values.filter(Boolean).map(String))];
    return {
      wings: [...wings].map(([value, label]) => ({ value, label })),
      years: unique(publications.map((pub) => pub.year))
        .sort()
        .reverse()
        .map((value) => ({ value, label: value })),
      types: unique(publications.map((pub) => pub.type)).map((value) => ({
        value,
        label: value,
      })),
    };
  }, [publications]);

  // Typing updates the input at once; filtering waits for a pause, and each
  // paper's searchable text is lower-cased once instead of on every keystroke.
  const needle = useDebouncedValue(query.trim().toLowerCase(), 200);
  const haystacks = useMemo(
    () =>
      new Map(
        publications.map((pub) => [
          pub.slug,
          [pub.title, pub.venue, ...pub.authors.map((a) => a.name)]
            .join(" ")
            .toLowerCase(),
        ]),
      ),
    [publications],
  );

  const shown = useMemo(() => {
    return publications.filter(
      (pub) =>
        (wing === ALL || pub.wings.some((w) => w.slug === wing)) &&
        (year === ALL || String(pub.year) === year) &&
        (type === ALL || pub.type === type) &&
        (!needle || haystacks.get(pub.slug).includes(needle)),
    );
  }, [publications, haystacks, needle, wing, year, type]);

  const reset = () => {
    setQuery("");
    setWing(ALL);
    setYear(ALL);
    setType(ALL);
  };

  return (
    <div className="flex flex-col gap-6">
      <search className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:min-w-64">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Search publications"
            className="pl-10"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, author or venue"
            type="search"
            value={query}
          />
        </div>
        {options.wings.length > 1 && (
          <Filter
            label="Wing"
            onChange={setWing}
            options={options.wings}
            value={wing}
          />
        )}
        {options.years.length > 1 && (
          <Filter
            label="Year"
            onChange={setYear}
            options={options.years}
            value={year}
          />
        )}
        {options.types.length > 1 && (
          <Filter
            label="Type"
            onChange={setType}
            options={options.types}
            value={type}
          />
        )}
      </search>
      <p aria-live="polite" className="label-caps text-muted-foreground">
        {shown.length} of {publications.length}{" "}
        {publications.length === 1 ? "publication" : "publications"}
      </p>
      {shown.length ? (
        <PublicationList publications={shown} />
      ) : (
        <Empty className="rounded-3xl border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>No publications match</EmptyTitle>
            <EmptyDescription>
              Try a different search term or clear the filters.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={reset} variant="outline">
              Clear filters
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
