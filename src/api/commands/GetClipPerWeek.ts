import * as Discord from 'discord.js';
import moment from 'moment';
import * as TwitchAPIService from '../services/TwitchAPIService';
import * as CONSTANT from '../../config/constants';
import * as StreamUtilService from '../services/StreamUtilService';
import 'moment-timezone';
import _ from 'lodash';

moment.tz.setDefault('Asia/Seoul');
const commands = ['클립주'];

async function execute({ msg, client, actionMessage }) {
  const [actionUserId, page, ...actions] = actionMessage.split(' ');
  let userId = StreamUtilService.convertByNickname(actionUserId) || CONSTANT.DEFAULT_USERID;

  const pageNumber = _.isNumber(+page) ? +page : 1;
  let user;
  if (!parseInt(userId)) {
    const response: any = await TwitchAPIService.getUserInformation({ userId });
    const [data] = response.body.data;
    user = data;
    userId = data.id;
  }
  const startedAt = moment().subtract(1, 'week');
  const endedAt = moment();
  const responseForClips = await TwitchAPIService.getClips({
    userId,
    first: 100,
    startedAt: startedAt.toDate().toISOString(),
    endedAt: endedAt.toDate().toISOString(),
  });
  const { data }: any = responseForClips.body;
  const selectedIndex = pageNumber ? pageNumber - 1 : parseInt(String(Math.random() * data.length));
  const datum = data[selectedIndex];
  if (!datum)
    return msg.reply(`${user.display_name || userId}님의 클립이 없습니다. 총 ${data.length.toLocaleString()}개의 클립`);
  const embedMessage = new Discord.MessageEmbed()
    .setColor('#51ace8')
    .setImage(datum.thumbnail_url)
    .setTitle(`[주간핫클립] ${selectedIndex + 1}. ${datum.title}`)
    .setThumbnail(user.profile_image_url).setFooter(`
                    클립생성일 ${moment(datum.created_at).format('YYYY-MM-DD HH:mm:ss')}
                `);

  let description = '';
  description += `클립제작:\`${datum.creator_name}\` / 조회수:${datum.view_count.toLocaleString()}`;
  description += '\n';
  description += `${datum.url}`;
  description += '\n\n';
  description += `**__검색기간__** \`${startedAt.format('YYYY-MM-DD HH:mm:ss')}\` ~ \`${endedAt.format(
    'YYYY-MM-DD HH:mm:ss'
  )}\``;
  embedMessage.setDescription(description);
  return msg.reply(embedMessage);
}

export { execute, commands };
