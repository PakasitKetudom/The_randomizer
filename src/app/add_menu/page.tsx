"use client";
import { useState } from "react";
import Link from "next/link";

type TimeKey = "breakfast" | "lunch" | "dinner";
type Menus = {
  id: string;
  nameTH: string;
  timeOfDay: TimeKey[];
  tags: string[];
  budget?: number;
  cookMins?: number;
};

export default function AddPage() {
  const [name, setName] = useState("");
  const [timeOfDay, setTimeOfDay] = useState<TimeKey[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [cookMins, setCookMins] = useState("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const allTags = ["thai","spicy","vegetarian","halal","budget","light"];
  const toggleTime = (t: TimeKey) =>
    setTimeOfDay(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t]);
  const toggleTag = (t: string) =>
    setTags(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t]);

  async function addMenu() {
    if (!name || timeOfDay.length === 0) {
      setMessage("กรุณากรอกชื่ออาหารและเลือกมื้ออาหารอย่างน้อย 1 มื้อ");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/menu_list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameTH: name,
          timeOfDay,
          tags,
          budget: budget ? Number(budget) : undefined,
          cookMins: cookMins ? Number(cookMins) : undefined,
        } as Partial<Menus>),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessage(`เพิ่มเมนูเรียบร้อย: ${data.item?.nameTH ?? name}`);
      // reset form
      setName(""); setTimeOfDay([]); setTags([]); setBudget(""); setCookMins("");
    } catch (e: any) {
      setMessage(`เกิดข้อผิดพลาด: ${e?.message ?? e}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50
                dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
  <div className="max-w-xl mx-auto p-6 space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">เพิ่มเมนูใหม่ 🍴</h1>
      <Link href="/" className="text-blue-600 dark:text-indigo-400 underline">← กลับไปสุ่ม</Link>
    </div>

    <div className="space-y-3 border rounded-2xl
                    bg-white/80 dark:bg-gray-900/80 backdrop-blur
                    border-gray-200 dark:border-gray-800 p-4 shadow-sm">
      <div>
        <label className="block text-sm font-medium">ชื่ออาหาร</label>
        <input
          value={name}
          onChange={e=>setName(e.target.value)}
          className="border border-gray-300 dark:border-gray-700
                     bg-white dark:bg-gray-950
                     text-gray-900 dark:text-gray-100
                     placeholder:text-gray-400 dark:placeholder:text-gray-500
                     p-2 w-full rounded mt-1"
          placeholder="เช่น ข้าวกะเพราไก่ไข่ดาว"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">มื้ออาหาร</label>
        <div className="flex gap-2 mt-2">
          {(["breakfast","lunch","dinner"] as TimeKey[]).map(t=>(
            <button key={t} type="button"
              onClick={()=>toggleTime(t)}
              className={`px-3 py-1 border rounded text-sm
                         ${timeOfDay.includes(t)
                           ? "bg-indigo-600 text-white border-indigo-600"
                           : "bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700"}`}>
              {t==="breakfast"?"เช้า":t==="lunch"?"กลางวัน":"เย็น"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">แท็ก</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {allTags.map(t=>(
            <button key={t} type="button"
              onClick={()=>toggleTag(t)}
              className={`px-3 py-1 border rounded text-sm
                         ${tags.includes(t)
                           ? "bg-indigo-600 text-white border-indigo-600"
                           : "bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <input
          type="number"
          placeholder="งบ (บาท)"
          value={budget}
          onChange={e=>setBudget(e.target.value)}
          className="border border-gray-300 dark:border-gray-700
                     bg-white dark:bg-gray-950
                     text-gray-900 dark:text-gray-100
                     placeholder:text-gray-400 dark:placeholder:text-gray-500
                     p-2 w-1/2 rounded"
        />
        <input
          type="number"
          placeholder="เวลาทำ (นาที)"
          value={cookMins}
          onChange={e=>setCookMins(e.target.value)}
          className="border border-gray-300 dark:border-gray-700
                     bg-white dark:bg-gray-950
                     text-gray-900 dark:text-gray-100
                     placeholder:text-gray-400 dark:placeholder:text-gray-500
                     p-2 w-1/2 rounded"
        />
      </div>

      <button
        onClick={addMenu}
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-700
                   text-white px-4 py-2 rounded disabled:opacity-60"
        type="button"
      >
        {loading ? "กำลังเพิ่ม..." : "เพิ่มเมนู"}
      </button>

      {message && <div className="text-sm mt-2 text-gray-700 dark:text-gray-300">{message}</div>}
    </div>
  </div>
</div>
  );
}
