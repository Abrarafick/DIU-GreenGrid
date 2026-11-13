import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DIU GreenGrid | Smart Campus Energy Intelligence",
  description:
    "Software-first campus energy monitoring, building analytics, carbon accounting, and action management for Daffodil International University.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
