import { Message, EmbedBuilder } from 'discord.js';
import moment from 'moment';
import * as TwitchAPIService from '../services/TwitchAPIService';
import * as BotUtilService from '../services/BotUtilService';
import * as StreamUtilService from '../services/StreamUtilService';
import * as CONSTANT from '../../config/constants';

import 'moment-timezone';
import { getSearchedUserMessage } from '../services/TwitchUtilService';

moment.tz.setDefault('Asia/Seoul');
const result = {};
const commands = ['다시보기'];

async function sendReplayList(videoList, user, msg: Message, opts) {
  const options = Object.assign(opts, {});
  const { userId } = options;
  const splicedData = videoList.slice(0, 5);
  const videoIds = splicedData.map((datum) => datum.id);
  const responses = await Promise.all(videoIds.map((videoId) => TwitchAPIService.getPreviewCardByVideo(videoId)));
  const shorteningData = splicedData.map((datum, index) => {
    const { data: previewData }: any = responses[index];
    const { video } = previewData;
    const { id, moments } = video;
    const { edges } = moments;
    const streamedTime = `${moment(datum.created_at).format('YY/MM/DD')} (${BotUtilService.numberToDayString(
      moment(datum.created_at).day()
    )}) \`${moment(datum.created_at).format('HH시 mm분')}\``;
    const viewingCount = datum.view_count.toLocaleString();
    const innerVideos = edges.map((edge) => {
      const { node } = edge;
      const { durationMilliseconds: duration, description: chapterName } = node;
      const playtime = moment.utc(duration).format('HH:mm:ss');
      return `${chapterName}(\`${playtime}\`)`;
    });
    let streamContainerString = `**[${index + 1}. ${streamedTime}](${
      datum.url
    }) | views:${viewingCount} | ${datum.duration.replace('h', '시간').replace('m', '분').replace('s', '초')}**`;
    if (innerVideos.length > 0) {
      streamContainerString += `\n └ ${innerVideos
        .map((videoString, index) => `${index + 1}. ${videoString}`)
        .join(' | ')}`;
    }
    return streamContainerString;
  });

  const embedMessage = new EmbedBuilder()
    .setColor('#51ace8')
    .setTitle(`${user.display_name || userId} 최근 다시보기 목록`)
    // .setThumbnail(user.profile_image_url)
    .setDescription(shorteningData.join('\n\n'));

  const selectMenus = splicedData.map((datum) => {
    const { title, created_at, url, view_count, duration } = datum;
    return {
      label: `${title}(${moment(created_at).format('YY/MM/DD HH:mm:ss')})`,
      description: `${duration} (${view_count.toLocaleString()}views)`,
      value: url,
    };
  });
  // const row = new MessageActionRow<ModalActionRowComponent>().addComponents(
  //   new MessageSelectMenu().setCustomId('select').setPlaceholder('Nothing selected').addOptions(selectMenus)
  // );

  // const now = new Date().getTime();
  // result[now] = await Promise.all(
  //   videoList.map((video) => {
  //     return getReplayOne(video, user, opts);
  //   })
  // );

  return msg.reply({ embeds: [embedMessage] });
}

async function getReplayOne(video, user, opts) {
  const options = Object.assign(opts, {});
  const { pageIndex = 0 } = options;
  const videoId = video.id;
  const { data: previewData }: any = await TwitchAPIService.getPreviewCardByVideo(videoId);
  const { video: videoPreview } = previewData;
  const { id, moments } = videoPreview;
  const { edges } = moments;
  const thumbnail = video.thumbnail_url.replace('%{width}', '1920').replace('%{height}', '1080');
  let description = `${video.description}
                    조회수: ${video.view_count.toLocaleString()}
                    방송시간: ${moment(video.created_at).format('YYYY-MM-DD')} ${BotUtilService.numberToDayString(
    moment(video.created_at).day()
  )}요일 \`${moment(video.created_at).format('HH:mm:ss')}\`
                    ${video.url}
                    
                    총 영상 길이 **${video.duration.replace('h', '시간').replace('m', '분').replace('s', '초')}**`;

  edges.forEach((edge, index) => {
    const { node } = edge;
    const { durationMilliseconds: duration, type, description: chapterName, details, video }: any = node;
    const playtime = moment.utc(duration).format('HH:mm:ss');
    description += `\n${index + 1}. ${chapterName} \`${playtime}\``;
  });
  const embedMessage = new EmbedBuilder()
    .setColor('#51ace8')
    .setImage(thumbnail)
    .setTitle(video.title)
    .setThumbnail(user.profile_image_url)
    .setDescription(description)
    .setFooter({
      text: `
                최근 다시보기중 ${pageIndex + 1}번째 영상입니다.
            `,
    });
  return { embedMessage };
}

async function execute({ msg, client, actionMessage }) {
  const [actionMessageOfUserId, selectedPage, ...actions] = actionMessage.split(' ');
  let userId = StreamUtilService.convertByNickname(actionMessageOfUserId) || CONSTANT.DEFAULT_USERID;
  let user;
  try {
    if (!parseInt(userId)) {
      const response: any = await TwitchAPIService.getUserInformation({ userId });
      const [data] = response.body.data;
      user = data;
      userId = data.id;
    }
  } catch (error) {
    if (error?.response?.statusCode !== 400) return msg.reply(error.message);
    const { savedUserId, description: embedMessage } = await getSearchedUserMessage(userId);
    msg.reply({ embeds: [embedMessage] });
    return execute({ msg, client, actionMessage: [savedUserId, selectedPage, ...actions].join(' ') });
  }
  const response = await TwitchAPIService.getVideos({ userId });
  const { data: videoList }: any = response.body;
  const pageIndex = selectedPage ? +selectedPage - 1 : 0;
  const video = videoList[pageIndex];
  if (!video) return msg.reply(`${user.display_name || userId}님의 다시보기가 없습니다.`);
  if (!selectedPage) return sendReplayList(videoList, user, msg, { userId });
  const { embedMessage } = await getReplayOne(video, user, { pageIndex });
  return msg.reply({ embeds: [embedMessage] });
}

export { execute, commands };
