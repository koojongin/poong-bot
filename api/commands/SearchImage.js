import * as Discord from 'discord.js';
import moment from 'moment';
import * as GoogleSearchAPIService from '../services/GoogleSearchAPIService.js';
import 'moment-timezone';
import _ from 'lodash';

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

export {
  execute, commands,
};
