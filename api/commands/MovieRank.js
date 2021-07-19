import * as Discord from 'discord.js';
import moment from 'moment';
import 'moment-timezone';
import got from 'got';

moment.tz.setDefault('Asia/Seoul');
const commands = ['박스오피스'];
const { KOBIS_API_KEY } = process.env;
async function execute({ msg, client, actionMessage }) {
  // const [actionUserId, page, ...actions] = actionMessage.split(' ');
  // eslint-disable-next-line no-use-before-define
  const { boxOfficeResult } = await getWeeklyBoxOfficeList();
  const {
    weeklyBoxOfficeList, yearWeekTime, showRange, boxofficeType,
  } = boxOfficeResult;
  if (boxOfficeResult) {
    let description = '순위|개봉일|제목|관객수\n';
    weeklyBoxOfficeList.forEach((movie) => {
      description += `${movie.rank}. \`${movie.openDt}\` ${movie.movieNm} | ${parseInt(movie.audiAcc).toLocaleString()}명`;
      description += '\n';
    });
    const embedMessage = new Discord.MessageEmbed()
      .setTitle(`${boxofficeType} ${showRange}`)
      .setDescription(description)
      // .setURL(selectedImage.link)
      .setAuthor(msg.author.username);
      // .setImage(selectedImage.url)
    msg.reply(embedMessage);
  } else {
    msg.reply(`[${actionMessage}] 검색 결과가 없습니다.`);
  }
}

async function getWeeklyBoxOfficeList() {
  const uri = 'http://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchWeeklyBoxOfficeList.json';
  return got.get(uri, {
    searchParams: {
      key: KOBIS_API_KEY,
      targetDt: moment().subtract('day', 1).format('YYYYMMDD'),
      weekGb: '0',
      itemPerPage: 30,
    },
    responseType: 'json',
  }).then((r) => r.body);
}

export {
  execute, commands,
};
