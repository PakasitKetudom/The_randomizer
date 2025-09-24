import { NextRequest, NextResponse } from "next/server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { supabasePublic, supabaseAdmin } from "@/lib/supabase";

// กัน cache ของ Route Handler (สุ่มได้ทุกครั้ง)
// export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TimeKey = "breakfast" | "lunch" | "dinner";

type Menus = {
  id: string;
  nameTH: string;
  timeOfDay: TimeKey[];
  tags: string[];
  budget?: number | null;
  cookMins?: number | null;
};

function chooseMenu(row: any): Menus {
  return {
    id: row.id,
    nameTH: row.name_th,
    timeOfDay: row.time_of_day,
    tags: row.tags ?? [],
    budget: row.budget,
    cookMins: row.cook_mins,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const time = searchParams.get("time") as TimeKey | null;
  const tags = searchParams.getAll("tag");
  const exclude = new Set(searchParams.getAll("exclude")); // client ส่ง id มากันซ้ำได้
  const supa = supabasePublic();

  let query = supa.from("menus").select("*");
  console.log('query',query)
  if (time) query = query.contains("time_of_day", [time]);
  if (tags.length) query = query.contains("tags", tags);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const pool = (data ?? []).filter((r) => !exclude.has(r.id));
  if (pool.length === 0) {
    return NextResponse.json({ error: "no menus", count: 0 }, { status: 404 });
  }
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return NextResponse.json({ item: chooseMenu(pick), count: pool.length });
}
