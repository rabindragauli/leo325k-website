import type { Metadata, Viewport } from "next";
import { Lato, Public_Sans } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

// Headings: Lato 400/700/900 (static weights). Body: Public Sans (variable).
const lato = Lato({
  variable: "--font-lato",
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  // OG image arrives in Sprint 7
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.name,
    description: site.description,
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B3A4B",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${lato.variable} ${publicSans.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only rounded-btn bg-yellow px-4 py-3 font-extrabold text-teal-900 focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
