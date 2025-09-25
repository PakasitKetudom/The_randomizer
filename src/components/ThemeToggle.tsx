"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light"|"dark">("light");

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try { localStorage.setItem("theme", next); } catch {}
    console.log("[ThemeToggle] set", next, "html.class=", document.documentElement.className);
  };

  if (!mounted) return <button className="w-9 h-9 rounded-lg border" aria-hidden />;

  return (
    <button
      onClick={toggle}
      type="button"
      className="inline-flex items-center justify-center w-9 h-9 rounded-lg
                 border border-gray-300 dark:border-gray-700
                 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900"
      title="สลับโหมดแสง"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
