// 都道府県が「海外」の場合、住所欄にはすでに国名を含めて全部入力してもらって
// いるため、表示用のフルアドレスを組み立てるときは「海外」自体を含めない
// （そのまま含めると「海外」＋住所の頭に国名が二重に来て読みにくくなるため）。
export function formatFullAddress(store: {
  prefecture: string;
  town: string;
  address: string;
}): string {
  const prefecture = store.prefecture === "海外" ? "" : store.prefecture;
  return `${prefecture}${store.town}${store.address}`;
}
