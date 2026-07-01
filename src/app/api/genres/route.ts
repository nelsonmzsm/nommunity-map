import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Genre } from "@/types/store";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("genres")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const genres: Genre[] = data.map((g) => ({ id: g.id, name: g.name }));

  return NextResponse.json(genres);
}
