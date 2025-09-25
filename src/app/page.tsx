"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

// ===== Types (คงชื่อเดิม) =====
type Menus = {
  id: string;
  nameTH: string;
  timeOfDay: ("breakfast" | "lunch" | "dinner")[];
  tags: string[];
  budget?: number;
  cookMins?: number;
};

type TimeKey = "breakfast" | "lunch" | "dinner";

// ===== Utils =====
function todayKey() {
  return `meal-history:${new Date().toISOString().slice(0, 10)}`;
}

function classNames(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

// function TagChip({
//   label,
//   active,
//   onToggle,
// }: {
//   label: string;
//   active: boolean;
//   onToggle: () => void;
// }) {
//   return (
//     <button
//       type="button"
//       onClick={onToggle}
//       className={classNames(
//         "px-3 py-1 rounded-full border text-sm transition-all shadow-sm hover:shadow",
//         active ? "bg-black text-white border-black" : "bg-white border-gray-300"
//       )}
//     >
//       {label}
//     </button>
//   );
// }

function TagChip({
  label, active, onToggle,
}: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={
        active
          ? "px-3 py-1.5 rounded-full text-sm border border-indigo-600 bg-indigo-600 text-white " +
            "focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
          : "px-3 py-1.5 rounded-full text-sm border " +
            "border-gray-300 dark:border-gray-700 " +
            "bg-white dark:bg-gray-950 " +
            "text-gray-800 dark:text-gray-200 " +
            "hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
      }
    >
      {label}
    </button>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={classNames("animate-pulse bg-gray-200/70 rounded", className)} />;
}

// ===== Page Component =====
export default function Page() {
  const [time, setTime] = useState<TimeKey>("lunch");
  const [tags, setTags] = useState<string[]>([]);
  const [suggestion, setSuggestion] = useState<Menus | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // โหลด history วันนี้
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(todayKey()) : null;
      setHistory(raw ? JSON.parse(raw) : []);
    } catch {
      setHistory([]);
    }
  }, []);

  // บันทึก history (กันซ้ำ N รายการล่าสุด)
  const saveHistory = useCallback((ids: string[]) => {
    const last = ids.slice(-7);
    setHistory(last);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(todayKey(), JSON.stringify(last));
      }
    } catch {}
  }, []);

  // เรียก API เดิม /api/menu_list และส่ง tag หลายค่า
  const randomizeFromAPI = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("time", time);
      tags.forEach((t) => params.append("tag", t));
      // ถ้าต้องการกันซ้ำ ฝั่ง API ให้ส่ง exclude ด้วย:
      // history.forEach((id) => params.append("exclude", id));

      // debug client
      console.log("➡️ sending params", [...params]);

      const res = await fetch(`/api/random?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as { item: Menus; count: number };

      // debug response
      console.log("✅ API response", data);

      setSuggestion(data.item);
      // ถ้าต้องการบันทึกเพื่อกันซ้ำฝั่ง client:
      // saveHistory([...history, data.item.id]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [history, saveHistory, tags, time]);

  const allTags = useMemo(() => ["thai", "spicy", "vegetarian", "halal", "budget", "light"], []);

  return (
    <div className="min-h-screen w-full
                bg-gray-50 dark:bg-gray-950
                text-gray-900 dark:text-gray-100">
        <div className="mx-auto max-w-2xl p-6">
            {/* Header */}
            <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-6"
            >
            <h1 className="text-3xl font-bold tracking-tight">Random Food 🍚</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
                เลือกเงื่อนไข แล้วให้เราช่วยสุ่มเมนูให้คุณทุกวัน
            </p>
            </motion.header>

            {/* Controls */}
            <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="rounded-2xl border border-gray-200 dark:border-gray-800
                        bg-white/90 dark:bg-gray-900/80 backdrop-blur
                        p-4 shadow-sm"
            >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium mb-1
                                    text-gray-800 dark:text-gray-200">
                    มื้ออาหาร
                </label>
                <div className="flex flex-wrap gap-2">
                    {(["breakfast", "lunch", "dinner"] as TimeKey[]).map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setTime(t)}
                        className={classNames(
                        "px-3 py-2 rounded-xl border text-sm transition-all hover:shadow",
                        "focus:outline-none focus:ring-2 focus:ring-indigo-400/60",
                        time === t
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 " +
                            "text-gray-800 dark:text-gray-200"
                        )}
                    >
                        {t === "breakfast" ? "เช้า" : t === "lunch" ? "กลางวัน" : "เย็น"}
                    </button>
                    ))}
                </div>
                </div>

                <div>
                <label className="block text-sm font-medium mb-1
                                    text-gray-800 dark:text-gray-200">
                    เงื่อนไข
                </label>
                <div className="flex flex-wrap gap-2">
                    {allTags.map((t) => (
                    <TagChip
                        key={t}
                        label={t}
                        active={tags.includes(t)}
                        onToggle={() =>
                        setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
                        }
                    />
                    ))}
                </div>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
                <motion.button
                whileTap={{ scale: 0.98 }}
                whileHover={{ y: -1 }}
                onClick={randomizeFromAPI}
                type="button"
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white shadow
                            hover:bg-indigo-700 disabled:opacity-60
                            focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                disabled={loading}
                >
                {loading ? "กำลังสุ่ม..." : "สุ่มเมนู"}
                </motion.button>
                {!!error && <span className="text-sm text-rose-600">{error}</span>}
            </div>
            </motion.section>

            {/* Suggestion */}
            <div className="mt-6">
            <AnimatePresence mode="popLayout">
                {loading ? (
                <motion.div
                    key="skeleton"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800
                            bg-white/90 dark:bg-gray-900/80 backdrop-blur p-4 shadow-sm"
                >
                    <Skeleton className="h-6 w-1/3" />
                    <div className="mt-3 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    </div>
                </motion.div>
                ) : suggestion ? (
                <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 220, damping: 20 }}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800
                            bg-white/95 dark:bg-gray-900/90 backdrop-blur
                            p-5 shadow-md"
                >
                    <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-semibold">{suggestion.nameTH}</h2>
                        <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                        tags: {suggestion.tags.join(", ")}
                        {suggestion.budget ? ` • ~฿${suggestion.budget}` : ""}
                        {suggestion.cookMins ? ` • ${suggestion.cookMins} นาที` : ""}
                        </p>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={randomizeFromAPI}
                        className="rounded-lg border border-gray-300 dark:border-gray-700
                                px-3 py-1.5 text-sm bg-white dark:bg-gray-950
                                text-gray-800 dark:text-gray-200
                                hover:bg-gray-50 dark:hover:bg-gray-900"
                        type="button"
                    >
                        เปลี่ยนอีกสักเมนู ↻
                    </motion.button>
                    </div>
                </motion.div>
                ) : (
                <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800
                            bg-white/70 dark:bg-gray-900/80 backdrop-blur
                            p-5 text-center text-gray-700 dark:text-gray-300"
                >
                    กดปุ่ม “สุ่มเมนู” เพื่อเริ่มต้น
                </motion.div>
                )}
            </AnimatePresence>
    </div>

        {/* History (ถ้าต้องการแสดง เปิดคอมเมนต์บล็อกนี้และเปิด saveHistory ใน API) */}
        {/* {history.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="mt-6 rounded-2xl border bg-white/60 backdrop-blur p-4"
          >
            <div className="font-medium mb-2">วันนี้เคยเลือกแล้ว</div>
            <div className="flex flex-wrap gap-2 text-sm">
              {history.map((id) => (
                <span key={id} className="px-2 py-1 rounded border bg-white">
                  {id}
                </span>
              ))}
            </div>
          </motion.section>
        )} */}
      </div>
    </div>
  );
}
