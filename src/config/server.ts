import express from 'express';
import * as http from 'http';

function listenServer({ port = 3000, client, otherClients }) {
  //
  // Setup
  //
  const app = express();
  // const bodyParser = require('body-parser')

  app.use(express.static('static'));
  // parse application/x-www-form-urlencoded
  // app.use(bodyParser.urlencoded({extended: false}));

  // parse application/json
  // app.use(bodyParser.json())

  //
  // Routes
  //
  app.get('/auth', (req, res) => {
    res.send({});
  });

  const BOUND_GENERAL_CHANNEL_ID = '259295776063225866';
  const MY_GUILD_ID = '683252977183621169';
  app.get('/guilds', (req, res) => {
    const getResultFromClient = (client) => {
      const { guilds } = client;
      const result = guilds.cache
        .filter((data) => data.id !== MY_GUILD_ID)
        .map((guild) => {
          const { channels } = guild;
          return { guild, channels: channels.cache };
        });
      return result;
    };

    const results = getResultFromClient(client).concat(...otherClients.map((client) => getResultFromClient(client)));
    return res.send(results);
  });
  app.get('/messages', async (req, res) => {
    const { before, channel: channelId } = req.query;
    const limit = 100;

    const allClients = [client, ...otherClients];
    const [selectedClient] = allClients.filter((client) => {
      const { channels } = client;
      return channels.cache.toJSON().filter((channel) => channel?.id === channelId).length > 0;
    });
    const { channels } = selectedClient;
    const query: { limit: number; before?: number } = { limit };

    if (before) query.before = before;
    let originMessages;
    try {
      const messages = await channels
        .fetch(channelId)
        .then((channel) => channel.messages.fetch(query))
        .then((messages) =>
          messages.map((_message) => {
            originMessages = messages;
            const message = { ..._message };
            message.author = message.author.toJSON();
            message.embeds = message.embeds.map((data) => data.toJSON());
            return message;
          })
        );
      return res.send(messages);
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
