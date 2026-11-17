import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import "./globals.css";

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-fira-code",
});

const title = "Mohammed M. - Full-Stack & AI Engineer";
const description =
  "Full-stack & AI engineer in Erbil, Iraq. I build web products end to end, and the checks that decide when a model's output is safe to act on. Open to remote ML and full-stack roles.";

export const metadata: Metadata = {
  metadataBase: new URL("https://icyren.dev"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://icyren.dev",
    siteName: "Mohammed M.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${firaCode.variable} ${firaCode.className} h-full antialiased`}>
      <body className="min-h-full bg-graphite text-ink">{children}</body>
    </html>
  );
}
