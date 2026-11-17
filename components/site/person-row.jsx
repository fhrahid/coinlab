import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import PersonAvatar from "@/components/site/person-avatar";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";

// One person in a compact list (wing pages). `photo` is a resolved URL.
export default function PersonRow({ person, photo }) {
  return (
    <Item asChild className="rounded-2xl" variant="outline">
      <Link href={`/people/${person.slug}`}>
        <ItemMedia>
          <PersonAvatar name={person.name} src={photo} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{person.name}</ItemTitle>
          <ItemDescription>{person.role}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <ArrowUpRight aria-hidden="true" className="size-4 text-brand transition-transform group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5" />
        </ItemActions>
      </Link>
    </Item>
  );
}
