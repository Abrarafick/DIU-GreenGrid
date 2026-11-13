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
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen selection:bg-emerald-500/20 selection:text-emerald-800">
        {children}
      </body>
    </html>
  );
}
