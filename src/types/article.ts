import type { Store } from "./store";

export interface Article {
  id: string;
  storeId: string;
  slug: string;
  title: string;
  coverPhoto?: string;
  photos: string[];
  body: string;
  publishedAt: string | null;
  store: Store;
}

export interface ArticleSummary {
  id: string;
  storeId: string;
  slug: string;
  title: string;
  coverPhoto?: string;
  publishedAt: string | null;
  store: Pick<Store, "id" | "name" | "region" | "prefecture" | "town">;
}
