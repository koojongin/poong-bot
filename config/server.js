import express from 'express';
import * as https from 'https';
import * as http from 'http';

function listen({ port = 3000 }) {
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

  global.SERVER_PORT = port;

  //
  // Routes
  //
  app.get('/auth', (req, res) => {
    res.send({});
  });

  //
  // Listen Server
  //
  const server = http.createServer(app);
  server.listen({ port: process.env.PORT || port }, () => {
    console.log(`listening on port ${port}`);
  });
}

export {
  listen,
};
