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
    <div className="wrap flex min-h-[60svh] items-center py-16">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Compass />
          </EmptyMedia>
          <EmptyTitle className="text-xl font-extrabold tracking-[-0.03em]">
            This page could not be found.
          </EmptyTitle>
          <EmptyDescription>
            The link may be out of date, or the page may have moved.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild size="xl">
            <Link href="/">
              <ArrowLeft data-icon="inline-start" /> Back to the homepage
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
