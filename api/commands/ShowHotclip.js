import * as Discord from 'discord.js';
import moment from 'moment';
import * as TwitchAPIService from '../services/TwitchAPIService.js';
import * as CONSTANT from '../../config/constants.js';
import * as StreamUtilService from '../services/StreamUtilService.js';
import 'moment-timezone';
import got from 'got';
import cheerio from 'cheerio';
import _ from 'lodash';

moment.tz.setDefault('Asia/Seoul');
const commands = ['핫클립'];

async function execute({ msg, client, actionMessage }) {
  let page = 1;
  if (_.isNumber(+actionMessage) && !_.isEmpty(actionMessage)) {
    page = (+actionMessage);
  }
  let clipsElements;
  // eslint-disable-next-line no-useless-catch
  try {
    const { body } = await got.get('clips', {
      prefixUrl: 'https://tgd.kr',
      // responseType: 'json',
      // headers: {
      //   'Client-Id': TWITCH_BOT_CLIENT_ID,
      //   Authorization: `Bearer ${ACCESS_TOKEN}`,
      // },
    });

    const $ = cheerio.load(body).root();
    clipsElements = $.find('.clips');
  } catch (error) {
    throw error;
  }

  let description = '';
  let embedMessage;
  if (actionMessage === '') {
    description += '```';
    clipsElements.toArray().forEach((clip, index) => {
      const title = cheerio.load(clip).root().find('.img-container .clips-thumbnail').attr('alt');
      const streamerId = cheerio.load(clip).root().find('.clip-title .streamer').text();
      const clipLink = cheerio.load(clip).root().find('.clip-title .clip-launch').attr('href');
      const thumbnailUrl = cheerio.load(clip).root().find('.img-container .clips-thumbnail').attr('src');
      // description += `${index + 1}. ${streamerId} [${title}](https://tgd.kr${clipLink})`;
      description += `${index + 1}. ${streamerId} - ${title}`;
      description += '\n';
    });
    description += '```';
    embedMessage = new Discord.MessageEmbed()
      .setTitle('일일 핫클립')
      .setColor('#d22ef1')
      .setDescription(description);
  } else {
    const clip = clipsElements.get(page - 1);
    const title = cheerio.load(clip).root().find('.img-container .clips-thumbnail').attr('alt');
    const streamerId = cheerio.load(clip).root().find('.clip-title .streamer').text();
    const clipLink = cheerio.load(clip).root().find('.clip-title .clip-launch').attr('href');
    const thumbnailUrl = cheerio.load(clip).root().find('.img-container .clips-thumbnail').attr('src');
    description += `${page}. ${streamerId} [${title}](https://tgd.kr${clipLink})`;
    // description += `${page}. ${streamerId} ${title}`;
    description += '\n';
    embedMessage = new Discord.MessageEmbed()
      .setColor('#d22ef1')
      .setImage(thumbnailUrl)
      .setDescription(description);
  }

  return msg.reply(embedMessage);
}

export {
  execute, commands,
};
