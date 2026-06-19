import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initDB } from './bd.js';
import { runFullImport } from './sembrador.js';
import { initAI } from './ia-dm.js';
import { initImageAI } from './ia-imagen.js';
import { registerClassFeaturesRoutes } from './routes/classFeatures.routes.js';
import { registerUploadRoutes } from './routes/upload.routes.js';
import { registerSocketHandlers } from './sockets/index.js';

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

registerClassFeaturesRoutes(app, io);
registerUploadRoutes(app);

export const startServer = async () => {
  initDB();
  await runFullImport();
  initAI();
  initImageAI();

  io.on('connection', (socket) => {
    console.log('Conexion establecida:', socket.id);
    registerSocketHandlers(io, socket);
    socket.on('disconnect', () => console.log('Jugador desconectado'));
  });

  httpServer.listen(3000, () => console.log('Server en http://localhost:3000'));
};

if (!process.versions.electron) {
  startServer();
}
