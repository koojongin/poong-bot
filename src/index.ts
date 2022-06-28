import dotenv from 'dotenv';
import * as BatchService from './api/services/BatchService';
import * as DiscordService from './config/discord';
import { listenServer } from './config/server';
import { setTwitchOAuth2Token } from './api/services/TwitchAPIService';
import { connect } from './api/services/DatabaseService';

(async () => {
  dotenv.config();
  await setTwitchOAuth2Token();
  await connect();
  const client = await DiscordService.listen();
  const otherClients = [];
  await BatchService.watchTwitchStreaming();
  listenServer({ client, otherClients });
})();
