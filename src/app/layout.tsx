import type { Metadata, Viewport  } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ThemeScript from "@/components/ThemeScript";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Randomizer",
  description: "Random now",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" }, // เทียบเท่า bg-gray-50
    { media: "(prefers-color-scheme: dark)",  color: "#0b0f19" }, // เทียบเท่า bg-gray-950
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <html lang="en">
    //   {/* <body className="min-h-screen bg-gray-50">
    //     <nav className="w-full bg-white border-b">
    //       <div className="max-w-4xl mx-auto px-4 py-3 flex gap-4">
    //         <Link href="/" className="hover:underline">สุ่มเมนู</Link>
    //         <Link href="/add_menu" className="hover:underline">เพิ่มเมนู</Link>
    //         <Link href="/list_menu" className="hover:underline">ดูรายการทั้งหมด</Link>
    //       </div>
    //     </nav>
    //     {children}
    //   </body> */}
    //   <body className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
    //     <nav className="w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
    //       <div className="max-w-4xl mx-auto px-4 py-3 flex gap-6 items-center">
    //         <Link
    //           href="/"
    //           className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
    //         >
    //           สุ่มเมนู
    //         </Link>
    //         <Link
    //           href="/add_menu"
    //           className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
    //         >
    //           เพิ่มเมนู
    //         </Link>
    //         <Link
    //           href="/list_menu"
    //           className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
    //         >
    //           ดูรายการทั้งหมด
    //         </Link>
    //       </div>
    //     </nav>
    //     <main className="max-w-4xl mx-auto p-4">{children}</main>
    //   </body>
    // </html>
    // <html lang="th" suppressHydrationWarning>
    //   <head>
    //     <ThemeScript />
    //     <meta name="theme-color" content="#f9fafb" media="(prefers-color-scheme: light)" />
    //     <meta name="theme-color" content="#0b0f19" media="(prefers-color-scheme: dark)" />
    //   </head>
    //   <body className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
    //     <Navbar />
    //     <main className="max-w-4xl mx-auto p-4">{children}</main>
    //   </body>
    // </html>
    <html lang="th" suppressHydrationWarning>
      <head><ThemeScript /></head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
