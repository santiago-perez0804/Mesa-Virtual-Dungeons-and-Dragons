import type { Server, Socket } from 'socket.io';
import { isAISessionActive, sendChatMessageToAI, sendDiceRollToAI } from '../ia-dm.js';

/** Acciones de juego compartidas: dados y chat de sala. */
export function registerGameHandlers(io: Server, socket: Socket) {
  socket.on('dice:roll', async (data: { die: number; to?: string }) => {
    const roomId = socket.data.campaignId;
    if (!roomId) return;
    const roll = Math.floor(Math.random() * data.die) + 1;
    const resultObj = {
      user: socket.data.userName,
      die: `d${data.die}`,
      value: roll,
      to: data.to || 'all',
      timestamp: Date.now()
    };
    io.to(`campaign-${roomId}`).emit('dice:result', resultObj);

    if (isAISessionActive(roomId)) {
      const aiResponse = await sendDiceRollToAI(roomId, socket.data.userName, roll, `d${data.die}`);
      if (aiResponse) {
        io.to(`campaign-${roomId}`).emit('chat:message', { sender: 'DM IA', text: aiResponse, timestamp: Date.now(), isAI: true });
      }
    }
  });

  socket.on('chat:send', async (msg) => {
    const roomId = socket.data.campaignId;
    if (!roomId) return;
    io.to(`campaign-${roomId}`).emit('chat:message', msg);

    if (isAISessionActive(roomId) && msg.sender !== 'DM IA') {
      const aiResponse = await sendChatMessageToAI(roomId, msg.sender, msg.text);
      if (aiResponse) {
        io.to(`campaign-${roomId}`).emit('chat:message', { sender: 'DM IA', text: aiResponse, timestamp: Date.now(), isAI: true });
      }
    }
  });
}
