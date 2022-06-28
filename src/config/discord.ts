import * as Discord from 'discord.js';
import { TextChannel } from 'discord.js';
import * as COMMAND from '../api/commands';
import moment from 'moment';
import { User } from '../api/models/User';
import { setClient } from '../api/services/StreamService';
import { isPauseListening, setPauseListening } from './config';
const client = new Discord.Client();
const BOT_COMMAND_PREFIX = '-';

function listenWithToken(token) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-underscore-dangle
    const _client = new Discord.Client();
    _client.on('ready', () => resolve(_client));
    _client.login(token);
  });
}
async function listen() {
  let listenPausedAt;

  const TRASH_CHANNEL_ID = '750320503339876475';
  const resolved = new Promise((resolve) => {
    client.on('ready', () => {
      console.log('discord client on ready');
      const botNotificationChannel: TextChannel = client.channels.cache.get(TRASH_CHANNEL_ID) as TextChannel;
      botNotificationChannel.send(`봇on!${new Date().toLocaleDateString()}${new Date().toLocaleTimeString()}`);

      client.user.setPresence({
        activity: {
          name: `${BOT_COMMAND_PREFIX}명령`,
          type: 'PLAYING',
        },
      });

      resolve(client);
      setClient(client);
    });
  });

  client.on('message', async (msg) => {
    const { channel, author, content, createdTimestamp } = msg;
    const {
      name: channelName,
      guild: { name: guildName },
    } = channel as TextChannel;
    const { username } = author;
    console.log(
      `[${guildName}-#${channelName}]${username}[${new Date(createdTimestamp).toLocaleString()}] : ${content}`
    );
    if (msg.content === 'ping') {
      msg.reply('pong');
    }

    if (msg.content === 'test') {
      const user = await User.findOne({});
      console.log(user);
    }

    if (msg.content === 'pause-listen') {
      if (process.env.ENV === 'HEROKU') {
        setPauseListening(!isPauseListening);
        if (!listenPausedAt) listenPausedAt = new Date();
        msg.reply(
          `pause:${isPauseListening} \`last paused at : ${moment(listenPausedAt).format('YYYY-MM-DD HH:mm:ss')}\``
        );
        listenPausedAt = new Date();
      }
    }

    if (process.env.ENV === 'HEROKU' && isPauseListening) return;
    if (msg.content.indexOf('-') !== 0) return;
    const splittedMessage = msg.content.split(' ');
    const command = splittedMessage.splice(0, 1).toString().replace(BOT_COMMAND_PREFIX, '');
    const actionMessage = splittedMessage.join(' ');
    const commandInstance = await COMMAND.mapping(command);
    if (commandInstance) {
      try {
        await commandInstance.execute({
          msg,
          client,
          actionMessage,
        });
      } catch (error) {
        console.error(error);
        await msg.reply((error && error.message) || '기대되지않은 에러입니다. 관리자에게 문의하세요');
        throw error;
      }
    }
  });
  await client.login(process.env.DISCORD_TOKEN);
  return resolved;
}

export { listen, listenWithToken };
