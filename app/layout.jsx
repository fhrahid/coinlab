import "./globals.css";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";

export const metadata = {
  title: {
    default: "COiN Lab | Computational Intelligence Lab",
    template: "%s | COiN Lab",
  },
  description:
    "COiN Lab is the Computational Intelligence Lab at Southeast University, Dhaka — research in AI for healthcare, finance, networks and security, agriculture, and language.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#05070c" },
  ],
};

export default function RootLayout({ children }) {
  return (
    // next-themes sets the `dark` class before paint, so the server and
    // client <html> attributes differ by design.
    <html className={`${GeistSans.variable} ${GeistMono.variable}`} lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
