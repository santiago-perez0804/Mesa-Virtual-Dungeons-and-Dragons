import type { Server } from 'socket.io';
import { db } from '../bd.js';
import { startAISession, endAISession } from '../ia-dm.js';
import { getRoomBoardState } from '../estado.js';

/** Inicia la sesion de DM IA de una campana; coloca monstruos cuando la IA lo pide. */
export function handleStartAiSession(io: Server, campaignId: number) {
  const campaign: any = db.prepare("SELECT * FROM campaigns WHERE id = ?").get(campaignId);
  if (campaign && campaign.is_ai_dm) {
    const spawnMonsterCb = (monsterName: string, count: number) => {
      const m = db.prepare("SELECT * FROM content_items WHERE type = 'monster' AND name LIKE ? LIMIT 1").get(`%${monsterName}%`) as any;
      if (m) {
        const mData = JSON.parse(m.data);
        const boardState = getRoomBoardState(campaignId);
        for (let i = 0; i < count; i++) {
          const hpText = mData.hit_points || mData.hp || '10';
          const hp = parseInt(String(hpText).split('d')[0]) || 10;

          const newToken = {
            instanceId: `monster-${m.id}-${Date.now()}-${i}`,
            originalId: m.id,
            name: m.name + (count > 1 ? ` ${i + 1}` : ''),
            type: 'monster',
            hp: hp,
            max_hp: hp,
            ac: mData.armor_class || 10,
            image: mData.image || null,
            owner: null,
            x: 0,
            y: 0
          };
          boardState.boardTokens.push(newToken);
        }
        io.to(`campaign-${campaignId}`).emit('token:board-list', boardState.boardTokens);
      }
    };

    const started = startAISession(campaignId, campaign.name, campaign.description, spawnMonsterCb);
    if (started) {
      io.to(`campaign-${campaignId}`).emit('chat:message', {
        sender: 'DM IA',
        text: `\u00a1Saludos aventureros! Soy el DM IA. La campa\u00f1a "${campaign.name}" ha comenzado.`,
        timestamp: Date.now(),
        isAI: true
      });
      io.to(`campaign-${campaignId}`).emit('ai:session_status', { campaignId, active: true });
    }
  }
}

/** Finaliza la sesion de DM IA de una campana. */
export function handleEndAiSession(io: Server, campaignId: number) {
  endAISession(campaignId);
  io.to(`campaign-${campaignId}`).emit('chat:message', {
    sender: 'DM IA',
    text: `La sesi\u00f3n de IA ha finalizado. Hasta la pr\u00f3xima aventura.`,
    timestamp: Date.now(),
    isAI: true
  });
  io.to(`campaign-${campaignId}`).emit('ai:session_status', { campaignId, active: false });
}
