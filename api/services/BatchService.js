import cron from 'cron';
import moment from 'moment';
import * as TwitchAPIService from './TwitchAPIService.js';
import * as StreamService from './StreamService.js';

import 'moment-timezone';
import { getStreamByUser } from './DiscordService.js';

import http from 'http';

moment.tz.setDefault('Asia/Seoul');
const { CronJob } = cron;

const watchStreamer = [
  'hanryang1125', 'yapyap30', 'kimdoe', 'ok_ja',
  'saddummy', 'lovelyyeon', '109ace',
  'beyou0728', 'kss7749', 'zilioner', 'hatsalsal', 'noizemasta', 'handongsuk', 'suddenddong',
];

const storedStream = {};
const MY_SERVER_GENERAL_CHANNEL_ID = '683252977183621286';

async function getStreamInformation(userId) {
  const { body } = await TwitchAPIService.getStreamInformation({ userId });
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
  const selectedGuild = client.guilds.cache.find((data) => data.name === '곽씨와장씨');
  // const selectedChannel = await selectedGuild.channels.cache.find((data) => data.id === selectedGuild.systemChannelID);
  // const selectedChannel = await selectedGuild.channels.cache.find((channel) => channel.name === 'general');
  const selectedGuilds = client.guilds.cache;
  const selectedChannels = selectedGuilds.map((guild) => {
    if (guild?.channels?.cache.length === 0) return null;
    const channel = guild.channels.cache.find((channel) => channel.name === 'general' || channel.name === '일반');
    return channel;
  });
  if (!user_name) return;

  if (storedStream[userId]) {
    if (storedStream[userId].streamedAt === started_at) {
      return;
    }
  }

  const { embedMessage } = await getStreamByUser({ userIdOrNicknameShotcut: user_login });

  const send = async (selectedChannel) => {
    const startAfterMinutes = moment()
      .diff(started_at) / (1000 * 60);
    if (startAfterMinutes <= 5 && !!selectedChannel) {
      selectedChannel.send(`${user_name} 뱅온`);
      selectedChannel.send(embedMessage);
    }
    storedStream[userId] = {
      streamedAt: started_at,
      isNotified: true,
    };
  };

  selectedChannels.filter((channel) => !!channel).forEach((channel) => {
    try {
      send(channel);
    } catch (error) {
      console.log(error);
    }
  });
}

async function awakeHeroku() {
  return http.get('http://poong-bot.herokuapp.com/');
}

async function watchTwitchStreaming() {
  // getStreamInformation('hanryang1125')

  const job = new CronJob('0 */1 12-23 * * *', async () => {
    awakeHeroku();
    watchStreamer.forEach((streamerId) => {
      if (!global.isPauseListening) getStreamInformation(streamerId);
    });
  }, null, true, 'Asia/Seoul');
  job.start();
}

export {
  watchTwitchStreaming,
};
