import * as Discord from 'discord.js';
import moment from 'moment';
import 'moment-timezone';
import { getMovie } from '../services/NaverAPIService.js';

moment.tz.setDefault('Asia/Seoul');
const commands = ['영화'];

async function execute({ msg, client, actionMessage }) {
  const movie = await getMovie({ movieName: actionMessage });
  const movieMessage = getMovieEmbedMessage({ movie });
  msg.reply(movieMessage);
}

function getMovieEmbedMessage({ movie }) {
  const {
    title, link, image, subtitle, pubDate, director, actor, userRating,
  } = movie;
  // const fullImage = getImageLinkFromUrl(link);
  let description = '';
  description += `[${pubDate}] ${title.replace(/<b>/g, '').replace(/<\/b>/g, '')}(${subtitle})`;
  description += '\n\n';
  description += `감독\n${director.split('|').join(',')}`;
  description += '\n\n';
  description += `출연\n${actor.split('|').join(', ')}`;
  description += '\n\n';
  description += `평점\n${userRating.toLocaleString()} / 10`;
  description += '\n\n';
  description += `${link}`;
  description += '\n';
  const embedMessage = new Discord.MessageEmbed()
    .setColor('#51ace8')
  // .setImage(`${fullImage}?v=${new Date().getTime()}`)
    .setThumbnail(image)
    .setDescription(description);
  return embedMessage;
}
export {
  execute, commands,
};
