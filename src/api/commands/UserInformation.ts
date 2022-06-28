import { MessageEmbed } from 'discord.js';
import _ from 'lodash';
import moment from 'moment';
import * as TwitchAPIService from '../services/TwitchAPIService';
import * as StreamUtilService from '../services/StreamUtilService';
import 'moment-timezone';
import { getSearchedUserMessage } from '../services/TwitchUtilService';

const commands = ['정보'];

async function getUserInfoMessage(userId) {
  const response: any = await TwitchAPIService.getUserInformation({ userId });
  const [data] = response.body.data;
  const {
    id,
    login: loginId,
    display_name,
    offline_image_url,
    created_at: userCreatedAt,
    profile_image_url,
    description: userDescription,
    view_count,
  } = data;
  const responseOfGetFollows = await TwitchAPIService.getFollows({ toId: id });
  const { total, data: followData, pagination }: any = responseOfGetFollows.body;
  const embedMessage = new MessageEmbed()
    .setColor('#51ace8')
    .setImage(offline_image_url)
    .setFooter(`방송개시일 : ${moment(userCreatedAt).format('YYYY-MM-DD HH:mm:ss')}`)
    .setThumbnail(profile_image_url);

  let description = '';
  description += `**${loginId} - \`${display_name}\` (${id})**`;
  description += '\n\n';
  if (!_.isEmpty(userDescription)) {
    description += `${userDescription}`;
    description += '\n';
  }
  description += `조회수 : ${view_count.toLocaleString()}`;
  description += '\n';
  description += `팔로워 : ${total.toLocaleString()}`;
  description += '\n';
  description += `__[영상](https://twitch.tv/${loginId}/videos)__`;
  description += ' ';
  description += `__[인기클립](https://twitch.tv/${loginId}/clips?filter=clips&range=7d)__`;
  embedMessage.setDescription(description);
  return embedMessage;
}

async function execute({ msg, client, actionMessage }) {
  const userId = StreamUtilService.convertByNickname(actionMessage);
  try {
    const embedMessage = await getUserInfoMessage(userId);
    return msg.reply(embedMessage);
  } catch (error) {
    if (error?.response?.statusCode !== 400) return msg.reply(error.message);
    const { savedUserId, description: embedMessage } = await getSearchedUserMessage(userId);
    msg.reply(embedMessage);
    return execute({ msg, client, actionMessage: savedUserId });
  }
}

export { execute, commands };
