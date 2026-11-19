import Link from "next/link";
import { Code2, ExternalLink, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

const pad = (n) => String(n).padStart(2, "0");

function PaperLink({ href, icon: Icon, label, title }) {
  if (!href) return null;
  return (
    <Button asChild size="sm" variant="outline">
      <a
        aria-label={`${label}: ${title}`}
        href={href}
        rel="noreferrer"
        target="_blank"
      >
        <Icon data-icon="inline-start" /> {label}
      </a>
    </Button>
  );
}

// Numbered publication list (homepage "Recent work", wing pages, archive).
// `publications` are shaped by lib/publications.js#toPublication.
export default function PublicationList({ publications, className }) {
  return (
    <ItemGroup className={className} role="list">
      {publications.map((pub, index) => (
        <Item
          data-spotlight
          className="reveal items-start gap-4 rounded-2xl p-4 transition-colors hover:bg-muted/60 sm:gap-6 sm:p-5"
          key={pub.slug}
          role="listitem"
          variant="outline"
        >
          <ItemMedia className="pt-0.5 font-mono text-sm text-brand tabular-nums">
            {pad(index + 1)}
          </ItemMedia>
          <ItemContent className="min-w-0 gap-2">
            <ItemTitle className="line-clamp-none text-base leading-snug font-semibold text-pretty sm:text-lg">
              {pub.title}
            </ItemTitle>
            <ItemDescription className="line-clamp-none text-sm">
              {pub.authors.map((author, i) => (
                <span key={`${pub.slug}-author-${i}-${author.name}`}>
                  {i > 0 && ", "}
                  {author.href ? (
                    <Link
                      className="font-medium text-foreground no-underline hover:text-brand"
                      href={author.href}
                    >
                      {author.name}
                    </Link>
                  ) : (
                    author.name
                  )}
                </span>
              ))}
              {pub.authors.length > 0 && ". "}
              {pub.venue && <em>{pub.venue}</em>}
              {pub.venue && pub.year ? ", " : ""}
              {pub.year}
            </ItemDescription>
            <ItemFooter className="flex-wrap justify-start gap-2 pt-1">
              {pub.featured && <Badge>Featured</Badge>}
              {pub.type && <Badge variant="secondary">{pub.type}</Badge>}
              {pub.wings.map((wing) => (
                <Badge
                  asChild
                  className="h-6"
                  key={wing.slug}
                  variant="outline"
                >
                  <Link href={`/wings/${wing.slug}`}>{wing.title}</Link>
                </Badge>
              ))}
              <span className="flex flex-wrap gap-2 sm:ml-auto">
                <PaperLink
                  href={pub.doiHref}
                  icon={ExternalLink}
                  label="DOI"
                  title={pub.title}
                />
                <PaperLink
                  href={pub.pdfHref}
                  icon={FileText}
                  label="PDF"
                  title={pub.title}
                />
                <PaperLink
                  href={pub.codeHref}
                  icon={Code2}
                  label="Code"
                  title={pub.title}
                />
              </span>
            </ItemFooter>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  );
}
