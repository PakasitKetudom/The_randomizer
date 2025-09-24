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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <div className="max-w-xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">เพิ่มเมนูใหม่ 🍴</h1>
          <Link href="/" className="text-blue-600 underline">← กลับไปสุ่ม</Link>
        </div>

        <div className="space-y-3 border rounded-2xl bg-white/70 backdrop-blur p-4 shadow-sm">
          <div>
            <label className="block text-sm font-medium">ชื่ออาหาร</label>
            <input
              value={name}
              onChange={e=>setName(e.target.value)}
              className="border p-2 w-full rounded mt-1"
              placeholder="เช่น ข้าวกะเพราไก่ไข่ดาว"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">มื้ออาหาร</label>
            <div className="flex gap-2 mt-2">
              {(["breakfast","lunch","dinner"] as TimeKey[]).map(t=>(
                <button key={t} type="button"
                  onClick={()=>toggleTime(t)}
                  className={`px-3 py-1 border rounded ${timeOfDay.includes(t)?"bg-black text-white":""}`}>
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
                  className={`px-3 py-1 border rounded ${tags.includes(t)?"bg-black text-white":""}`}>
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
              className="border p-2 w-1/2 rounded"
            />
            <input
              type="number"
              placeholder="เวลาทำ (นาที)"
              value={cookMins}
              onChange={e=>setCookMins(e.target.value)}
              className="border p-2 w-1/2 rounded"
            />
          </div>

          <button
            onClick={addMenu}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
            type="button"
          >
            {loading ? "กำลังเพิ่ม..." : "เพิ่มเมนู"}
          </button>

          {message && <div className="text-sm mt-2">{message}</div>}
        </div>
      </div>
    </div>
  );
}
