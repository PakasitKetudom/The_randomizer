"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
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

export default function ListPage() {
  const [items, setItems] = useState<Menus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // filters
  const [q, setQ] = useState("");
  const [time, setTime] = useState<TimeKey | "">("");
  const [tags, setTags] = useState<string[]>([]);
  const allTags = useMemo(() => ["thai", "spicy", "vegetarian", "halal", "budget", "light"], []);
  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  // edit modal state
  const [editing, setEditing] = useState<Menus | null>(null);

  //Pagination 
  const [page, setPage] = useState(1);
  const limit = 5;
  const [pageCount, setPageCount] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
        const params = new URLSearchParams();
        // params.set("action", "list");
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (q) params.set("q", q);
        if (time) params.set("time", time);
        tags.forEach(t => params.append("tag", t));

        const res = await fetch(`/api/menu_list?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as { items?: Menus[]; total?: number; page?: number; limit?: number; pageCount?: number };
        setItems(Array.isArray(data.items) ? data.items : []);
        setPageCount(data.pageCount ?? 1);
    } catch (e: any) {
        setError(e?.message ?? "error");
        setItems([]);
    } finally {
        setLoading(false);
    }
    }, [q, time, tags, page]);

  useEffect(() => { load(); }, [load]);

  async function remove(id: string) {
    if (!confirm("ลบเมนูนี้?")) return;
    const res = await fetch(`/api/menu_list?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) return alert("ลบไม่สำเร็จ");
    load();
  }

  async function saveEdit() {
    if (!editing) return;
    const res = await fetch(`/api/menu_list?id=${encodeURIComponent(editing.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (!res.ok) return alert("บันทึกไม่สำเร็จ");
    setEditing(null);
    load();
  }

  const timeTH = (t: TimeKey) => (t === "breakfast" ? "เช้า" : t === "lunch" ? "กลางวัน" : "เย็น");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
  <div className="max-w-5xl mx-auto p-6">
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-bold">รายการเมนู</h1>
    </div>

    {/* Filters */}
    <div className="rounded border bg-white dark:bg-gray-900
                    border-gray-200 dark:border-gray-800 p-4 space-y-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ค้นหาชื่ออาหาร..."
        className="w-full rounded border px-3 py-2
                   border-gray-300 dark:border-gray-700
                   bg-white dark:bg-gray-950
                   text-gray-900 dark:text-gray-100
                   placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
      <div className="flex flex-wrap gap-2">
        {(["", "breakfast", "lunch", "dinner"] as (TimeKey | "")[]).map((t) => (
          <button
            key={t || "all"}
            type="button"
            onClick={() => setTime(t)}
            className={`px-3 py-1 rounded border text-sm
              ${time === t
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700"}`}
          >
            {t === "" ? "ทั้งหมด" : timeTH(t as TimeKey)}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {allTags.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => toggleTag(t)}
            className={`px-3 py-1 rounded border text-sm
               ${tags.includes(t)
                 ? "bg-indigo-600 text-white border-indigo-600"
                 : "bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => { setPage(1); load(); }}
                className="px-4 py-2 rounded bg-gray-900 text-white dark:bg-indigo-600">
          ค้นหา
        </button>
        <button
          onClick={() => { setQ(""); setTime(""); setTags([]); setPage(1); setTimeout(load, 0); }}
          className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700
                     bg-white dark:bg-gray-950"
        >
          ล้างเงื่อนไข
        </button>
      </div>
    </div>

    {/* Table */}
    <div className="mt-6 overflow-x-auto rounded border
                    bg-white dark:bg-gray-900
                    border-gray-200 dark:border-gray-800">
      {loading ? (
        <div className="p-4 text-gray-600 dark:text-gray-300">กำลังโหลด...</div>
      ) : error ? (
        <div className="p-4 text-rose-600">เกิดข้อผิดพลาด: {error}</div>
      ) : items.length === 0 ? (
        <div className="p-4 text-gray-600 dark:text-gray-300">ไม่พบรายการ</div>
      ) : (
        <table className="w-full table-auto">
          <thead className="bg-gray-100 dark:bg-gray-800 text-left">
            <tr>
              <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">ชื่ออาหาร</th>
              <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">มื้อ</th>
              <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">แท็ก</th>
              <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">งบ</th>
              <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">เวลาทำ</th>
              <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id} className="align-top">
                <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-800 break-words">{m.nameTH}</td>
                <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
                  {m.timeOfDay.map(timeTH).join(", ")}
                </td>
                <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex flex-wrap gap-1">
                    {m.tags.map((t) => (
                      <span key={t}
                            className="px-2 py-0.5 rounded border text-xs
                                       bg-gray-50 dark:bg-gray-800
                                       border-gray-200 dark:border-gray-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
                  {m.budget ? `฿${m.budget}` : "-"}
                </td>
                <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
                  {m.cookMins ? `${m.cookMins} นาที` : "-"}
                </td>
                <td className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(m)}
                      className="px-3 py-1 rounded border text-gray-50
                                 border-gray-300 bg-violet-400"
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(m.id)}
                      className="px-3 py-1 rounded border text-gray-50
                                 border-gray-300 bg-red-400"
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>

    {/* Pagination */}
    {items.length > 0 && (
      <div className="flex items-center justify-between p-3">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          หน้า {page} จาก {pageCount}
        </div>
        <div className="flex gap-1">
          <button type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 rounded border
                             border-gray-300 dark:border-gray-700
                             bg-white dark:bg-gray-950
                             disabled:opacity-50">
            ← Prev
          </button>
          {Array.from({ length: pageCount }).slice(
            Math.max(0, page - 3),
            Math.min(pageCount, page + 2)
          ).map((_, i) => {
            const idx = Math.max(1, page - 2) + i;
            return (
              <button key={idx} type="button" onClick={() => setPage(idx)}
                className={`px-3 py-1 rounded border
                            border-gray-300 dark:border-gray-700
                            bg-white dark:bg-gray-950
                            ${idx === page ? "bg-indigo-600 text-white border-indigo-600" : ""}`}>
                {idx}
              </button>
            );
          })}
          <button type="button"
                  onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                  disabled={page >= pageCount}
                  className="px-3 py-1 rounded border
                             border-gray-300 dark:border-gray-700
                             bg-white dark:bg-gray-950
                             disabled:opacity-50">
            Next →
          </button>
        </div>
      </div>
    )}

    {/* Edit Modal */}
    {editing && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded
                        bg-white dark:bg-gray-900
                        text-gray-900 dark:text-gray-100
                        border border-gray-200 dark:border-gray-800
                        p-4 space-y-3">
          <h2 className="text-lg font-semibold">แก้ไขเมนู</h2>
          <input
            className="w-full rounded border px-3 py-2
                       border-gray-300 dark:border-gray-700
                       bg-white dark:bg-gray-950"
            value={editing.nameTH}
            onChange={(e) => setEditing({ ...editing, nameTH: e.target.value })}
          />
          {/* timeOfDay */}
          <div>
            <div className="text-sm mb-1">มื้ออาหาร</div>
            <div className="flex flex-wrap gap-2">
              {(["breakfast", "lunch", "dinner"] as TimeKey[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setEditing({
                      ...editing,
                      timeOfDay: editing.timeOfDay.includes(t)
                        ? editing.timeOfDay.filter((x) => x !== t)
                        : [...editing.timeOfDay, t],
                    })
                  }
                  className={`px-3 py-1 rounded border text-sm
                              ${editing.timeOfDay.includes(t)
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700"}`}
                >
                  {timeTH(t)}
                </button>
              ))}
            </div>
          </div>
          {/* tags */}
          <div>
            <div className="text-sm mb-1">แท็ก</div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setEditing({
                      ...editing,
                      tags: editing.tags.includes(t)
                        ? editing.tags.filter((x) => x !== t)
                        : [...editing.tags, t],
                    })
                  }
                  className={`px-3 py-1 rounded border text-sm
                              ${editing.tags.includes(t)
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {/* budget & cookMins */}
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="งบ (บาท)"
              className="w-1/2 rounded border px-3 py-2
                         border-gray-300 dark:border-gray-700
                         bg-white dark:bg-gray-950"
              value={editing.budget ?? ""}
              onChange={(e) => setEditing({ ...editing, budget: e.target.value ? Number(e.target.value) : undefined })}
            />
            <input
              type="number"
              placeholder="เวลาทำ (นาที)"
              className="w-1/2 rounded border px-3 py-2
                         border-gray-300 dark:border-gray-700
                         bg-white dark:bg-gray-950"
              value={editing.cookMins ?? ""}
              onChange={(e) => setEditing({ ...editing, cookMins: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setEditing(null)}
                    className="px-4 py-2 rounded border
                               border-gray-300 dark:border-gray-700
                               bg-white dark:bg-gray-950"
                    type="button">
              ยกเลิก
            </button>
            <button onClick={saveEdit}
                    className="px-4 py-2 rounded bg-gray-900 text-white dark:bg-indigo-600"
                    type="button">
              บันทึก
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
</div>
  );
}
