import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { Lobby_Sockets } from './lobby_server.js';
export {io}



const app = express();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // Store session for 2 minutes
    skipMiddlewares: true, // Skip middlewares upon successful recovery
  },
  pingInterval: 2000,
  pingTimeout: 5000,
  cors: {
    origin: "http://localhost",
    methods: ["GET", "POST"]
  }
});

server.listen(3001, () => {
  console.log('server running at http://localhost:3001');
});


Lobby_Sockets();