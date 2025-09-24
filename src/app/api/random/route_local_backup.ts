// src/app/api/meals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MENUS } from "@/data/menu_list";

// กัน cache ของ Route Handler (สุ่มได้ทุกครั้ง)
export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const time = searchParams.get("time") as "breakfast" | "lunch" | "dinner" | null;
  const tags = searchParams.getAll("tag");
  const maxBudget = Number(searchParams.get("maxBudget") ?? Number.POSITIVE_INFINITY);
  const maxMins = Number(searchParams.get("maxMins") ?? Number.POSITIVE_INFINITY);
//   const exclude = new Set(searchParams.getAll("exclude"));

  console.log("📥 API called with", Object.fromEntries(searchParams));
  console.log("tags", tags);

  let pool = MENUS.filter(m =>
    (!time || m.timeOfDay.includes(time)) &&
    (tags.length === 0 || tags.every(t => m.tags.includes(t))) &&
    (m.budget ?? 0) <= maxBudget &&
    (m.cookMins ?? 0) <= maxMins 
    // &&!exclude.has(m.id)
  );

  console.log("pool",pool)

//   if (pool.length === 0) {
//     pool = MENUS.filter(m => !exclude.has(m.id));
//     if (pool.length === 0) pool = MENUS;
//   }

  const idx = Math.floor(Math.random() * pool.length);
  return NextResponse.json({ item: pool[idx], count: pool.length });
}
