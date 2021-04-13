import cron from 'node-cron';
import moment from 'moment';
import * as TwitchAPIService from './TwitchAPIService.js';
import * as StreamService from './StreamService.js';

import 'moment-timezone';

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
  /*
  {
      "id": "41182651997",
      "user_id": "114789574",
      "user_login": "suddenddong",
      "user_name": "suddenddong",
      "game_id": "506468",
      "game_name": "Nioh 2",
      "type": "live",
      "title": "테스트",
      "viewer_count": 0,
      "started_at": "2021-03-27T09:01:35Z",
      "language": "ko",
      "thumbnail_url": "https://static-cdn.jtvnw.net/previews-ttv/live_user_suddenddong-{width}x{height}.jpg",
      "tag_ids": [
      "ab2975e3-b9ca-4b1a-a93e-fb61a5d5c3a4"
      ]
  }
   */

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
  }
  storedStream[userId] = {
    streamedAt: started_at,
    isNotified: true,
  };
}

export {
  watchTwitchStreaming,
};
