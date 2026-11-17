import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata = {
  title: "Content studio",
  robots: { index: false, follow: false },
};

// Toasts and tooltips are only used in the CMS, so their JavaScript is loaded
// here and not on the public pages.
export default function AdminLayout({ children }) {
  return (
    <TooltipProvider>
      {children}
      <Toaster position="bottom-right" />
    </TooltipProvider>
  );
}
