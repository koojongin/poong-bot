import * as Discord from 'discord.js';
import moment from 'moment';
import * as TwitchAPIService from '../services/TwitchAPIService.js';
import * as CONSTANT from '../../config/constants.js';
import * as StreamUtilService from '../services/StreamUtilService.js';
import 'moment-timezone';
import got from 'got';
import cheerio from 'cheerio';
import _ from 'lodash';
import https from 'https';

moment.tz.setDefault('Asia/Seoul');
const commands = ['핫클립'];

async function test() {
  const options = {
    host: 'tgd.kr',
    path: '/clips/lists/2',
    port: '9999',
    // localAddress: '118.103.202.102', // IP address network interface
    localAddress: '119.28.155.202', // IP address network interface
  };
  return new Promise((resolve, reject) => {
    let data = '';
    const req = https.request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (body) => {
        data += body;
      });
      res.on('end', () => {
        resolve(data);
      });
    });
    req.on('error', (e) => {
      reject(e);
    });

    req.write(
      '{"text": "test string"}',
    );
    req.end();
  });
}

function getClipData(clip) {
  const title = cheerio.load(clip).root().find('.img-container .clips-thumbnail').attr('alt');
  const streamerId = cheerio.load(clip).root().find('.clip-title .streamer').text();
  const clipLink = cheerio.load(clip).root().find('.clip-title .clip-launch').attr('href');
  const thumbnailUrl = cheerio.load(clip).root().find('.img-container .clips-thumbnail').attr('src');
  const ago = cheerio.load(clip).root().find('.ago').text();
  return {
    title, streamerId, clipLink, thumbnailUrl, ago,
  };
}

async function execute({ msg, client, actionMessage }) {
  const res = await test();
  const clipsElements = cheerio.load(res).root().find('.clips').toArray();
  const data = getClipData(clipsElements[0]);
  msg.reply(data.title);
  // let page = 1;
  // if (_.isNumber(+actionMessage) && !_.isEmpty(actionMessage)) {
  //   page = (+actionMessage);
  // }
  // let clipsElements;
  // // eslint-disable-next-line no-useless-catch
  // try {
  //   const [res, res2] = await Promise.all([
  //     got.get('clips', { prefixUrl: 'https://tgd.kr' }),
  //     got.get('clips/lists/2', { prefixUrl: 'https://tgd.kr' }),
  //   ]);
  //
  //   const clipsElements1 = cheerio.load(res.body).root().find('.clips').toArray();
  //   const clipsElements2 = cheerio.load(res2.body).root().find('.clips').toArray();
  //   clipsElements = [...clipsElements1, ...clipsElements2];
  // } catch (error) {
  //   throw error;
  // }
  //
  // let description = '';
  // let embedMessage;
  // if (actionMessage === '') {
  //   description += '```';
  //   clipsElements.forEach((clip, index) => {
  //     const {
  //       title, streamerId, clipLink, thumbnailUrl,
  //     } = getClipData(clip);
  //     // description += `${index + 1}. ${streamerId} [${title}](https://tgd.kr${clipLink})`;
  //     description += `${index + 1}. ${streamerId} - ${title}`;
  //     description += '\n';
  //   });
  //   description += '```';
  //   embedMessage = new Discord.MessageEmbed()
  //     .setTitle('일일 핫클립')
  //     .setColor('#d22ef1')
  //     .setDescription(description);
  // } else {
  //   const clip = clipsElements[(page - 1)];
  //   if (!clip) throw new Error('해당 클립이 없습니다.');
  //   const {
  //     title, streamerId, clipLink, thumbnailUrl,
  //   } = getClipData(clip);
  //   description += `${page}. ${streamerId} [${title}](https://tgd.kr${clipLink})`;
  //   // description += `${page}. ${streamerId} ${title}`;
  //   description += '\n';
  //   embedMessage = new Discord.MessageEmbed()
  //     .setColor('#d22ef1')
  //     .setImage(thumbnailUrl)
  //     .setDescription(description);
  // }
  //
  // return msg.reply(embedMessage);
}

export {
  execute, commands,
};
