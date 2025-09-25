import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "./providers";

export const metadata: Metadata = { title: "The Randomizer" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
    <body className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Providers>
        <Navbar />
        <main className="max-w-4xl mx-auto p-4">{children}</main>
      </Providers>
    </body>
  </html>
  );
}