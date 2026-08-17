-- 運営取材記事機能
-- 店舗と1:1（1店舗1記事）で紐づく取材メモ・記事を管理する。

create table articles (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade unique,
  slug text not null unique,
  title text not null,
  cover_photo text,
  photos text[] not null default '{}',
  body text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  view_count int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index articles_store_id_idx on articles(store_id);
create index articles_published_at_idx on articles(published_at desc);

alter table articles enable row level security;

create policy "articles_public_read_published" on articles
  for select using (status = 'published');

-- 書き込みはService Role（RLSをバイパス）経由の管理画面Server Actionのみに限定する。

-- 閲覧数カウント用。anon（RLS制限あり）から安全にインクリメントだけ許可する。
create or replace function increment_article_view_count(article_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update articles set view_count = view_count + 1
  where id = article_id and status = 'published';
end;
$$;

grant execute on function increment_article_view_count(uuid) to anon, authenticated;
