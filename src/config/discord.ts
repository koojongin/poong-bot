import { Client, Interaction, TextChannel } from 'discord.js';
import * as COMMAND from '../api/commands';
import moment from 'moment';
import { isPauseListening, setPauseListening } from './config';
import { BOT_COMMAND_PREFIX, MY_SERVER_GUILD_ID } from './constants';

function createClient() {
  return new Client({
    allowedMentions: {
      repliedUser: false,
    },
    intents: ['Guilds', 'GuildMembers', 'GuildInvites', 'GuildMessages', 'GuildMessageReactions', 'MessageContent'],
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
            // type: 'PLAYING',
          },
        ],
      });

      resolve(client);
    });
  });

  client.on('interactionCreate', async (interaction: Interaction | any) => {
    const { customId } = interaction;
    const interactionInstance = COMMAND.interactions.find((cInteraction) => {
      return cInteraction.customId == customId;
    });
    if (!interactionInstance) return;
    await interactionInstance.action(interaction);
    // const message: any = interaction.message;
    // message.edit({ embeds: [message.embeds] });
    // await LostArkCharacterSearch.execute({ msg: message, client, actionMessage: values[0] });
    await interaction.deferReply();
    await interaction.deleteReply();
    //
  });
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
    // console.log(
    //   `[${guildName}-#${channelName}]${username}[${new Date(createdTimestamp).toLocaleString()}] : ${content}`
    // );
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
    if (msg.author.bot) return;
    console.log(
      `[${guildName}-#${channelName}]${username}[${new Date(createdTimestamp).toLocaleString()}] : ${content}`
    );
    if (msg.content.indexOf('-') !== 0) return;
    if (guildName.includes('Bot Repo')) return;
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
