import * as StreamUtilService from './StreamUtilService';
import * as TwitchAPIService from './TwitchAPIService';
import * as CONSTANT from '../../config/constants';
import * as Discord from 'discord.js';
import moment from 'moment/moment';

async function getStreamByUser({ userIdOrNicknameShotcut }) {
  const userId = StreamUtilService.convertByNickname(userIdOrNicknameShotcut) || CONSTANT.DEFAULT_USERID;
  const responseForStream: any = await TwitchAPIService.getStreamInformation({ userId });
  const [data] = responseForStream.body.data;
  if (!data) {
    return { embedMessage: `${userId}님은 현재 방송 중이 아닙니다.`, isLive: false };
  }

  const {
    game_id: gameId,
    started_at: streamStartedAt,
    viewer_count: streamViewerCount,
    title: streamTitle,
    user_login: streamUserLoginId,
    user_name: streamUserName,
    game_name: streamGameName,
    user_id: streamUserId,
    thumbnail_url: videoThumbnailUrl,
  } = data;
  const { body } = await TwitchAPIService.getGames({ gameId });
  const { data: gameData }: any = body;
  const [gameDatum] = gameData;
  const { box_art_url = '' } = gameDatum;
  const boxArtUrl = box_art_url.replace('{width}', 285).replace('{height}', 380);

  let description = `**${streamUserName}** - [${streamTitle}](https://twitch.tv/${streamUserLoginId})
                **\`${streamGameName}\`** __${streamViewerCount.toLocaleString()}__명이 시청중
                방송 시작 \`${moment(streamStartedAt).format('YYYY-MM-DD HH:mm:ss')}\`
                \n__**${new Date(moment().diff(streamStartedAt)).toISOString().substr(11, 8)} 동안 스트리밍 중**__`;

  const { body: bodyForVideoResponse } = await TwitchAPIService.getVideos({ userId: streamUserId });
  const { data: dataForVideo }: any = bodyForVideoResponse || {};
  if (dataForVideo && dataForVideo.length > 0) {
    const [datum, ...restData] = dataForVideo;
    const videoId = datum.id;
    const { data: previewData }: any = await TwitchAPIService.getPreviewCardByVideo(videoId);
    const { video } = previewData;
    const { id, moments } = video;
    const { edges } = moments;

    edges.forEach((edge, index) => {
      const { node } = edge;
      const {
        positionMilliseconds,
        durationMilliseconds: duration,
        type,
        description: chapterName,
        details,
        video,
      } = node;
      let playtime = new Date(moment(duration).toDate()).toISOString().substr(11, 8);
      let onAirMessage = '';
      if (duration === 0) {
        onAirMessage = ':arrow_forward:';
        // video.lengthSeconds*1000 - positionMilliseconds
        // playtime = moment().toDate().toISOString().substr(11, 8);
        const duration = moment.duration(video.lengthSeconds * 1000 - positionMilliseconds).as('milliseconds');
        playtime = moment(duration).format('hh:mm:ss');
      }
      description += `\n${duration === 0 ? `${onAirMessage} ` : ''}${index + 1}. ${chapterName} \`${playtime}${
        onAirMessage ? ' ~ now' : ''
      }\``;
    });
  }
  const embedMessage = new Discord.MessageEmbed()
    .setColor('#51ace8')
    .setImage(`${videoThumbnailUrl.replace('{width}', '1920').replace('{height}', '1080')}?v=${new Date().getTime()}`)
    .setThumbnail(boxArtUrl)
    .setDescription(description);
  return { embedMessage, isLive: true };
}

export { getStreamByUser };
