import * as Discord from 'discord.js';
import moment from 'moment';
import * as GoogleSearchAPIService from '../services/GoogleSearchAPIService.js';
import 'moment-timezone';
import _ from 'lodash';
import FormData from 'form-data';
import got from 'got';

moment.tz.setDefault('Asia/Seoul');
const commands = ['이미지'];

async function execute({ msg, client, actionMessage }) {
  // const [actionUserId, page, ...actions] = actionMessage.split(' ');

  const images = await GoogleSearchAPIService.customSearchImage({ keyword: actionMessage });
  const selectedImage = images[Math.floor(Math.random() * images.length)];
  if (selectedImage) {
    const embedMessage = new Discord.MessageEmbed()
      .setTitle(selectedImage.title)
      .setURL(selectedImage.link)
      .setAuthor(msg.author.username)
      .setImage(selectedImage.url)
      .setTimestamp();
    msg.reply(embedMessage);
  } else {
    msg.reply(`[${actionMessage}] 검색 결과가 없습니다.`);
  }
}

async function getWeeklyBoxOfficeList() {
  const uri = 'http://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchWeeklyBoxOfficeList.json';

  return got.get(uri, {
    searchParams: {
      q: {
        key: 'f5eef3421c602c6cb7ea224104795888',
        targetDt: '20120101',
      },
    },
    responseType: 'json',
  }).then((r) => r.body);
}

export {
  execute, commands,
};
