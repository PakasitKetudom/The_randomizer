"use client";
import { useEffect, useMemo, useState } from "react";

// โค้ดนี้ self-contained ไม่ import อะไรภายนอก เพื่อกัน error
type Menus = {
  id: string;
  nameTH: string;
  timeOfDay: ("breakfast" | "lunch" | "dinner")[];
  tags: string[];
  budget?: number;
  cookMins?: number;
};

type TimeKey = "breakfast" | "lunch" | "dinner";

function todayKey() {
  return `meal-history:${new Date().toISOString().slice(0,10)}`;
}

export default function Page() {
  const [time, setTime] = useState<TimeKey>("lunch");
  const [tags, setTags] = useState<string[]>([]);
  const [suggestion, setSuggestion] = useState<Menus | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  // โหลด/บันทึก history อย่างปลอดภัย (กัน SSR)
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(todayKey()) : null;
      setHistory(raw ? JSON.parse(raw) : []);
    } catch {
      setHistory([]);
    }
  }, []);

  function saveHistory(ids: string[]) {
    const last = ids.slice(-5);
    setHistory(last);
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(todayKey(), JSON.stringify(last));
    } catch {}
  }

  async function randomizeFromAPI() {
    const params = new URLSearchParams();
    params.set("time", time);
    tags.forEach(t => params.append("tag", t));
    // history.forEach(id => params.append("exclude", id));

    const res = await fetch(`/api/menu_list?${params.toString()}`, { cache: "no-store" });
    console.log("tags",tags)
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json() as { item: Menus; count: number };
    setSuggestion(data.item);
    // saveHistory([...history, data.item.id]);
  }

  const allTags = useMemo(() => ["thai","spicy","vegetarian","halal","budget","light"], []);

  return (
    <div className="min-h-screen p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Random Food</h1>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium">มื้ออาหาร</label>
          <select className="border p-2 rounded" value={time} onChange={e => setTime(e.target.value as TimeKey)}>
            <option value="breakfast">เช้า</option>
            <option value="lunch">กลางวัน</option>
            <option value="dinner">เย็น</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">เงื่อนไข</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {allTags.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTags(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev,t])}
                className={`px-3 py-1 rounded border ${tags.includes(t) ? "bg-black text-white" : ""}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button onClick={randomizeFromAPI} className="px-4 py-2 rounded bg-blue-600 text-white" type="button">
          สุ่มเมนู
        </button>
      </div>

      {suggestion && (
        <div className="mt-6 border rounded p-4">
          <div className="text-lg font-semibold">{suggestion.nameTH}</div>
          <div className="text-sm text-gray-600">
            tags: {suggestion.tags.join(", ")}
            {suggestion.budget ? ` • ~฿${suggestion.budget}` : ""}
            {suggestion.cookMins ? ` • ${suggestion.cookMins} นาที` : ""}
          </div>
        </div>
      )}

      {/* {history.length > 0 && (
        <div className="mt-6">
          <div className="font-medium mb-2">วันนี้เคยเลือกแล้ว:</div>
          <div className="text-sm break-words">{history.join(" , ")}</div>
        </div>
      )} */}
    </div>
  );
}
