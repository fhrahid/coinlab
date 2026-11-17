// Fonts are bundled from @fontsource (self-hosted, no request to Google at
// build time or in the browser).
import "./globals.css";
import "@fontsource-variable/manrope";
import "@fontsource-variable/playfair-display";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata = {
  title: {
    default: "COiN Lab | Computational Intelligence Lab",
    template: "%s | COiN Lab",
  },
  description:
    "A research community advancing responsible computational intelligence at Southeast University.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0e1b40",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
