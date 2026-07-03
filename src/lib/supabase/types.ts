// 注意: ここでは Row/Insert/Update/Relationships の型を必ず `type` エイリアスで定義すること。
// `interface` で定義すると、postgrest-js の深いジェネリック解決チェーンの中で
// なぜか Schema が `never` に解決されてしまい、from("table").select() 等が
// 全滅する（実際に発生したことがあるので要注意）。

type RegionRow = {
  id: string;
  group_key: string;
  key: string;
  name: string;
  color: string;
  color_soft: string;
  color_border: string;
  text_color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

type GenreRow = {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

type StoreRow = {
  id: string;
  name: string;
  region_id: string;
  prefecture: string;
  town: string;
  village: string;
  address: string;
  lat: number;
  lng: number;
  photos: string[];
  profile: string;
  store_url: string | null;
  phone: string | null;
  is_ad: boolean;
  reservation_url: string | null;
  provider_note: string | null;
  status: "published" | "hidden";
  created_at: string;
  updated_at: string;
};

type StoreGenreRow = {
  store_id: string;
  genre_id: string;
};

type StoreSubmissionRow = {
  id: string;
  target_store_id: string | null;
  status: "pending" | "approved" | "rejected";
  submitter_display_name: string;
  submitter_contact: string | null;
  name: string | null;
  genre_ids: string[];
  region_id: string | null;
  prefecture: string | null;
  town: string | null;
  village: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  photos: string[];
  profile: string | null;
  store_url: string | null;
  phone: string | null;
  message: string | null;
  submitter_relation: "self" | "other" | null;
  genre_other_text: string | null;
  credit_name: boolean;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_note: string | null;
};

export type Database = {
  public: {
    Tables: {
      regions: {
        Row: RegionRow;
        Insert: Partial<RegionRow>;
        Update: Partial<RegionRow>;
        Relationships: [];
      };
      genres: {
        Row: GenreRow;
        Insert: Partial<GenreRow>;
        Update: Partial<GenreRow>;
        Relationships: [];
      };
      stores: {
        Row: StoreRow;
        Insert: Partial<StoreRow>;
        Update: Partial<StoreRow>;
        Relationships: [
          {
            foreignKeyName: "stores_region_id_fkey";
            columns: ["region_id"];
            isOneToOne: false;
            referencedRelation: "regions";
            referencedColumns: ["id"];
          }
        ];
      };
      store_genres: {
        Row: StoreGenreRow;
        Insert: Partial<StoreGenreRow>;
        Update: Partial<StoreGenreRow>;
        Relationships: [
          {
            foreignKeyName: "store_genres_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "store_genres_genre_id_fkey";
            columns: ["genre_id"];
            isOneToOne: false;
            referencedRelation: "genres";
            referencedColumns: ["id"];
          }
        ];
      };
      store_submissions: {
        Row: StoreSubmissionRow;
        Insert: Partial<StoreSubmissionRow>;
        Update: Partial<StoreSubmissionRow>;
        Relationships: [
          {
            foreignKeyName: "store_submissions_target_store_id_fkey";
            columns: ["target_store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "store_submissions_region_id_fkey";
            columns: ["region_id"];
            isOneToOne: false;
            referencedRelation: "regions";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      approve_submission: {
        Args: { submission_id: string; reviewer_id?: string | null };
        Returns: string;
      };
    };
  };
};
