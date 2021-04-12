import * as server from './config/server.js';
import * as BatchService from './api/services/BatchService.js'
import * as DiscordService from './config/discord.js'


server.listen({});
DiscordService.listen()
.then((client) => {
  BatchService.watchTwitchStreaming();
})



