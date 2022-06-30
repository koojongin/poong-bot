import dotenv from 'dotenv';
import * as BatchService from './api/services/BatchService';
import * as DiscordService from './config/discord';
import { listenServer } from './config/server';
import { setTwitchOAuth2Token } from './api/services/TwitchAPIService';
import { connect } from './api/services/DatabaseService';
import { setClient } from './api/services/StreamService';

(async () => {
  dotenv.config();
  await setTwitchOAuth2Token();
  await connect();
  const client = await DiscordService.listen();
  setClient(client);
  const otherClients = [];
  if (process.env.ENV !== 'HEROKU') {
    const kooBotClient = await Promise.all([DiscordService.listen(process.env.DISCORD_TOKEN_KOO)]);
    otherClients.push(kooBotClient);
  }
  await BatchService.watchTwitchStreaming();
  listenServer({ client, otherClients });
})();
