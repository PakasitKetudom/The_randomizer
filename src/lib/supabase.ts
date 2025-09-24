import { createClient } from "@supabase/supabase-js";

export const supabasePublic = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// สำหรับฝั่ง server (route handlers) ใช้ service-role เพื่อสิทธิ์เขียน
export const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,     // อย่าใช้ตัวนี้ฝั่ง client เด็ดขาด
    { auth: { persistSession: false } }
  );
