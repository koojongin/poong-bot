import cron from 'node-cron';
import moment from 'moment';
import * as TwitchAPIService from './TwitchAPIService.js';
import * as StreamService from './StreamService.js';

import 'moment-timezone';
import { getStreamByUser } from './DiscordService.js';

import http from 'http';

moment.tz.setDefault('Asia/Seoul');

const watchStreamer = [
  'hanryang1125', 'yapyap30', 'kimdoe', 'ok_ja',
  'saddummy', 'lovelyyeon', '109ace',
  'beyou0728', 'kss7749', 'zilioner', 'hatsalsal', 'noizemasta', 'handongsuk',
];

const storedStream = {};

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
  const selectedChannel = await selectedGuild.channels.cache.find((data) => data.id === selectedGuild.systemChannelID);
  if (!user_name) return;

  if (storedStream[userId]) {
    if (storedStream[userId].streamedAt === started_at) {
      return;
    }
  }

  const startAfterMinutes = moment()
    .diff(started_at) / (1000 * 60);
  if (startAfterMinutes <= 5) {
    selectedChannel.send(`${user_name} 뱅온`);
    const embedMessage = await getStreamByUser({ userIdOrNicknameShotcut: user_login });
    selectedChannel.send(embedMessage);
  }
  storedStream[userId] = {
    streamedAt: started_at,
    isNotified: true,
  };
}
async function awakeHeroku() {
  return http.get('http://poong-bot.herokuapp.com/');
}
async function watchTwitchStreaming() {
  // getStreamInformation('hanryang1125')
  cron.schedule('*/1 * * * *', async () => {
    awakeHeroku();
    watchStreamer.forEach((streamerId) => {
      getStreamInformation(streamerId);
    });
  });
}
export {
  watchTwitchStreaming,
};
