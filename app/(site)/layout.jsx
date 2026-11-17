import SiteFooter from "@/components/site/site-footer";
import SiteHeader from "@/components/site/site-header";
import { getCollection } from "@/lib/content";

// Shared chrome for every public page. The header menu is built from the
// wings in the CMS, so it stays in sync with the content.
export default async function SiteLayout({ children }) {
  const wings = (await getCollection("wings")).map(
    ({ slug, title, shortTitle }) => ({ slug, title, shortTitle }),
  );
  return (
    <div className="flex min-h-svh flex-col">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:px-4 focus:py-3 focus:text-xs focus:font-bold focus:text-primary-foreground"
        href="#main"
      >
        Skip to content
      </a>
      <SiteHeader wings={wings} />
      <main className="min-w-0 flex-1" id="main">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
