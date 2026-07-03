-- 地図のピン色が暗く見にくいという指摘を受け、タグ・ピン共通で
-- 一目で島がわかる明るめの配色に更新する。

update regions set color = '#5B7FC7', color_soft = '#E4EAF9', color_border = '#3E5FA8', text_color = '#2C4270' where key = 'amami';
update regions set color = '#4FAE79', color_soft = '#E1F4E9', color_border = '#358A5C', text_color = '#255E3E' where key = 'kikai';
update regions set color = '#E2664F', color_soft = '#FCE3DE', color_border = '#C24A34', text_color = '#8A3323' where key = 'tokunoshima';
update regions set color = '#F0A140', color_soft = '#FDECD4', color_border = '#D0822A', text_color = '#8C5A19' where key = 'okinoerabu';
update regions set color = '#3FB6C7', color_soft = '#DBF3F6', color_border = '#2896A6', text_color = '#1D6672' where key = 'yoron';
update regions set color = '#9B7FCB', color_soft = '#EDE6F7', color_border = '#7C5FAE', text_color = '#54408A' where key = 'kakeroma';
update regions set color = '#B08A5E', color_soft = '#F2E7D8', color_border = '#8E6C43', text_color = '#5F4A2E' where key = 'uke';
update regions set color = '#D07697', color_soft = '#F8E3EB', color_border = '#B15678', text_color = '#7C3B54' where key = 'yoro';
update regions set color = '#9CA3AF', color_soft = '#FFFFFF', color_border = '#9CA3AF', text_color = '#4B5563' where key = 'unconfirmed';
