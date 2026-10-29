-- 推しコメント投稿・写真投稿機能（どちらも管理者の承認制）
-- store_submissions と同じ方針: anon への insert/update ポリシーは与えず、
-- 書き込みは Service Role 経由の Server Action のみに限定する。
-- 公開側（/api/stores）からは status='approved' の行だけを読めるようにする。

create table store_comments (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  display_name text not null,
  comment text not null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  admin_note text
);

create index store_comments_store_id_idx on store_comments(store_id);
create index store_comments_status_idx on store_comments(status);

create table store_photo_submissions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  display_name text not null,
  photo_url text not null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  admin_note text
);

create index store_photo_submissions_store_id_idx on store_photo_submissions(store_id);
create index store_photo_submissions_status_idx on store_photo_submissions(status);

alter table store_comments enable row level security;
alter table store_photo_submissions enable row level security;

create policy "store_comments_public_read_approved" on store_comments
  for select using (status = 'approved');

create policy "store_photo_submissions_public_read_approved" on store_photo_submissions
  for select using (status = 'approved');
