import { NextRequest, NextResponse } from "next/server";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import { supabasePublic, supabaseAdmin } from "@/lib/supabase";

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

    const q     = (searchParams.get("q") || "").toLowerCase();
    const time  = searchParams.get("time") as TimeKey | null;
    const tags  = searchParams.getAll("tag");

    const page  = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.max(1, Number(searchParams.get("limit") || "5"));
    const from  = (page - 1) * limit;
    const to    = from + limit - 1;

    const supa = supabasePublic();
    let query = supa.from("menus").select("*", { count: "exact" });

    if (q)    query = query.ilike("name_th", `%${q}%`);
    if (time) query = query.contains("time_of_day", [time]);   // array contains
    if (tags.length) query = query.contains("tags", tags);

    const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      items: (data ?? []).map(chooseMenu),
      total: count ?? 0,
      page,
      limit,
      pageCount: Math.max(1, Math.ceil((count ?? 0) / limit)),
    });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body?.nameTH || !Array.isArray(body?.timeOfDay) || body.timeOfDay.length === 0) {
    return NextResponse.json({ error: "nameTH & timeOfDay required" }, { status: 400 });
  }
  const supa = supabaseAdmin();
  const { data, error } = await supa
    .from("menus")
    .insert({
      name_th: body.nameTH,
      time_of_day: body.timeOfDay,
      tags: body.tags ?? [],
      budget: body.budget ?? null,
      cook_mins: body.cookMins ?? null,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, item: chooseMenu(data) }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const body = await req.json();

  const supa = supabaseAdmin();
  const { data, error } = await supa
    .from("menus")
    .update({
      name_th: body.nameTH,
      time_of_day: body.timeOfDay,
      tags: body.tags,
      budget: body.budget ?? null,
      cook_mins: body.cookMins ?? null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, item: chooseMenu(data) });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const supa = supabaseAdmin();
  const { data, error } = await supa.from("menus").delete().eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, removed: chooseMenu(data) });
}
