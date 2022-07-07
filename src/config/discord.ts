import {
  BaseCommandInteraction,
  Client,
  Intents,
  MessageActionRow,
  MessageComponentInteraction,
  MessageSelectMenu,
  Modal,
  ModalActionRowComponent,
  TextChannel,
  TextInputComponent,
} from 'discord.js';
import * as COMMAND from '../api/commands';
import moment from 'moment';
import { setClient } from '../api/services/StreamService';
import { isPauseListening, setPauseListening } from './config';
import { BOT_COMMAND_PREFIX, MY_SERVER_GUILD_ID } from './constants';
import create from 'got/dist/source/create';

function createClient() {
  return new Client({
    allowedMentions: {
      repliedUser: false,
    },
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_INVITES,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
  });
}

async function listen(token = process.env.DISCORD_TOKEN) {
  const client = createClient();
  let listenPausedAt;
  const TRASH_CHANNEL_ID = '750320503339876475';
  const resolved = new Promise((resolve) => {
    client.on('ready', () => {
      const { user } = client;
      const { username } = user;
      console.log('discord client on ready :::', username);

      const POONG_BOT_USERNAME = 'poong-bot';
      if (username !== POONG_BOT_USERNAME) {
        return resolve(client);
      }
      const botNotificationChannel: TextChannel = client.channels.cache.get(TRASH_CHANNEL_ID) as TextChannel;
      botNotificationChannel.send(`봇on!${new Date().toLocaleDateString()}${new Date().toLocaleTimeString()}`);
      client.user.setPresence({
        activities: [
          {
            name: `${BOT_COMMAND_PREFIX}명령`,
            type: 'PLAYING',
          },
        ],
      });

      resolve(client);
    });
  });

  client.on('interactionCreate', async (interaction) => {});
  client.on('messageCreate', async (msg) => {
    const { user: clientUser } = client;
    const { username: clientUserName, id: clientId } = clientUser;
    const KOO_BOT_CLIENT_ID = '741980844071190559';
    if (msg.guildId == MY_SERVER_GUILD_ID && (clientUserName == 'koo-bot' || clientId == KOO_BOT_CLIENT_ID)) {
      return;
    }
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
      await msg.reply('pong');
    }

    if (msg.content === 'pause-listen') {
      if (process.env.ENV === 'HEROKU') {
        setPauseListening(!isPauseListening());
        if (!listenPausedAt) listenPausedAt = new Date();
        msg.reply(
          `pause:${isPauseListening()} \`last paused at : ${moment(listenPausedAt).format('YYYY-MM-DD HH:mm:ss')}\``
        );
        listenPausedAt = new Date();
      }
    }

    if (process.env.ENV === 'HEROKU' && isPauseListening()) return;
    if (msg.content.indexOf('-') !== 0) return;
    const splittedMessage = msg.content.split(' ');
    const command = splittedMessage.splice(0, 1).toString().replace(BOT_COMMAND_PREFIX, '');
    const actionMessage = splittedMessage.join(' ');
    const commandInstance = await COMMAND.mapping(command);
    if (!commandInstance) return;
    try {
      await commandInstance.execute({
        msg,
        client,
        actionMessage,
      });
    } catch (error) {
      console.error(error);
      await msg.reply((error && error.message) || '기대되지않은 에러입니다. 관리자에게 문의하세요');
    }
  });
  await client.login(token);
  return resolved;
}

export { listen };
