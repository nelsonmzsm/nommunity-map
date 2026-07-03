-- 投稿者の名前を「情報提供者」として公開してよいかの同意フラグ
alter table store_submissions
  add column credit_name boolean not null default false;

-- 承認処理: 同意がある場合のみ submitter_display_name を provider_note に反映する
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
      provider_note = case when s.credit_name then s.submitter_display_name else provider_note end,
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
      s.lat, s.lng, s.photos, s.profile, s.store_url, s.phone,
      case when s.credit_name then s.submitter_display_name else null end
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
