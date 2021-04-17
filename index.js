import * as server from './config/server.js';
import * as BatchService from './api/services/BatchService.js';
import * as DiscordService from './config/discord.js';
import { getStreamByUser } from './api/services/DiscordService.js';

(async () => {
  server.listen({});
  const client = await DiscordService.listen();
  await BatchService.watchTwitchStreaming();
  // const selectedGuild = client.guilds.cache.find((data) => data.name === '곽씨와장씨');
  // const selectedChannel = await selectedGuild.channels.cache.find((data) => data.id === selectedGuild.systemChannelID);
  // selectedChannel.send(embedMessage);
})();
