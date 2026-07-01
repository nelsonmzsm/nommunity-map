import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Region } from "@/types/store";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("regions")
    .select("*")
    .eq("group_key", "amami")
    .eq("is_active", true)
    .order("sort_order");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const regions: Region[] = data.map((r) => ({
    id: r.id,
    key: r.key,
    name: r.name,
    color: r.color,
    colorSoft: r.color_soft,
    colorBorder: r.color_border,
    textColor: r.text_color,
  }));

  return NextResponse.json(regions);
}
