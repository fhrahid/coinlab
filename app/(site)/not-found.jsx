import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="wrap flex min-h-[70svh] items-center pt-32 pb-16">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Compass />
          </EmptyMedia>
          <EmptyTitle className="text-2xl font-bold tracking-tight">
            This page could not be found
          </EmptyTitle>
          <EmptyDescription>
            The link may be out of date, or the page may have moved.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild size="lg" variant="glow">
            <Link href="/">
              <ArrowLeft data-icon="inline-start" /> Back to the homepage
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
