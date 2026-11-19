import { BookOpen } from "lucide-react";
import PageHero from "@/components/site/page-hero";
import PapersBrowser from "@/components/site/papers-browser";
import { Highlight } from "@/components/site/typography";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getPublications } from "@/lib/content";

export const revalidate = 10;
export const metadata = {
  title: "Publications",
  description: "Papers, preprints and research outputs from COiN Lab.",
};

export default async function PapersPage() {
  const publications = await getPublications();
  return (
    <>
      <PageHero
        chip="Research archive"
        title={
          <>
            The work, <Highlight>in public</Highlight>
          </>
        }
      >
        Papers, preprints and research outputs from the COiN Lab community.
      </PageHero>
      <div className="wrap py-12 md:py-16">
        {publications.length ? (
          <PapersBrowser publications={publications} />
        ) : (
          <Empty className="min-h-64 rounded-3xl border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookOpen />
              </EmptyMedia>
              <EmptyTitle>Research outputs will appear here</EmptyTitle>
              <EmptyDescription>
                The archive is being prepared. Check back as COiN Lab
                publications are added.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </>
  );
}
