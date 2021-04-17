import Discord from 'discord.js';
import moment from 'moment';
import 'moment-timezone';

moment.tz.setDefault('Asia/Seoul');

const commands = ['서버'];

async function execute({ msg, client, actionMessage }) {
  const guildsCache = client.guilds.cache;
  const guilds = guildsCache.toJSON();

  const embedMessage = new Discord.MessageEmbed();
  let description = '';
  const parsedData = guilds.map((guild, index) => {
    const { name, id, joinedTimestamp } = guild;
    return `${(index + 1)}. ${name} [${moment(joinedTimestamp).toLocaleString()}]`;
  });
  description = `${parsedData.join('\n')}`;
  embedMessage.setDescription(description);
  msg.reply(embedMessage);
}

export {
  execute, commands,
};
