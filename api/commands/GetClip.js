import * as Discord from 'discord.js';
import moment from 'moment';
import * as TwitchAPIService from '../services/TwitchAPIService.js';
import * as CONSTANT from '../../config/constants.js';
import * as StreamUtilService from '../services/StreamUtilService.js';
import 'moment-timezone';
import _ from 'lodash';

moment.tz.setDefault('Asia/Seoul');
const commands = ['클립'];

async function execute({ msg, client, actionMessage }) {
  const [actionUserId, page, ...actions] = actionMessage.split(' ');
  let userId = StreamUtilService.convertByNickname(actionUserId) || CONSTANT.DEFAULT_USERID;

  const pageNumber = _.isNumber(+page) ? +page : 1;
  let user;
  if (!parseInt(userId)) {
    const response = await TwitchAPIService.getUserInformation({ userId });
    const [data] = response.body.data;
    user = data;
    userId = data.id;
  }
  const responseForClips = await TwitchAPIService.getClips({ userId, first: 100 });
  const { data } = responseForClips.body;
  const selectedIndex = pageNumber ? (pageNumber - 1) : parseInt(Math.random() * data.length);
  const datum = data[selectedIndex];
  if (!datum) return msg.reply(`${user.display_name || userId}님의 클립이 없습니다.`);
  const embedMessage = new Discord.MessageEmbed()
    .setColor('#51ace8')
    .setImage(datum.thumbnail_url)
    .setTitle(`${selectedIndex + 1}. ${datum.title}`)
    .setThumbnail(user.profile_image_url)
    .setDescription(`
                    클립제작:\`${datum.creator_name}\` / 조회수:${datum.view_count.toLocaleString()}
                    \n${datum.url}
                `)
    .setFooter(`
                    클립생성일 ${moment(datum.created_at).format('YYYY-MM-DD HH:mm:ss')}
                `);
  return msg.reply(embedMessage);
}

export {
  execute, commands,
};
