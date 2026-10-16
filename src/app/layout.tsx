import type { Metadata } from "next";
import {
  Libre_Baskerville,
  Source_Serif_4,
  IBM_Plex_Sans,
} from "next/font/google";
import "./globals.css";

const display = Libre_Baskerville({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
});

const deck = Libre_Baskerville({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-deck",
});

const body = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-body",
});

const meta = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-meta",
});

export const metadata: Metadata = {
  title: "The Gazette",
  description:
    "A weekly newspaper front end. Update content/issue.json to publish a new edition.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${deck.variable} ${body.variable} ${meta.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
