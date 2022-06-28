import * as Discord from 'discord.js';
import moment from 'moment';
import * as TwitchAPIService from '../services/TwitchAPIService';
import * as CONSTANT from '../../config/constants';
import * as StreamUtilService from '../services/StreamUtilService';
import 'moment-timezone';
import _ from 'lodash';
import { getSearchedUserMessage } from '../services/TwitchUtilService';

moment.tz.setDefault('Asia/Seoul');
const commands = ['클립'];

async function getUserClipMessage(userId, page = 0) {
  const pageNumber = _.isNumber(+page) ? +page : 1;
  let user;
  let userDataId;
  if (!parseInt(userId)) {
    const response: any = await TwitchAPIService.getUserInformation({ userId });
    const [data] = response.body.data;
    user = data;
    userDataId = data.id;
  }
  const responseForClips = await TwitchAPIService.getClips({ userId: userDataId, first: 100 });
  const { data }: any = responseForClips.body;
  const selectedIndex = pageNumber ? pageNumber - 1 : parseInt(String(Math.random() * data.length));
  const datum = data[selectedIndex];
  if (!datum) return null;
  const embedMessage = new Discord.MessageEmbed()
    .setColor('#51ace8')
    .setImage(datum.thumbnail_url)
    .setTitle(`${selectedIndex + 1}. ${datum.title}`)
    .setThumbnail(user.profile_image_url).setDescription(`
                    클립제작:\`${datum.creator_name}\` / 조회수:${datum.view_count.toLocaleString()}
                    \n${datum.url}
                `).setFooter(`
                    클립생성일 ${moment(datum.created_at).format('YYYY-MM-DD HH:mm:ss')}
                `);
  return { user, embedMessage };
}
async function execute({ msg, client, actionMessage }) {
  const [actionUserId, page = 0, ...actions] = actionMessage.split(' ');
  const userId = StreamUtilService.convertByNickname(actionUserId) || CONSTANT.DEFAULT_USERID;
  try {
    const { user, embedMessage } = await getUserClipMessage(userId, page);
    if (!embedMessage) msg.reply(`${user.display_name || userId}님의 클립이 없습니다.`);
    return msg.reply(embedMessage);
  } catch (error) {
    if (error?.response?.statusCode !== 400) return msg.reply(error.message);
    const { savedUserId, description: embedMessage } = await getSearchedUserMessage(actionUserId || userId);
    return execute({ msg, client, actionMessage: `${[savedUserId, page, ...actions].join(' ')}` });
  }
}

export { execute, commands };
