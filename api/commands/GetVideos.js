import * as Discord from 'discord.js';
import moment from 'moment';
import * as TwitchAPIService from '../services/TwitchAPIService.js';
import * as BotUtilService from '../services/BotUtilService.js';
import * as StreamUtilService from '../services/StreamUtilService.js';
import * as CONSTANT from '../../config/constants.js';

import 'moment-timezone';

moment.tz.setDefault('Asia/Seoul');

const commands = ['다시보기'];

async function execute({ msg, client, actionMessage }) {
  const [actionMessageOfUserId, page, ...actions] = actionMessage.split(' ');
  let userId = StreamUtilService.convertByNickname(actionMessageOfUserId) || CONSTANT.DEFAULT_USERID;

  let user;
  if (!parseInt(userId)) {
    const response = await TwitchAPIService.getUserInformation({ userId });
    const [data] = response.body.data;
    user = data;
    userId = data.id;
  }
  const response = await TwitchAPIService.getVideos({ userId });
  const { data } = response.body;
  // const datum = data[parseInt(Math.random() * data.length)];
  const pageIndex = page ? +page - 1 : 0;
  const datum = data[pageIndex];
  const videoId = datum.id;
  if (!datum) return msg.reply(`${user.display_name || userId}님의 다시보기가 없습니다.`);

  const { data: previewData } = await TwitchAPIService.getPreviewCardByVideo(videoId);
  const { video } = previewData;
  const { id, moments } = video;
  const { edges } = moments;
  const thumbnail = datum.thumbnail_url.replace('%{width}', '1920').replace('%{height}', '1080');
  let description = `${datum.description}
                    조회수: ${datum.view_count.toLocaleString()}
                    방송시간: ${moment(datum.created_at).format('YYYY-MM-DD')} ${BotUtilService.numberToDayString(moment(datum.created_at).day())}요일 \`${moment(datum.created_at).format('HH:mm:ss')}\`
                    ${datum.url}
                    
                    총 영상 길이 **${datum.duration.replace('h', '시간').replace('m', '분').replace('s', '초')}**`;

  edges.forEach((edge, index) => {
    const { node } = edge;
    const {
      durationMilliseconds: duration, type, description: chapterName, details, video,
    } = node;
    const playtime = new Date(moment(duration)).toISOString().substr(11, 8);
    description += `\n${index + 1}. ${chapterName} \`${playtime}\``;
  });
  const embedMessage = new Discord.MessageEmbed()
    .setColor('#51ace8')
    .setImage(thumbnail)
    .setTitle(datum.title)
    .setThumbnail(user.profile_image_url)
    .setDescription(description)
    .setFooter(`
                최근 다시보기중 ${(pageIndex + 1)}번째 영상입니다.
            `);
  return msg.reply(embedMessage);
}

export {
  execute, commands,
};
