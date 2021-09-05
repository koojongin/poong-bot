const dictionary = {
  연두부: 'lovelyyeon',
  풍월량: 'hanryang1125',
  서새봄: 'saddummy',
  침착맨: 'zilioner',
  따효니: 'ddahyoni',
  인간젤리: 'ses836',
  철면수심: '109ace',
  혜미: 'ham_90',
  햇살살: 'hatsalsal',
  소우릎: 'so_urf',
  플러리: 'flurry1989',
  얍얍: 'yapyap30',
  쉐리: 'kss7749',
  앰비션: 'lol_ambition',
  러너: 'runner0608',
  스나랑: 'snarang',
  미레야: 'mireyatwit',
  피유: 'beyou0728',
  소풍왔니: 'yumyumyu77',
  주펄: 'noizemasta',
  요룰레히: 'yodel_ay',
  유잼이: 'youjamjam',
  우정잉: 'nanajam777',
  괴물쥐: 'tmxk319',
  크캣: 'crazzyccat',
  김도: 'kimdoe',
  자동: 'tranth',
  옥자: 'ok_ja',
  한동숙: 'handongsuk',
  녹두로: 'nokduro',
  강소연: 'rkdthdus930',
  매라: 'lol_madlife',
  쿠하: 'sees360',
  모모: 'rockid1818',
  이선생: 'drlee_kor',
  김기열: 'kiyulking',
  도현: 'd_obby',
  소니쇼: 'sonycast_',
  짬타수아: 'zzamtiger0310',
  lck: 'lck_korea',
  마젠타: 'magenta62',
  케인: 'kanetv8',
  한갱: 'woohankyung',
  릴펄: 'lilpearl_',
  수련수련: 'sooflower',
  민땅: 'strawberry_bbubbbu',
};

function convertByNickname(nickname = '풍월량') {
  // eslint-disable-next-line no-param-reassign
  if (nickname === '') nickname = '풍월량';
  const username = dictionary[nickname];
  return username || nickname;
}

export {
  dictionary, convertByNickname,
};
