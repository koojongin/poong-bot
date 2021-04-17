import cron from 'node-cron';
import moment from 'moment';
import * as TwitchAPIService from './TwitchAPIService.js';
import * as StreamService from './StreamService.js';

import 'moment-timezone';
import { getStreamByUser } from './DiscordService.js';

moment.tz.setDefault('Asia/Seoul');

const watchStreamer = [
  'hanryang1125',
];

const storedStream = {};

async function watchTwitchStreaming() {
  // getStreamInformation('hanryang1125')
  cron.schedule('*/1 * * * *', async () => {
    watchStreamer.forEach((streamerId) => {
      TwitchAPIService.getStreamInformation(streamerId);
    });
  });
}

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

export {
  watchTwitchStreaming,
};
