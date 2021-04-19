import * as Discord from 'discord.js';
import moment from 'moment';
import * as TwitchAPIService from '../services/TwitchAPIService.js';
import * as CONSTANT from '../../config/constants.js';
import * as StreamUtilService from '../services/StreamUtilService.js';
import 'moment-timezone';

moment.tz.setDefault('Asia/Seoul');
const commands = ['트게더'];

async function execute({ msg, client, actionMessage }) {
  let userId = StreamUtilService.convertByNickname(actionMessage) || CONSTANT.DEFAULT_USERID;

  let user; let userLoginId;
  if (!parseInt(userId)) {
    const response = await TwitchAPIService.getUserInformation({ userId });
    const [data] = response.body.data;
    user = data;
    userId = data.id;
    userLoginId = data.login;
  }

  const embedMessage = `https://tgd.kr/s/${userLoginId}`;
  return msg.reply(embedMessage);
}

export {
  execute, commands,
};
