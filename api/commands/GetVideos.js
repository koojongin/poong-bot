import * as Discord from 'discord.js';
import moment from 'moment';
import * as TwitchAPIService from '../services/TwitchAPIService.js';
import * as BotUtilService from '../services/BotUtilService.js';
import * as StreamUtilService from '../services/StreamUtilService.js';
import * as CONSTANT from '../../config/constants.js';

import 'moment-timezone';
import { getSearchedUserMessage } from '../services/TwitchUtilService.js';

moment.tz.setDefault('Asia/Seoul');

const commands = ['다시보기'];
async function sendReplayList(videoList, user, msg, opts) {
  const options = Object.assign(opts, {});
  const { userId } = options;
  const splicedData = videoList.slice(0, 5);
  const videoIds = splicedData.map((datum) => datum.id);
  const responses = await Promise.all(videoIds.map((videoId) => TwitchAPIService.getPreviewCardByVideo(videoId)));
  const shorteningData = splicedData.map((datum, index) => {
    const { data: previewData } = responses[index];
    const { video } = previewData;
    const { id, moments } = video;
    const { edges } = moments;
    const streamedTime = `${moment(datum.created_at).format('YY/MM/DD')} (${BotUtilService.numberToDayString(moment(datum.created_at).day())}) \`${moment(datum.created_at).format('HH시 mm분')}\``;
    const viewingCount = datum.view_count.toLocaleString();
    const innerVideos = edges.map((edge) => {
      const { node } = edge;
      const { durationMilliseconds: duration, description: chapterName } = node;
      const playtime = new Date(moment(duration)).toISOString().substr(11, 5);
      return `${chapterName}(\`${playtime}\`)`;
    });
    let streamContainerString = `**[${index + 1}. ${streamedTime}](${datum.url}) | views:${viewingCount} | ${datum.duration.replace('h', '시간').replace('m', '분').replace('s', '초')}**`;
    if (innerVideos.length > 0) {
      streamContainerString += `\n └ ${innerVideos.map((videoString, index) => `${index + 1}. ${videoString}`).join(' | ')}`;
    }
    return streamContainerString;
  });

  const embedMessage = new Discord.MessageEmbed()
    .setColor('#51ace8')
    .setTitle(`${user.display_name || userId} 최근 다시보기 목록`)
  // .setThumbnail(user.profile_image_url)
    .setDescription(shorteningData.join('\n\n'));
  return msg.reply(embedMessage);
}
async function sendReplayOne(video, user, msg, opts) {
  const options = Object.assign(opts, {});
  const { pageIndex = 0 } = options;
  const videoId = video.id;
  const { data: previewData } = await TwitchAPIService.getPreviewCardByVideo(videoId);
  const { video: videoPreview } = previewData;
  const { id, moments } = videoPreview;
  const { edges } = moments;
  const thumbnail = video.thumbnail_url.replace('%{width}', '1920').replace('%{height}', '1080');
  let description = `${video.description}
                    조회수: ${video.view_count.toLocaleString()}
                    방송시간: ${moment(video.created_at).format('YYYY-MM-DD')} ${BotUtilService.numberToDayString(moment(video.created_at).day())}요일 \`${moment(video.created_at).format('HH:mm:ss')}\`
                    ${video.url}
                    
                    총 영상 길이 **${video.duration.replace('h', '시간').replace('m', '분').replace('s', '초')}**`;

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
    .setTitle(video.title)
    .setThumbnail(user.profile_image_url)
    .setDescription(description)
    .setFooter(`
                최근 다시보기중 ${(pageIndex + 1)}번째 영상입니다.
            `);
  return msg.reply(embedMessage);
}
async function execute({ msg, client, actionMessage }) {
  const [actionMessageOfUserId, selectedPage, ...actions] = actionMessage.split(' ');
  let userId = StreamUtilService.convertByNickname(actionMessageOfUserId) || CONSTANT.DEFAULT_USERID;
  let user;
  try {
    if (!parseInt(userId)) {
      const response = await TwitchAPIService.getUserInformation({ userId });
      const [data] = response.body.data;
      user = data;
      userId = data.id;
    }
  } catch (error) {
    if (error?.response?.statusCode !== 400) return msg.reply(error.message);
    const { savedUserId, description: embedMessage } = await getSearchedUserMessage(userId);
    msg.reply(embedMessage);
    return execute({ msg, client, actionMessage: [savedUserId, selectedPage, ...actions].join(' ') });
  }
  const response = await TwitchAPIService.getVideos({ userId });
  const { data: videoList } = response.body;
  const pageIndex = selectedPage ? +selectedPage - 1 : 0;
  const video = videoList[pageIndex];
  if (!video) return msg.reply(`${user.display_name || userId}님의 다시보기가 없습니다.`);
  if (!selectedPage) return sendReplayList(videoList, user, msg, { userId });
  return sendReplayOne(video, user, msg, { pageIndex });
}

export {
  execute, commands,
};
