-- 店舗の完全削除に対応する。
-- store_submissions.target_store_id は削除時にブロックされないよう SET NULL に変更する
-- （store_genres は既に ON DELETE CASCADE 済み）。
alter table store_submissions
  drop constraint store_submissions_target_store_id_fkey,
  add constraint store_submissions_target_store_id_fkey
    foreign key (target_store_id) references stores(id) on delete set null;
