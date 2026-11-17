"use client";
import { useRef, useState } from "react";
import {
  Bold,
  Check,
  ClipboardPaste,
  Heading3,
  Italic,
  Link2,
  List,
} from "lucide-react";
import RichText from "@/components/site/rich-text";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { parseCitation } from "@/lib/citation";
import { cn } from "@/lib/utils";

export const humanize = (key) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

// Single-line input, or a textarea when `rows` > 1 (which then spans the form).
export function TextField({
  name,
  label = humanize(name),
  value,
  onChange,
  rows = 1,
  placeholder,
  className,
  ...props
}) {
  const id = `field-${name}`;
  const shared = {
    id,
    value: value ?? "",
    onChange: (e) => onChange(e.target.value),
    placeholder,
  };
  return (
    <Field className={cn(rows > 1 && "sm:col-span-2", className)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {rows > 1 ? (
        <Textarea rows={rows} {...shared} {...props} />
      ) : (
        <Input {...shared} {...props} />
      )}
    </Field>
  );
}

export function SelectField({
  name,
  label = humanize(name),
  value,
  onChange,
  options,
  format = (option) => option,
  className,
}) {
  const id = `field-${name}`;
  return (
    <Field className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger className="w-full" id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {format(option)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}

// Wings are always picked from the list, never typed.
export function WingPicker({ wings, value = [], onChange }) {
  const toggle = (slug) =>
    onChange(
      value.includes(slug) ? value.filter((s) => s !== slug) : [...value, slug],
    );
  return (
    <FieldSet className="gap-0 sm:col-span-2">
      <FieldLegend
        className="label-caps mb-2.5 text-muted-foreground"
        variant="label"
      >
        Research wings
      </FieldLegend>
      {wings.length ? (
        <div className="flex flex-wrap gap-2">
          {wings.map((wing) => (
            <label
              className="flex min-h-10 cursor-pointer items-center gap-2 border bg-card px-3 text-xs font-semibold has-data-checked:border-brand/50 has-data-checked:bg-accent has-focus-visible:border-ring"
              key={wing.slug}
            >
              <Checkbox
                checked={value.includes(wing.slug)}
                onCheckedChange={() => toggle(wing.slug)}
              />
              {wing.shortTitle || wing.title}
            </label>
          ))}
        </div>
      ) : (
        <FieldDescription>
          Add research wings first to connect them here.
        </FieldDescription>
      )}
    </FieldSet>
  );
}

const bioTools = [
  { label: "Bold", icon: Bold, wrap: "**" },
  { label: "Italic", icon: Italic, wrap: "*" },
  { label: "Heading", icon: Heading3, prefix: "### " },
  { label: "Bullet list", icon: List, prefix: "- " },
  { label: "Link", icon: Link2, link: true },
];

// Markdown textarea with a formatting toolbar and a live preview.
export function BioEditor({
  value = "",
  onChange,
  label = "Bio",
  name = "bio",
  placeholder = "Short research biography — use the toolbar for headings, bold, italic, lists and links",
  rows = 7,
}) {
  const ref = useRef(null);
  const focusAt = (caret) =>
    requestAnimationFrame(() => {
      const el = ref.current;
      if (el) {
        el.focus();
        el.setSelectionRange(caret, caret);
      }
    });

  const apply = (tool) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, value: text } = el;
    if (tool.wrap) {
      onChange(
        `${text.slice(0, start)}${tool.wrap}${text.slice(start, end)}${tool.wrap}${text.slice(end)}`,
      );
      focusAt(end + tool.wrap.length);
    } else if (tool.prefix) {
      const lineStart = text.lastIndexOf("\n", start - 1) + 1;
      onChange(
        `${text.slice(0, lineStart)}${tool.prefix}${text.slice(lineStart)}`,
      );
      focusAt(start + tool.prefix.length);
    } else {
      const selected = text.slice(start, end) || "link text";
      onChange(
        `${text.slice(0, start)}[${selected}](https://)${text.slice(end)}`,
      );
      focusAt(start + selected.length + 11);
    }
  };

  return (
    <Field className="sm:col-span-2">
      <FieldLabel htmlFor={`field-${name}`}>{label}</FieldLabel>
      <div
        aria-label="Formatting"
        className="flex flex-wrap gap-1.5"
        role="toolbar"
      >
        {bioTools.map((tool) => (
          <Tooltip key={tool.label}>
            <TooltipTrigger asChild>
              <Button
                aria-label={tool.label}
                onClick={() => apply(tool)}
                size="icon-lg"
                type="button"
                variant="outline"
              >
                <tool.icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{tool.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
      <Textarea
        id={`field-${name}`}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        ref={ref}
        rows={rows}
        value={value}
      />
      {value && (
        <div className="border border-dashed bg-card p-3.5">
          <span className="label-caps mb-2 block text-[0.5625rem] text-muted-foreground">
            Bio preview
          </span>
          <RichText className="text-[13px] text-ink-soft" text={value} />
        </div>
      )}
    </Field>
  );
}

// Paste a citation and let lib/citation.js fill the paper fields.
export function CitationParser({ onParsed }) {
  const [citation, setCitation] = useState("");
  const [result, setResult] = useState(null);
  const parse = () => {
    const parsed = parseCitation(citation);
    setResult(parsed);
    onParsed(parsed);
  };
  return (
    <div className="flex flex-col gap-3 border bg-card p-4 sm:col-span-2">
      <label
        className="flex items-center gap-2 text-xs font-bold"
        htmlFor="field-citation"
      >
        <ClipboardPaste aria-hidden="true" className="size-4 text-brand" />
        Paste a citation — fields fill automatically
      </label>
      <Textarea
        id="field-citation"
        onChange={(e) => setCitation(e.target.value)}
        placeholder="Hasan, M., & Akter, S. (2024). Deep learning for crop disease detection. Computers and Electronics in Agriculture, 218, 108700. https://doi.org/10.1016/j.compag.2023.108700"
        rows={3}
        value={citation}
      />
      <Button className="self-start" onClick={parse} size="lg" type="button">
        Parse citation
      </Button>
      {result &&
        (result.missing.length ? (
          <Alert variant="destructive">
            <AlertDescription>
              Couldn’t detect: {result.missing.join(", ")} — please fill{" "}
              {result.missing.length > 1 ? "them" : "it"} in below.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-accent">
            <Check />
            <AlertDescription className="text-foreground">
              Title, authors, year and venue detected. Review and save.
            </AlertDescription>
          </Alert>
        ))}
      <p className="border-t border-dashed pt-2.5 text-[11px] leading-[1.7] text-muted-foreground">
        <strong>Best format (APA):</strong> Authors. (Year). Title. Venue.
        https://doi.org/10.xxxx/xxxx — IEEE style with the title in “quotes”
        also works. Title, authors, year, venue and DOI are detected; missing
        pieces are flagged above.
      </p>
    </div>
  );
}
