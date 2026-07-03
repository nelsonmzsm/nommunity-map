import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { geocodeAddress, isGeocodingConfigured } from "@/lib/geocode";

export async function POST(request: Request) {
  await requireAdmin();

  if (!isGeocodingConfigured()) {
    return NextResponse.json({ error: "ジオコーディングが設定されていません" }, { status: 400 });
  }

  const { address } = await request.json();
  if (typeof address !== "string" || !address.trim()) {
    return NextResponse.json({ error: "住所を入力してください" }, { status: 400 });
  }

  const coords = await geocodeAddress(address);
  if (!coords) {
    return NextResponse.json({ error: "住所から座標を取得できませんでした" }, { status: 404 });
  }

  return NextResponse.json(coords);
}
