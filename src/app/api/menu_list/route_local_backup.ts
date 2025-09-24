// src/app/api/meals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MENUS } from "@/data/menu_list";

// กัน cache ของ Route Handler (สุ่มได้ทุกครั้ง)
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // รองรับฟิลเตอร์เบื้องต้นผ่าน query (optional)
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").toLowerCase();
    const time = searchParams.get("time") as TimeKey | null;
    const tags = searchParams.getAll("tag");

    // new: pagination params (default 5 ต่อหน้า)
    const page  = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.max(1, Number(searchParams.get("limit") || "5"));
    const start = (page - 1) * limit;
    const end   = start + limit;

    // filter เดิม
    let list = MENUS.slice();
    if (q) list = list.filter(m => m.nameTH.toLowerCase().includes(q));
    if (time) list = list.filter(m => m.timeOfDay.includes(time));
    if (tags.length) list = list.filter(m => tags.every(t => m.tags.includes(t)));

    const total = list.length;
    const items = list.slice(start, end); // ✅ ตัดตามหน้า

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      pageCount: Math.max(1, Math.ceil(total / limit)),
    });
}



type TimeKey = "breakfast" | "lunch" | "dinner";
type Menus = {
  id: string;
  nameTH: string;
  timeOfDay: TimeKey[];
  tags: string[];
  budget?: number;
  cookMins?: number;
};
export async function POST(req: NextRequest) {
  const body = await req.json();
  // validate คร่าว ๆ
  if (!body?.nameTH || !Array.isArray(body?.timeOfDay) || body.timeOfDay.length === 0) {
    return NextResponse.json({ error: "กรุณาระบุ nameTH และ timeOfDay" }, { status: 400 });
  }
  const newMenu: Menus = {
    id: Date.now().toString(),
    nameTH: String(body.nameTH),
    timeOfDay: body.timeOfDay as TimeKey[],
    tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
    budget: body.budget ? Number(body.budget) : undefined,
    cookMins: body.cookMins ? Number(body.cookMins) : undefined,
  };
  MENUS.push(newMenu);
  return NextResponse.json({ success: true, item: newMenu });
}




// UPDATE (PUT /api/menu_list?id=...)
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ต้องระบุ id" }, { status: 400 });
  const body = await req.json();
  const i = MENUS.findIndex(m => m.id === id);
  if (i === -1) return NextResponse.json({ error: "ไม่พบรายการ" }, { status: 404 });

  MENUS[i] = {
    ...MENUS[i],
    nameTH: body.nameTH ?? MENUS[i].nameTH,
    timeOfDay: Array.isArray(body.timeOfDay) ? body.timeOfDay : MENUS[i].timeOfDay,
    tags: Array.isArray(body.tags) ? body.tags : MENUS[i].tags,
    budget: body.budget === undefined || body.budget === "" ? undefined : Number(body.budget),
    cookMins: body.cookMins === undefined || body.cookMins === "" ? undefined : Number(body.cookMins),
  };
  return NextResponse.json({ success: true, item: MENUS[i] });
}

// DELETE (DELETE /api/menu_list?id=...)
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ต้องระบุ id" }, { status: 400 });
  const idx = MENUS.findIndex(m => m.id === id);
  if (idx === -1) return NextResponse.json({ error: "ไม่พบรายการ" }, { status: 404 });
  const removed = MENUS.splice(idx, 1)[0];
  return NextResponse.json({ success: true, removed });
}
