// A template re-mounts on every navigation (a layout does not), so each page
// fades in. Opacity only, so nothing shifts and scroll-driven effects are
// unaffected.
export default function SiteTemplate({ children }) {
  return <div className="animate-page-in">{children}</div>;
}
