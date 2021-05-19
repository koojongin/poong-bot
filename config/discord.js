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

function listen() {
  let isPauseListening = false;
  let pausedAt = 0;
  return new Promise((resolve, reject) => {
    client.on('ready', () => {
      console.log('discord client on ready');
      const TRASH_CHANNEL_ID = '750320503339876475';
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
      if (msg.content === 'ping') {
        msg.reply('pong');
      }

      if (msg.content === 'pause-listen') {
        if (ENV === 'HEROKU') {
          isPauseListening = !isPauseListening;
          pausedAt = new Date();
          msg.reply(`puase:${isPauseListening} \`${moment(pausedAt).format('YYYY-MM-DD HH:mm:ss')}\``);
        }
      }

      if (ENV === 'HEROKU' && isPauseListening) return;
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
  listen,
};
