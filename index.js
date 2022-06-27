import { config } from './config/env.js';
import * as server from './config/server.js';
import * as BatchService from './api/services/BatchService.js';
import * as DiscordService from './config/discord.js';
import { setTwitchOAuth2Token } from './api/services/TwitchAPIService.js';
import { initDatabase } from './api/services/DatabaseService.js';

const { DISCORD_TOKEN_POONG, DISCORD_TOKEN_KOO } = process.env;
(async () => {
  console.log(!!config);
  await setTwitchOAuth2Token();
  await initDatabase();
  const client = await DiscordService.listen();
  // const otherClients = await Promise.all([DiscordService.listenWithToken(DISCORD_TOKEN_POONG), DiscordService.listenWithToken(DISCORD_TOKEN_KOO)]);
  const otherClients = [];
  await BatchService.watchTwitchStreaming();
  server.listen({ client, otherClients });

  // const selectedGuild = client.guilds.cache.find((data) => data.name === '곽씨와장씨');
  // const selectedChannel = await selectedGuild.channels.cache.find((data) => data.id === selectedGuild.systemChannelID);
  // selectedChannel.send(embedMessage);
})();
