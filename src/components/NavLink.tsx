// src/components/NavLink.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = { href: string; children: React.ReactNode };

export default function NavLink({ href, children }: Props) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`font-medium transition-colors
        ${active
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400"}`}
    >
      {children}
    </Link>
  );
}
