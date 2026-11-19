import PageHero from "@/components/site/page-hero";
import { Highlight } from "@/components/site/typography";
import WingCard from "@/components/site/wing-card";
import { getList, getWingCounts } from "@/lib/content";

export const revalidate = 10;
export const metadata = {
  title: "Research wings",
  description:
    "The research areas of COiN Lab: AI in healthcare, financial technology, networking and security, smart agriculture, and natural language processing.",
};

const none = { people: 0, papers: 0 };

export default async function WingsPage() {
  const [wings, counts] = await Promise.all([
    getList("wings", "slug,number,title,shortTitle,description,focusPoints"),
    getWingCounts(),
  ]);
  return (
    <>
      <PageHero
        chip="Research wings"
        title={
          <>
            Where we <Highlight>focus</Highlight>
          </>
        }
      >
        {wings.length} research areas make up COiN Lab. Each has its own team,
        questions and publications.
      </PageHero>
      <div className="wrap grid gap-5 py-12 sm:grid-cols-2 md:py-16 lg:grid-cols-3">
        {wings.map((wing, index) => (
          <WingCard
            counts={counts[wing.slug] || none}
            index={index}
            key={wing.slug}
            wing={wing}
          />
        ))}
      </div>
    </>
  );
}
