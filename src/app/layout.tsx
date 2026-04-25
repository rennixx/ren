import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ren",
  description: "Futuristic system UI portfolio dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-mono antialiased">{children}</body>
    </html>
  );
}
