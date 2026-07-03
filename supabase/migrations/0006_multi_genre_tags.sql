-- ジャンルを「1店舗1カテゴリ」から「複数タグ付け可能」な方式に変更する。
-- store_genres を stores <-> genres の中間テーブルとして新設し、
-- stores.genre_id / store_submissions.genre_id は廃止する。

create table store_genres (
  store_id uuid not null references stores(id) on delete cascade,
  genre_id uuid not null references genres(id),
  primary key (store_id, genre_id)
);

alter table store_genres enable row level security;

create policy "store_genres_public_read" on store_genres
  for select using (true);

alter table stores drop column genre_id;

alter table store_submissions
  add column genre_ids uuid[] not null default '{}';

-- 旧 genre_id 列は廃止（genre_ids に一本化）
alter table store_submissions drop column genre_id;

-- 承認処理を genre_ids（複数）に対応させて再定義
create or replace function approve_submission(submission_id uuid, reviewer_id uuid default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  s store_submissions%rowtype;
  new_store_id uuid;
begin
  select * into s from store_submissions where id = submission_id and status = 'pending';
  if not found then
    raise exception 'submission % not found or already reviewed', submission_id;
  end if;

  if s.target_store_id is not null then
    update stores set
      name = coalesce(s.name, name),
      region_id = coalesce(s.region_id, region_id),
      prefecture = coalesce(s.prefecture, prefecture),
      town = coalesce(s.town, town),
      village = coalesce(s.village, village),
      address = coalesce(s.address, address),
      lat = coalesce(s.lat, lat),
      lng = coalesce(s.lng, lng),
      photos = case when array_length(s.photos, 1) > 0 then s.photos else photos end,
      profile = coalesce(s.profile, profile),
      store_url = coalesce(s.store_url, store_url),
      phone = coalesce(s.phone, phone),
      provider_note = coalesce(s.submitter_display_name, provider_note),
      updated_at = now()
    where id = s.target_store_id
    returning id into new_store_id;

    if array_length(s.genre_ids, 1) > 0 then
      delete from store_genres where store_id = new_store_id;
      insert into store_genres (store_id, genre_id)
        select new_store_id, unnest(s.genre_ids);
    end if;
  else
    insert into stores (
      name, region_id, prefecture, town, village, address,
      lat, lng, photos, profile, store_url, phone, provider_note
    ) values (
      s.name, s.region_id, s.prefecture, s.town, s.village, s.address,
      s.lat, s.lng, s.photos, s.profile, s.store_url, s.phone, s.submitter_display_name
    )
    returning id into new_store_id;

    insert into store_genres (store_id, genre_id)
      select new_store_id, unnest(s.genre_ids);
  end if;

  update store_submissions
    set status = 'approved', reviewed_at = now(), reviewed_by = coalesce(reviewer_id, auth.uid())
    where id = submission_id;

  return new_store_id;
end;
$$;
