import * as path from 'path';
import * as Discord from 'discord.js';
import moment from 'moment';
import * as TwitchAPIService from '../services/TwitchAPIService.js';
import * as CONSTANT from '../../config/constants.js';
import 'moment-timezone';
import 'moment-duration-format';
import * as StreamUtilService from '../services/StreamUtilService.js';
import { getStreamByUser } from '../services/DiscordService.js';

moment.tz.setDefault('Asia/Seoul');

const commands = ['방송'];

async function execute({ msg, client, actionMessage }) {
  const embedMessage = await getStreamByUser({ userIdOrNicknameShotcut: actionMessage });
  msg.reply(embedMessage);
  return true;
}

export {
  execute, commands,
};
