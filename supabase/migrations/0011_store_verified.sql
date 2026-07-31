-- 店舗情報の裏取り状況（店主への確認・電話等で確認済みか）を管理するフラグ
alter table stores add column verified boolean not null default false;
