-- 奄美飲（ノ）ミュニティマップ 初期スキーマ
-- regions / genres / stores / store_submissions + RLS + 承認関数 + シードデータ

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- regions（地域／島マスタ。将来の他地域拡張を見込み group_key で束ねる）
-- ---------------------------------------------------------------------------
create table regions (
  id uuid primary key default gen_random_uuid(),
  group_key text not null default 'amami',
  key text not null unique,
  name text not null,
  color text not null,
  color_soft text not null,
  color_border text not null,
  text_color text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- genres（ジャンルマスタ）
-- ---------------------------------------------------------------------------
create table genres (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- stores（公開テーブル）
-- ---------------------------------------------------------------------------
create table stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  genre_id uuid not null references genres(id),
  region_id uuid not null references regions(id),
  prefecture text not null,
  town text not null,
  village text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  photos text[] not null default '{}',
  profile text not null default '',
  store_url text,
  phone text,
  is_ad boolean not null default false,
  reservation_url text,
  provider_note text,
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- store_submissions（一般ユーザーからの未承認情報提供キュー）
-- ---------------------------------------------------------------------------
create table store_submissions (
  id uuid primary key default gen_random_uuid(),
  target_store_id uuid references stores(id),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitter_display_name text not null,
  submitter_contact text,
  name text,
  genre_id uuid references genres(id),
  region_id uuid references regions(id),
  prefecture text,
  town text,
  village text,
  address text,
  lat double precision,
  lng double precision,
  photos text[] not null default '{}',
  profile text,
  store_url text,
  phone text,
  message text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  admin_note text
);

-- ---------------------------------------------------------------------------
-- 承認処理: store_submissions -> stores へ反映し、submission を approved にする
-- ---------------------------------------------------------------------------
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
      genre_id = coalesce(s.genre_id, genre_id),
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
  else
    insert into stores (
      name, genre_id, region_id, prefecture, town, village, address,
      lat, lng, photos, profile, store_url, phone, provider_note
    ) values (
      s.name, s.genre_id, s.region_id, s.prefecture, s.town, s.village, s.address,
      s.lat, s.lng, s.photos, s.profile, s.store_url, s.phone, s.submitter_display_name
    )
    returning id into new_store_id;
  end if;

  update store_submissions
    set status = 'approved', reviewed_at = now(), reviewed_by = coalesce(reviewer_id, auth.uid())
    where id = submission_id;

  return new_store_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table regions enable row level security;
alter table genres enable row level security;
alter table stores enable row level security;
alter table store_submissions enable row level security;

create policy "regions_public_read_active" on regions
  for select using (is_active = true);

create policy "genres_public_read_active" on genres
  for select using (is_active = true);

create policy "stores_public_read_published" on stores
  for select using (status = 'published');

-- store_submissions: anon には SELECT/INSERT/UPDATE いずれのポリシーも与えない。
-- 書き込みは Service Role（RLSをバイパス）経由の Server Action のみに限定する。

-- ---------------------------------------------------------------------------
-- シードデータ: regions（src/data/islands.ts より）
-- ---------------------------------------------------------------------------
insert into regions (group_key, key, name, color, color_soft, color_border, text_color, sort_order) values
  ('amami', 'amami', '奄美大島', '#3B5998', '#D7E0F5', '#24406F', '#1F2E4A', 1),
  ('amami', 'kikai', '喜界島', '#2E8B57', '#D2F0DE', '#1F6B41', '#17432A', 2),
  ('amami', 'tokunoshima', '徳之島', '#C62828', '#F8D7D7', '#8E1E1E', '#5C1414', 3),
  ('amami', 'okinoerabu', '沖永良部島', '#E07B00', '#FCE3C2', '#A85800', '#6B3800', 4),
  ('amami', 'yoron', '与論島', '#0F8B9E', '#CDEFF3', '#0B6472', '#0A4750', 5);

-- ---------------------------------------------------------------------------
-- シードデータ: genres（src/data/stores.ts の GENRES より）
-- ---------------------------------------------------------------------------
insert into genres (name, sort_order) values
  ('スナック', 1),
  ('ダイニングバー', 2),
  ('バー・郷土料理', 3),
  ('居酒屋', 4),
  ('居酒屋・バー', 5),
  ('居酒屋・島料理', 6),
  ('居酒屋・郷土料理', 7),
  ('島料理・居酒屋', 8),
  ('食堂・居酒屋', 9),
  ('食堂・島料理', 10),
  ('焼肉・居酒屋', 11);

-- ---------------------------------------------------------------------------
-- シードデータ: stores（src/data/stores.ts の12件より）
-- ---------------------------------------------------------------------------
insert into stores (
  name, genre_id, region_id, prefecture, town, village, address, lat, lng,
  photos, profile, store_url, phone, is_ad, reservation_url
)
select
  v.name,
  (select id from genres where name = v.genre_name),
  (select id from regions where key = v.region_key),
  v.prefecture, v.town, v.village, v.address, v.lat, v.lng,
  v.photos, v.profile, v.store_url, v.phone, v.is_ad, v.reservation_url
from (values
  ('島唄居酒屋 うぶすな', '島料理・居酒屋', 'amami', '東京都', '新宿区歌舞伎町', '笠利町出身', '東京都新宿区歌舞伎町1-2-3', 35.6938, 139.7034,
    array['https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800','https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'],
    '奄美大島・笠利町出身の店主が営む島料理居酒屋。鶏飯や油ぞうめん、島豚の黒糖角煮など、故郷の味を東京で楽しめます。店内では島唄のライブも不定期開催。奄美出身者の憩いの場としても親しまれています。',
    'https://example.com/ubusuna', '03-1234-5601', true, 'https://example.com/ubusuna/reserve'),
  ('喜界島バル Kikai', 'バー・郷土料理', 'kikai', '東京都', '豊島区池袋', '湾出身', '東京都豊島区池袋2-4-5', 35.7295, 139.7109,
    array['https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800'],
    '喜界島産の黒糖焼酎を豊富に取り揃えたバー。マグロ料理と喜界島の郷土料理が自慢です。',
    'https://example.com/kikai-bar', null, false, null),
  ('徳之島 闘牛酒場', '焼肉・居酒屋', 'tokunoshima', '東京都', '渋谷区渋谷', '亀津出身', '東京都渋谷区渋谷3-6-7', 35.6595, 139.7005,
    array['https://images.unsplash.com/photo-1544025162-d76694265947?w=800','https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800','https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800'],
    '徳之島直送の黒毛和牛と島の郷土料理が味わえる焼肉居酒屋。闘牛の写真が飾られた店内で、徳之島出身の店主が温かく迎えてくれます。',
    'https://example.com/tokunoshima-toughtei', '03-1234-5603', false, null),
  ('えらぶ島cafe＆dining', 'ダイニングバー', 'okinoerabu', '東京都', '杉並区高円寺', '知名町出身', '東京都杉並区高円寺北3-8-9', 35.7052, 139.6497,
    array['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
    '沖永良部島・知名町出身のオーナーが営むダイニングバー。フローラルな島の花々を飾った店内で、島野菜を使った創作料理を提供しています。',
    null, null, false, null),
  ('よろん島 海人食堂', '食堂・島料理', 'yoron', '東京都', '台東区上野', '茶花出身', '東京都台東区上野4-1-2', 35.7138, 139.7770,
    array['https://images.unsplash.com/photo-1553621042-f6e147245754?w=800','https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800'],
    '与論島の海人（うみんちゅ）文化を伝える食堂。獲れたての魚介と与論献奉（乾杯の作法）を体験できる宴会コースも人気です。',
    'https://example.com/yoron-umin', null, false, null),
  ('奄美酒場 かさり', '居酒屋', 'amami', '大阪府', '大阪市中央区難波', '名瀬出身', '大阪府大阪市中央区難波5-10-11', 34.6656, 135.5019,
    array['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'],
    '名瀬出身の店主が営む大阪の奄美酒場。関西在住の奄美群島出身者が集うコミュニティスポットにもなっています。',
    null, null, false, null),
  ('黒糖と島唄の店 かなしゃ', 'スナック', 'amami', '大阪府', '大阪市北区梅田', '住用町出身', '大阪府大阪市北区梅田1-12-13', 34.7024, 135.4959,
    array['https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800'],
    '黒糖焼酎の種類が豊富なスナック。ママは奄美大島住用町の出身で、島唄カラオケも楽しめます。',
    null, null, false, null),
  ('天文館 島十字路', '居酒屋・郷土料理', 'tokunoshima', '鹿児島県', '鹿児島市千日町', '伊仙町出身', '鹿児島県鹿児島市千日町2-14', 31.5966, 130.5571,
    array['https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800','https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800'],
    '鹿児島市天文館にある徳之島郷土料理の名店。伊仙町出身の店主が作る海老天ぷらと徳之島産黒糖焼酎の相性は抜群です。',
    'https://example.com/shimajujiro', null, false, null),
  ('きょらの島 横浜店', '居酒屋', 'okinoerabu', '神奈川県', '横浜市西区みなとみらい', '和泊町出身', '神奈川県横浜市西区みなとみらい2-15', 35.4437, 139.6380,
    array['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'],
    '和泊町出身の兄弟が営む居酒屋。エラブユリの生花を飾ったおしゃれな空間で島料理を提供。',
    null, null, false, null),
  ('ヨロン献奉 名古屋店', '居酒屋・バー', 'yoron', '愛知県', '名古屋市中村区名駅', '立長出身', '愛知県名古屋市中村区名駅3-16', 35.1815, 136.9066,
    array['https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800'],
    '与論島の伝統的な乾杯儀礼「与論献奉」を体験できる居酒屋。名古屋在住の与論島出身者コミュニティの拠点です。',
    null, null, false, null),
  ('喜界島 なごみ処', '居酒屋・島料理', 'kikai', '福岡県', '福岡市博多区博多駅', '早町出身', '福岡県福岡市博多区博多駅前2-17', 33.5904, 130.4017,
    array['https://images.unsplash.com/photo-1592861956120-e524fc739696?w=800'],
    '喜界島早町出身の店主が営む博多の島料理店。喜界島のごま豆腐と黒糖焼酎が名物です。',
    null, null, false, null),
  ('奄美群島 だんだん食堂', '食堂・居酒屋', 'amami', '東京都', '大田区蒲田', '瀬戸内町出身', '東京都大田区蒲田5-18-19', 35.5622, 139.7161,
    array['https://images.unsplash.com/photo-1553621042-f6e147245754?w=800','https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800','https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800'],
    '瀬戸内町出身の店主が営む家庭的な食堂。鶏飯定食が名物で、ランチ・ディナー共に地元の奄美群島出身者で賑わいます。奄美大島の郷土料理を気軽に楽しめる貴重なお店です。',
    'https://example.com/dandan', '03-1234-5612', true, 'https://example.com/dandan/reserve')
) as v(name, genre_name, region_key, prefecture, town, village, address, lat, lng, photos, profile, store_url, phone, is_ad, reservation_url);
