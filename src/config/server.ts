import express from 'express';
import * as http from 'http';
import _ from 'lodash';
import { dictionaryRouter } from '../api/routes/dictionary';

function listenServer({ port = 3000, client, otherClients }) {
  //
  // Setup
  //
  const app = express();
  // const bodyParser = require('body-parser')
  app.use(function (req, res, next) {
    next();
  });
  app.use(express.static('static'));
  // parse application/x-www-form-urlencoded
  // app.use(bodyParser.urlencoded({extended: false}));

  // parse application/json
  // app.use(bodyParser.json())

  //
  // Routes
  //

  app.use('/dictionary', dictionaryRouter);
  app.get('/auth', (req, res) => {
    res.send({});
  });

  const BOUND_GENERAL_CHANNEL_ID = '259295776063225866';
  const MY_GUILD_ID = '683252977183621169';
  app.get('/guilds', async (req, res) => {
    const result = await client.guilds.fetch();
    const getGuildsFromClient = (client) => {
      const { guilds } = client;
      const result = guilds.cache
        .filter((data) => data.id !== MY_GUILD_ID)
        .map((guild) => {
          const { channels } = guild;
          return { guild, channels: channels._cache };
        });
      return result;
    };

    const guildsOfOtherClient = _.flatten(otherClients.map((client) => getGuildsFromClient(client)));
    const guilds = [...getGuildsFromClient(client), ...guildsOfOtherClient];
    return res.send(guilds);
  });
  app.get('/messages', async (req, res) => {
    const { before, channel: channelId } = req.query;
    if (!channelId) return res.status(400).send('Bad Request');
    const limit = 100;

    const allClients = [client, ...otherClients];
    const [selectedClient] = allClients.filter((client) => {
      const { channels } = client;
      return channels.cache.toJSON().filter((channel) => channel?.id === channelId).length > 0;
    });

    if (!selectedClient) return res.send('Not Found Channels');
    const { channels } = selectedClient;
    const query: { limit: number; before?: any } = { limit };

    if (before) query.before = before;
    let originMessages;
    try {
      const { guild } = await channels.fetch(channelId);
      const { channels: fetchedChannel } = guild;
      const [channel] = fetchedChannel._cache.toJSON().filter((c) => c.id == channelId);
      const { messages } = channel;
      const loadedMessages = await messages.fetch(query);

      const resultMessages = loadedMessages.map((_message) => {
        originMessages = messages;
        const message = { ..._message };
        message.author = message.author.toJSON();
        message.embeds = message.embeds.map((data) => data.toJSON());
        return message;
      });
      return res.send(resultMessages);
    } catch (error) {
      console.error(error);
      return res.send(error.message);
    }
  });

  //
  // Listen Server
  //
  const server = http.createServer(app);
  server.listen({ port: process.env.PORT || port }, () => {
    console.log(`listening on port ${port}`);
  });
}

export { listenServer };
