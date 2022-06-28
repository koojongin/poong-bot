import * as Discord from 'discord.js';
import moment from 'moment';
import * as GoogleSearchAPIService from '../services/GoogleSearchAPIService';
import 'moment-timezone';
import { MessageEmbed } from 'discord.js';

moment.tz.setDefault('Asia/Seoul');
const commands = ['이미지'];

async function execute({ msg, client, actionMessage }) {
  const images = await GoogleSearchAPIService.customSearchImage({ keyword: actionMessage });
  const selectedImage = images[Math.floor(Math.random() * images.length)];
  if (selectedImage) {
    const embedMessage = new MessageEmbed()
      .setTitle(selectedImage.title)
      .setURL(selectedImage.link)
      .setAuthor(msg.author.username)
      .setImage(selectedImage.url)
      .setTimestamp();
    msg.reply({ embeds: [embedMessage] });
  } else {
    msg.reply(`[${actionMessage}] 검색 결과가 없습니다.`);
  }
}

export { execute, commands };
