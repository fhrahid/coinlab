import NavProgress from "@/components/site/nav-progress";
import PointerGlow from "@/components/site/pointer-glow";
import SiteFooter from "@/components/site/site-footer";
import SiteHeader from "@/components/site/site-header";
import { getList } from "@/lib/content";

// Shared chrome for every public page. The menus are built from the wings in
// the CMS, so they stay in sync with the content.
export default async function SiteLayout({ children }) {
  const wings = await getList("wings", "slug,title,shortTitle");
  return (
    <div className="flex min-h-svh flex-col">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-primary-foreground"
        href="#main"
      >
        Skip to content
      </a>
      <NavProgress />
      <PointerGlow />
      <SiteHeader wings={wings} />
      <main className="min-w-0 flex-1" id="main">{children}</main>
      <SiteFooter wings={wings} />
    </div>
  );
}
