import moment from 'moment';
import 'moment-timezone';
import 'moment-duration-format';
import { getStreamByUser } from '../services/DiscordService';
import * as UserInformationCommand from './UserInformation';
import { getSearchedUserMessage } from '../services/TwitchUtilService';
import { MessageEmbed } from 'discord.js';

moment.tz.setDefault('Asia/Seoul');

const commands = ['방송'];

// eslint-disable-next-line consistent-return
async function execute({ msg, client, actionMessage }) {
  // eslint-disable-next-line prefer-const
  let [actionUserId, page, ...actions] = actionMessage.split(' ');
  page = page || 1;
  page = parseInt(page);
  let embedMessage;
  let savedUserId;
  let isLive = false;
  try {
    const { embedMessage: em, isLive: _isLive } = await getStreamByUser({ userIdOrNicknameShotcut: actionUserId });
    isLive = _isLive;
    embedMessage = em;
  } catch (error) {
    console.log(error);
    if (error.response?.statusCode !== 400) {
      embedMessage = error.message;
    } else {
      const { savedUserId: _savedUserId, description, isLive: _isLive } = await getSearchedUserMessage(actionUserId);
      embedMessage = description;
      isLive = _isLive;
      savedUserId = _savedUserId;
    }
  }

  if (embedMessage instanceof MessageEmbed) {
    await msg.reply({ embeds: [embedMessage] });
  } else {
    await msg.reply(embedMessage);
  }
  if (savedUserId && isLive) {
    return execute({ msg, client, actionMessage: savedUserId });
  }
  if (!isLive) await UserInformationCommand.execute({ msg, client, actionMessage: savedUserId || actionUserId });
}

export { execute, commands };
