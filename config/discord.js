import * as path from 'path';
import * as Discord from 'discord.js';
import * as COMMAND from '../api/commands/index.js';
// eslint-disable-next-line import/extensions
import * as StreamService from '../api/services/StreamService.js';
import moment from 'moment';

const {
  DS_USER_ACCESS_TOKEN,
  DISCORD_TOKEN,
  ENV,
} = process.env;
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
function listen() {
  global.isPauseListening = false;
  const pausedAt = 0;
  const TRASH_CHANNEL_ID = '750320503339876475';
  return new Promise((resolve, reject) => {
    client.on('ready', () => {
      console.log('discord client on ready');
      client.channels
        .fetch(TRASH_CHANNEL_ID)
        .then((channel) => channel.send(`봇on!${new Date().toLocaleDateString()}${new Date().toLocaleTimeString()}`));

      client.user.setPresence({
        activity: {
          name: `${BOT_COMMAND_PREFIX}명령`,
          type: 'PLAYING',
        },
      });

      resolve(client);
      StreamService.setClient(client);
    });

    client.on('message', async (msg) => {
      const {
        channel, author, content, createdTimestamp,
      } = msg;
      const { name: channelName, guild: { name: guildName } } = channel;

      const { username } = author;
      console.log(`[${guildName}-#${channelName}]${username}[${new Date(createdTimestamp).toLocaleString()}] : ${content}`);
      if (msg.content === 'ping') {
        msg.reply('pong');
      }

      if (msg.content.indexOf('바테') >= 0) {
        const [, limit = 10] = msg.content.split(' ');
        const BOUND_GENERAL_CHANNEL_ID = '259295776063225866';
        let testMessage;
        // eslint-disable-next-line no-restricted-globals
        if (isNaN(limit)) {
          testMessage = limit;
          const messageForSend = ('atlas has scheduled additional shard for performance optimization.');
          client.channels.fetch(BOUND_GENERAL_CHANNEL_ID)
            .then((channel) => {
              console.log('sent');
              return channel.send(messageForSend);
            })
            .then((r) => {
              console.log(r);
            });
        }

        client.channels
          .fetch(BOUND_GENERAL_CHANNEL_ID)
          .then((channel) => channel.messages.fetch({ limit }))
          .then((messages) => {
            console.log(messages);
            console.log(`Received ${messages.size} messages`);
            messages.forEach((message) => {
              const { author, content, createdTimestamp } = message;
              const { username } = author;
              console.log(`${username}[${new Date(createdTimestamp).toLocaleString()}] : ${content}`);
            });
          });
      }

      if (msg.content === 'pause-listen') {
        if (ENV === 'HEROKU') {
          global.isPauseListening = !global.isPauseListening;
          if (!global.listenPausedAt) global.listenPausedAt = new Date();
          msg.reply(`pause:${global.isPauseListening} \`last paused at : ${moment(global.listenPausedAt).format('YYYY-MM-DD HH:mm:ss')}\``);
          global.listenPausedAt = new Date();
        }
      }

      if (ENV === 'HEROKU' && global.isPauseListening) return;
      if (msg.content.indexOf('-') !== 0) return;
      const splittedMessage = msg.content.split(' ');
      const command = splittedMessage.splice(0, 1)
        .toString()
        .replace(BOT_COMMAND_PREFIX, '');
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
    client.login(DISCORD_TOKEN);
  });
}

export {
  listen, listenWithToken,
};
