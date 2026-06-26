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
    url: "https://www.alione.cc",
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
  icons: {
    icon: "/alione.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${plusJakarta.variable}`}>
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}