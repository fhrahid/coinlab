import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import PageHero from "@/components/site/page-hero";
import { Accent } from "@/components/site/typography";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCollection } from "@/lib/content";

export const revalidate = 10;
export const metadata = { title: "Research wings" };

const countWords = [
  "No",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
];

export default async function WingsPage() {
  const wings = await getCollection("wings");
  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Research wings"
        title={
          <>
            {countWords[wings.length] || wings.length}{" "}
            {wings.length === 1 ? "lens" : "lenses"} on
            <br />
            <Accent>what matters.</Accent>
          </>
        }
      >
        Explore the research areas that make up COiN Lab.
      </PageHero>
      <div className="wrap grid gap-3 sm:grid-cols-2">
        {wings.map((wing) => (
          <Link
            className="group/wing focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={`/wings/${wing.slug}`}
            key={wing.slug}
          >
            <Card className="relative h-full min-h-[175px] gap-0 py-5 transition-[translate,box-shadow] duration-300 [--card-spacing:--spacing(5)] group-hover/wing:-translate-y-1 group-hover/wing:shadow-lg md:min-h-[205px] md:py-6 md:[--card-spacing:--spacing(6)]">
              <CardHeader>
                <span className="font-mono text-[0.625rem] text-brand">
                  {wing.number}
                </span>
                <CardTitle className="mt-5 pr-8 text-[21px] leading-tight font-bold tracking-[-0.04em] md:text-2xl">
                  {wing.title}
                </CardTitle>
                <CardDescription className="max-w-[430px] leading-[1.7]">
                  {wing.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ArrowUpRight
                  aria-hidden="true"
                  className="absolute right-5 bottom-5 size-5 text-brand transition-transform group-hover/wing:translate-x-0.5 group-hover/wing:-translate-y-0.5"
                />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
