import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Store } from "@/types/store";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stores")
    .select("*, genre:genres(*), region:regions(*)")
    .eq("status", "published");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const stores: Store[] = data.map((s) => ({
    id: s.id,
    name: s.name,
    genre: { id: s.genre.id, name: s.genre.name },
    region: {
      id: s.region.id,
      key: s.region.key,
      name: s.region.name,
      color: s.region.color,
      colorSoft: s.region.color_soft,
      colorBorder: s.region.color_border,
      textColor: s.region.text_color,
    },
    prefecture: s.prefecture,
    town: s.town,
    village: s.village,
    address: s.address,
    lat: s.lat,
    lng: s.lng,
    photos: s.photos,
    profile: s.profile,
    storeUrl: s.store_url ?? undefined,
    phone: s.phone ?? undefined,
    isAd: s.is_ad,
    reservationUrl: s.reservation_url ?? undefined,
    providerNote: s.provider_note ?? undefined,
  }));

  return NextResponse.json(stores);
}
