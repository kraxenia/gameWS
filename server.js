const express = require('express')
const app = express()
const http = require("http");
const wss = require('ws');
const uuid = require('uuid');
const path = require('path');

const server = http.createServer(app);

//initialize the WebSocket server instance
const ws = new wss.Server({ server });
let CLIENTS={};
const webSocket = new wss.Server({ port:  8080 });

webSocket.on('connection', function connection(ws) {
  ws.id = uuid.v4();
  CLIENTS[ws.id] = ws;
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    let parsedMsg = JSON.parse(message);
    if (!CLIENTS[parsedMsg.recipient]) {
      let errorMsg = {
        message: 'Client Is Not Available. Please try another one.',
        type: 'isError',
        recipient: parsedMsg.author
      }

      CLIENTS[parsedMsg.author].send(JSON.stringify(errorMsg));
      return;
    }

    ws.on('close', req => {
      delete CLIENTS[req.id];
    });

    CLIENTS[parsedMsg.recipient].send(message);
  });

  ws.send(JSON.stringify({recipient: ws.id}));
});
