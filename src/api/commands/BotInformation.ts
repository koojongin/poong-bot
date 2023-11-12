import { Client, EmbedBuilder, Message } from 'discord.js';
import moment from 'moment';
import 'moment-timezone';
import _ from 'lodash';

moment.tz.setDefault('Asia/Seoul');

const commands = ['서버'];

async function execute({ msg, client, actionMessage }: { msg: Message; client: Client; actionMessage }) {
  const guildsCache = client.guilds.cache;
  const guilds = _.sortBy(guildsCache.toJSON(), 'joinedTimestamp');

  const embedMessage = new EmbedBuilder();
  const description = '';
  const parsedData = guilds.map((guild, index) => {
    const { name, id, joinedTimestamp, memberCount } = guild;
    return `${index + 1}. ${name} (${memberCount.toLocaleString()}명) \`${moment(joinedTimestamp).toLocaleString()}\``;
  });
  // const usingMembers = guilds.map((guild) => guild.memberCount).reduce((current, next) => current + next);
  // description = `${guilds.length.toLocaleString()}개의 서버에서 ${usingMembers.toLocaleString()}명의 사용자가 사용중입니다.`;
  // embedMessage.setDescription(description);
  // const test = await client.channels.fetch(client.guilds.cache.toJSON()[1].publicUpdatesChannelID);
  embedMessage.setDescription(parsedData.join('\n'));
  msg.reply({ embeds: [embedMessage] });
}

export { execute, commands };
