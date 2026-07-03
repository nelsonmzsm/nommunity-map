import {
  Martini,
  Beer,
  ChefHat,
  Utensils,
  Globe,
  Soup,
  Coffee,
  UtensilsCrossed,
  Store,
  Wine,
  Fish,
  type LucideIcon,
} from "lucide-react";

const GENRE_ICONS: Record<string, LucideIcon> = {
  "バー": Martini,
  "スナック": Beer,
  "居酒屋（郷土料理あり）": ChefHat,
  "居酒屋": Utensils,
  "外国料理": Globe,
  "食堂": Soup,
  "カフェ": Coffee,
  "その他の飲食店": UtensilsCrossed,
  "飲食店以外のお店": Store,
  "ワイン": Wine,
  "寿司": Fish,
};

const DEFAULT_ICON: LucideIcon = Utensils;

export function genreIcon(genreNames: string[]): LucideIcon {
  for (const name of genreNames) {
    const icon = GENRE_ICONS[name];
    if (icon) return icon;
  }
  return DEFAULT_ICON;
}
