import * as Discord from 'discord.js';
import moment from 'moment';
import * as TwitchAPIService from '../services/TwitchAPIService';
import * as CONSTANT from '../../config/constants';
import 'moment-timezone';
import _ from 'lodash';

const BOT_COMMAND_PREFIX = '-';

moment.tz.setDefault('Asia/Seoul');
const commands = ['인기', '실시간'];

async function execute({ msg, client, actionMessage }) {
  const userId = actionMessage || CONSTANT.DEFAULT_USERID;

  let page = 0;
  if (_.isNumber(+actionMessage) && !_.isEmpty(actionMessage)) {
    page = +actionMessage - 1;
  }

  if (page > 2) page = 2;
  const limit = 10;
  const skip = page * limit;

  const body: any = await TwitchAPIService.getPopularStreams();
  const { streams } = body.data;
  const { edges: liveStreams } = streams;

  if (actionMessage === '') {
    const embedMessage = new Discord.MessageEmbed();

    const streamData = liveStreams.splice(0, 30).map((stream, index) => {
      const { previewImageURL, title, id, viewersCount, broadcaster, game } = stream.node;
      const contentMaxLength = 24;
      let datumMessage = '';
      const streamTitle = `${
        title.length <= contentMaxLength + 2 ? title : title.substr(0, contentMaxLength).concat('..')
      }`;
      datumMessage += `${index + 1}. \`${broadcaster.displayName}(${
        broadcaster.login
      }) (${viewersCount.toLocaleString()})\``;
      // datumMessage += ` **[${streamTitle}](https://twitch.tv/${broadcaster.login})**`;
      datumMessage += ` **${streamTitle}**`;
      datumMessage += '\n';
      return datumMessage;
    });
    const description = streamData.join('');
    // description += `\n[${moment().format('YYYY/MM/DD HH:mm:ss')}] **상세정보 보기: __\`${BOT_COMMAND_PREFIX}인기 [순위 페이지숫자]\`__  (예:${BOT_COMMAND_PREFIX}인기 2)**`;
    embedMessage.setTitle('한국 트위치 실시간 시청자 순위입니다.');
    embedMessage.setDescription(description);

    msg.reply(embedMessage);
  } else {
    const embedMessage = new Discord.MessageEmbed()
      .setColor('#51ace8')
      .setTitle(`트위치 실시간 시청자수 TOP ${skip + 1}~${(page + 1) * limit}`);
    // .setImage(data.offline_image_url)
    // .setDescription(`views : ${data.view_count.toLocaleString()}\n${data.description}`)
    // .setThumbnail(data.profile_image_url);
    let description = '';
    liveStreams.splice(skip, limit).forEach((stream, index) => {
      const { previewImageURL, title, id, viewersCount, broadcaster, game } = stream.node;
      const { displayName = '' } = game || {};
      // embedMessage.addField(
      //     `${index + 1 + (skip)}. ${broadcaster.displayName} (${viewersCount.toLocaleString()})`,
      //     [
      //         `\`${displayName}\` [${title}](https://twitch.tv/${broadcaster.login})`,
      //         `[__미리보기__](${previewImageURL})`
      //     ].join('\n')),
      //     true

      description += `${index + 1 + skip}. \`${broadcaster.displayName} (${viewersCount.toLocaleString()})\``;
      description += '\n';
      description += `__**[${displayName}]**__ [${title}](https://twitch.tv/${broadcaster.login})`;
      description += '\n\n';
    });

    description += `집계일시 : ${moment().format(
      'YYYY-MM-DD HH:mm:ss'
    )}\n[**[__더보기__]**](https://www.twitch.tv/directory/all?sort=VIEWER_COUNT)`;
    embedMessage.setDescription(description);
    msg.reply(embedMessage);
  }
}

export { execute, commands };
