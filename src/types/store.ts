export interface Region {
  id: string;
  key: string;
  name: string;
  color: string;
  colorSoft: string;
  colorBorder: string;
  textColor: string;
}

export interface Genre {
  id: string;
  name: string;
}

export interface Store {
  id: string;
  name: string;
  genres: Genre[];
  region: Region;
  prefecture: string;
  town: string;
  village: string;
  address: string;
  lat: number;
  lng: number;
  photos: string[];
  profile: string;
  storeUrl?: string;
  phone?: string;
  isAd: boolean;
  reservationUrl?: string;
  providerNote?: string; // 情報提供者に関するメモ。店舗詳細画面に公開表示
}

export interface StoreFilters {
  keyword: string;
  regionIds: string[];
  genreIds: string[];
  prefecture: string;
}
