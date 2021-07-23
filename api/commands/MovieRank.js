import * as Discord from 'discord.js';
import moment from 'moment';
import 'moment-timezone';
import got from 'got';

moment.tz.setDefault('Asia/Seoul');
const commands = ['박스오피스'];
const { KOBIS_API_KEY } = process.env;
const emojiCharacters = {
  a: '🇦',
  b: '🇧',
  c: '🇨',
  d: '🇩',
  e: '🇪',
  f: '🇫',
  g: '🇬',
  h: '🇭',
  i: '🇮',
  j: '🇯',
  k: '🇰',
  l: '🇱',
  m: '🇲',
  n: '🇳',
  o: '🇴',
  p: '🇵',
  q: '🇶',
  r: '🇷',
  s: '🇸',
  t: '🇹',
  u: '🇺',
  v: '🇻',
  w: '🇼',
  x: '🇽',
  y: '🇾',
  z: '🇿',
  0: '0⃣',
  1: '1⃣',
  2: '2⃣',
  3: '3⃣',
  4: '4⃣',
  5: '5⃣',
  6: '6⃣',
  7: '7⃣',
  8: '8⃣',
  9: '9⃣',
  10: '🔟',
  '#': '#⃣',
  '*': '*⃣',
  '!': '❗',
  '?': '❓',
};

async function execute({ msg, client, actionMessage }) {
  // const [actionUserId, page, ...actions] = actionMessage.split(' ');
  // eslint-disable-next-line no-use-before-define
  const { boxOfficeResult } = await getWeeklyBoxOfficeList();
  const {
    weeklyBoxOfficeList, yearWeekTime, showRange, boxofficeType,
  } = boxOfficeResult;
  if (boxOfficeResult) {
    let description = '순위|개봉일|제목|관객수|전일대비 관객증감율|상영횟수\n';
    weeklyBoxOfficeList.forEach((movie) => {
      description += `${movie.rank}. \`${movie.openDt}\` ${movie.movieNm} | ${parseInt(movie.audiAcc).toLocaleString()}명 `;
      description += `| ${parseInt(movie.audiChange) >= 0 ? ':arrow_up:' : ':small_red_triangle_down:'}${movie.audiChange}% | ${parseInt(movie.showCnt).toLocaleString()}`;
      description += '\n';
    });
    const embedMessage = new Discord.MessageEmbed()
      .setTitle(`${boxofficeType} ${showRange}`)
      .setDescription(description)
      // .setURL(selectedImage.link)
      .setAuthor(msg.author.username);
      // .setImage(selectedImage.url)

    // msg.react(':one:');
    const createdMessage = await msg.reply(embedMessage);
    createdMessage.react(emojiCharacters['1']);
    await createdMessage.react(emojiCharacters['2']);
    createdMessage.react(emojiCharacters['3']);
    createdMessage.react(emojiCharacters['4']);
    createdMessage.react(emojiCharacters['5']);
    createdMessage.react(emojiCharacters['6']);
  } else {
    msg.reply(`[${actionMessage}] 검색 결과가 없습니다.`);
  }
}

async function getWeeklyBoxOfficeList() {
  const uri = 'http://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchWeeklyBoxOfficeList.json';
  return got.get(uri, {
    searchParams: {
      key: KOBIS_API_KEY,
      targetDt: moment().subtract('day', 6).format('YYYYMMDD'),
      weekGb: '0',
      itemPerPage: 30,
    },
    responseType: 'json',
  }).then((r) => r.body);
}

export {
  execute, commands,
};
