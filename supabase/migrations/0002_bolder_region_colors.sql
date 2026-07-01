-- 地域マスタの色をより視認性の高い(コントラストの強い)配色に更新
update regions set color = '#3B5998', color_soft = '#D7E0F5', color_border = '#24406F', text_color = '#1F2E4A' where key = 'amami';
update regions set color = '#2E8B57', color_soft = '#D2F0DE', color_border = '#1F6B41', text_color = '#17432A' where key = 'kikai';
update regions set color = '#C62828', color_soft = '#F8D7D7', color_border = '#8E1E1E', text_color = '#5C1414' where key = 'tokunoshima';
update regions set color = '#E07B00', color_soft = '#FCE3C2', color_border = '#A85800', text_color = '#6B3800' where key = 'okinoerabu';
update regions set color = '#0F8B9E', color_soft = '#CDEFF3', color_border = '#0B6472', text_color = '#0A4750' where key = 'yoron';
