-- 加計呂麻島・与路島・請島（3島で1カテゴリ）を追加し、
-- 大島紬(泥染め・藍染め)の伝統色を意識した6色のトレードカラーに統一する。

-- 既存5島の色を最終パレットに更新
update regions set color = '#26417A', color_soft = '#DCE3F2', color_border = '#17294F', text_color = '#15213D' where key = 'amami';
update regions set color = '#2F7A4D', color_soft = '#DCEFE1', color_border = '#1E5233', text_color = '#17402A' where key = 'kikai';
update regions set color = '#A13D2B', color_soft = '#F3DAD3', color_border = '#6E291D', text_color = '#551F16' where key = 'tokunoshima';
update regions set color = '#C97A25', color_soft = '#F6E3C7', color_border = '#8F5416', text_color = '#6B3F10' where key = 'okinoerabu';
update regions set color = '#1B8A94', color_soft = '#D3EEF0', color_border = '#115A61', text_color = '#0D444A' where key = 'yoron';

-- 加計呂麻島・与路島・請島（泥藍染めの紫）を新規追加
insert into regions (group_key, key, name, color, color_soft, color_border, text_color, sort_order)
values ('amami', 'kakeroma', '加計呂麻島・与路島・請島', '#6B4E8E', '#E6DEF0', '#4A3563', '#3A294D', 6);
