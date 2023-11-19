import cron from 'cron';
import moment from 'moment';
import * as TwitchAPIService from './TwitchAPIService';
import * as StreamService from './StreamService';

import 'moment-timezone';
import { getStreamByUser } from './DiscordService';

import http from 'http';
import { isPauseListening } from '../../config/config';
import { MY_SERVER_GUILD_ID } from '../../config/constants';

moment.tz.setDefault('Asia/Seoul');
const { CronJob } = cron;

const watchStreamer = [
  'hanryang1125',
  'yapyap30',
  'kimdoe',
  'ok_ja',
  'saddummy',
  'lovelyyeon',
  // '109ace',
  // 'kss7749',
  // 'zilioner',
  'noizemasta',
  'handongsuk',
  'suddenddong',
];

const storedStream = {};

async function getStreamInformation(userId) {
  const { body }: any = await TwitchAPIService.getStreamInformation({ userId });
  const [data = {}] = body.data;
  const {
    id,
    user_id,
    user_login,
    user_name,
    game_id,
    game_name,
    type,
    title,
    viewer_count,
    started_at,
    thumbnail_url,
    tag_ids,
  } = data;

  const client = StreamService.getClient();
  const selectedGuilds = client.guilds.cache;
  const selectedChannels = selectedGuilds
    .map((guild) => {
      if (guild?.channels?.cache.length === 0) return null;
      const channel = guild.channels.cache.find((channel) => channel.name === 'general' || channel.name === '일반');
      return channel;
    })
    .filter((channel) => {
      if (!channel) return false;
      const { type, guildId, id } = channel;
      if (type !== 'GUILD_TEXT') return false;
      if (guildId !== MY_SERVER_GUILD_ID) return false;
      return true;
    });
  if (!user_name) return;

  if (storedStream[userId]) {
    if (storedStream[userId].streamedAt === started_at) {
      return;
    }
  }

  const send = async (selectedChannel, embedMessage) => {
    const startAfterMinutes = moment().diff(started_at) / (1000 * 60);
    if (startAfterMinutes <= 5 && !!selectedChannel) {
      selectedChannel.send(`${user_name} 뱅온`);
      selectedChannel.send({ embeds: [embedMessage] });
    }
    storedStream[userId] = {
      streamedAt: started_at,
      isNotified: true,
    };
  };

  try {
    const { embedMessage } = await getStreamByUser({ userIdOrNicknameShotcut: user_login });
    selectedChannels
      .filter((channel) => !!channel)
      .forEach((channel) => {
        send(channel, embedMessage);
      });
  } catch (error) {
    console.log(error);
    return;
  }
}

async function awakeHeroku() {
  return http.get('http://poong-bot.herokuapp.com/');
}

async function watchTwitchStreaming() {
  const job = new CronJob(
    '0 */1 12-23 * * *',
    async () => {
      if (process.env.ENV == 'HEROKU') awakeHeroku();
      watchStreamer.forEach((streamerId) => {
        if (!isPauseListening() && process.env.ENV !== 'HEROKU') getStreamInformation(streamerId);
      });
    },
    null,
    true,
    'Asia/Seoul'
  );
  job.start();
}

export { watchTwitchStreaming };
