import * as path from 'path';
import * as Discord from 'discord.js';
import _ from 'lodash';
import moment from 'moment';
import * as TwitchAPIService from '../services/TwitchAPIService.js';
import * as CONSTANT from '../../config/constants.js';
import * as StreamUtilService from '../services/StreamUtilService.js';
import 'moment-timezone';

const commands = ['정보'];

async function execute({ msg, client, actionMessage }) {
  const userId = StreamUtilService.convertByNickname(actionMessage) || CONSTANT.DEFAULT_USERID;
  const response = await TwitchAPIService.getUserInformation({ userId });
  const [data] = response.body.data;
  const {
    id, login: loginId, display_name, offline_image_url,
    created_at: userCreatedAt, profile_image_url,
    description: userDescription, view_count,
  } = data;
  const responseOfGetFollows = await TwitchAPIService.getFollows({ toId: id });
  const { total, data: followData, pagination } = responseOfGetFollows.body;
  const embedMessage = new Discord.MessageEmbed()
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
  msg.reply(embedMessage);
}

export {
  execute, commands,
};
