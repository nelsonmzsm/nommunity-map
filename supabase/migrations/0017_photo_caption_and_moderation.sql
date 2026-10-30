-- 写真投稿に任意のコメント（キャプション）を追加し、
-- 承認済みの投稿を管理側であとから「非表示」にできるようにステータスを拡張する。
-- 既存のstatus制約は手動実行された0016時点の自動生成名が不明なため、
-- pg_constraintから動的に探して安全に差し替える。

alter table store_photo_submissions
  add column comment text check (comment is null or char_length(comment) <= 1000);

do $$
declare
  conname text;
begin
  select con.conname into conname
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  where rel.relname = 'store_comments'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) like '%status%';
  if conname is not null then
    execute format('alter table store_comments drop constraint %I', conname);
  end if;
end $$;

alter table store_comments
  add constraint store_comments_status_check
  check (status in ('pending', 'approved', 'rejected', 'hidden'));

do $$
declare
  conname text;
begin
  select con.conname into conname
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  where rel.relname = 'store_photo_submissions'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) like '%status%';
  if conname is not null then
    execute format('alter table store_photo_submissions drop constraint %I', conname);
  end if;
end $$;

alter table store_photo_submissions
  add constraint store_photo_submissions_status_check
  check (status in ('pending', 'approved', 'rejected', 'hidden'));
