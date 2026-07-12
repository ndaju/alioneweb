import {ClerkProvider} from "@clerk/nextjs";
import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AliOne — Privacy-First Digital Ecosystem",
  description:
    "AliOne is building a complete ecosystem of privacy-focused internet products. Starting with AliBrowser. One account. Total privacy.",
  keywords: [
    "AliOne",
    "AliBrowser",
    "privacy",
    "privacy-first",
    "browser",
    "ecosystem",
    "Turkish technology",
  ],
  openGraph: {
    title: "AliOne — Privacy-First Digital Ecosystem",
    description:
      "One account. Total privacy. AliOne combines browsing, search, email, storage, and more into a single privacy-first ecosystem.",
    url: "https://alione.cc",
    siteName: "AliOne",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AliOne — Privacy-First Digital Ecosystem",
    description:
      "One account. Total privacy. Privacy-first software built with our community.",
  },
  icons: [
    { rel: "icon", url: "/alione.png", type: "image/png", sizes: "256x256" },
    { rel: "shortcut icon", url: "/alione.png", type: "image/png" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${plusJakarta.variable}`}>
      <body>
        <div className="bg-amber-500/10 border-b border-amber-500/20" style={{ position: "relative", zIndex: 10000 }}>
          <p className="text-[11px] text-amber-400/70 text-center py-1.5 px-4">
            Preview environment &mdash; not for public use. AliOne is not responsible for any content or misuse.
          </p>
        </div>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}