// src/components/Navbar.tsx  (Server Component)
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex gap-6">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">สุ่มเมนู</Link>
          <Link href="/add_menu" className="hover:text-indigo-600 dark:hover:text-indigo-400">เพิ่มเมนู</Link>
          <Link href="/list_menu" className="hover:text-indigo-600 dark:hover:text-indigo-400">ดูรายการทั้งหมด</Link>
        </div>
        <ThemeToggle />
      </div>
    </nav>
  );
}