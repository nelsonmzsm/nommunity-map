-- 情報提供フォームの拡張:
-- ・自薦/他薦の区分
-- ・ジャンル「その他の飲食店」を選んだ場合の自由記入テキスト
alter table store_submissions
  add column submitter_relation text check (submitter_relation in ('self', 'other')),
  add column genre_other_text text;
