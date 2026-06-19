import type { Server, Socket } from 'socket.io';
import { db } from '../bd.js';
import { getSocketRole } from '../utils/socketRol.js';
import { refreshAllCampaigns, refreshAllCharacters, sendCampaignsToSocket } from '../utils/sync.js';
import { handleEndAiSession, handleStartAiSession } from './ia.helpers.js';

/** Campanas, diario y control de DM IA. */
export function registerCampaignHandlers(io: Server, socket: Socket) {
  socket.on('campaign:request', () => {
    sendCampaignsToSocket(socket);
  });

  socket.on('campaign:create', (data: any) => {
    console.log(`[Campaign Create] Solicitando creacion. Datos:`, data, `Usuario: ${socket.data.userName}`);
    if (socket.data.userName) {
      const { name, description, image, active_heroes, is_ai_dm } = data;
      db.prepare('INSERT INTO campaigns (name, description, image, active_heroes, is_ai_dm, owner) VALUES (?, ?, ?, ?, ?, ?)')
        .run(name, description || null, image || null, JSON.stringify(active_heroes || []), is_ai_dm ? 1 : 0, socket.data.userName);
      console.log(`[Campaign Create] Campana creada con exito.`);
      refreshAllCampaigns(io);
    } else {
      console.log(`[Campaign Create] Rechazado: socket.data.userName no esta definido.`);
    }
  });

  socket.on('campaign:update', (data: any) => {
    const { id, name, description, image, active_heroes, is_ai_dm } = data;
    const campaign = db.prepare("SELECT owner FROM campaigns WHERE id = ?").get(id) as { owner: string | null } | undefined;
    if (campaign && (campaign.owner === socket.data.userName || !campaign.owner || socket.data.role === 'admin')) {
      const finalOwner = campaign.owner || socket.data.userName;
      db.prepare('UPDATE campaigns SET name = ?, description = ?, image = ?, active_heroes = ?, is_ai_dm = ?, owner = ? WHERE id = ?')
        .run(name, description || null, image || null, JSON.stringify(active_heroes || []), is_ai_dm ? 1 : 0, finalOwner, id);
      refreshAllCampaigns(io);
    }
  });

  socket.on('campaign:set_active', (id: number) => {
    console.log(`[Campaign Set Active] ID solicitado: ${id}. Usuario: ${socket.data.userName}, role: ${socket.data.role}`);
    const campaign = db.prepare("SELECT * FROM campaigns WHERE id = ?").get(id) as any;
    console.log(`[Campaign Set Active] Campana encontrada en DB:`, campaign);
    if (campaign && (campaign.owner === socket.data.userName || !campaign.owner || socket.data.role === 'admin')) {
      console.log(`[Campaign Set Active] Validacion exitosa.`);
      if (!campaign.owner) {
        console.log(`[Campaign Set Active] Campana heredada/adoptada por: ${socket.data.userName}`);
        db.prepare('UPDATE campaigns SET owner = ? WHERE id = ?').run(socket.data.userName, id);
      }
      db.prepare('UPDATE campaigns SET is_active = 0').run();
      db.prepare('UPDATE campaigns SET is_active = 1 WHERE id = ?').run(id);
      refreshAllCampaigns(io);

      const fullCampaign: any = db.prepare("SELECT * FROM campaigns WHERE id = ?").get(id);
      if (fullCampaign && fullCampaign.is_ai_dm) {
        handleStartAiSession(io, id);
      } else {
        handleEndAiSession(io, id);
      }

      refreshAllCharacters(io);
    } else {
      console.log(`[Campaign Set Active] Validacion rechazada. Owner en DB: ${campaign?.owner}, Solicitante: ${socket.data.userName}`);
    }
  });

  socket.on('campaign:delete', (id: number) => {
    const campaign = db.prepare("SELECT owner FROM campaigns WHERE id = ?").get(id) as { owner: string | null } | undefined;
    if (campaign && (campaign.owner === socket.data.userName || !campaign.owner || socket.data.role === 'admin')) {
      db.prepare('DELETE FROM campaigns WHERE id = ?').run(id);
      db.prepare('DELETE FROM campaign_diary WHERE campaign_id = ?').run(id);
      refreshAllCampaigns(io);
    }
  });

  socket.on('campaign:diary:request', (campaign_id: number) => {
    const diary = db.prepare("SELECT * FROM campaign_diary WHERE campaign_id = ? ORDER BY created_at ASC").all(campaign_id);
    socket.emit('campaign:diary:list', { campaign_id, diary });
  });

  socket.on('campaign:diary:add', (data: any) => {
    const { campaign_id, content, image } = data;
    const author = socket.data.userName || 'Anonimo';
    db.prepare('INSERT INTO campaign_diary (campaign_id, author, content, image) VALUES (?, ?, ?, ?)')
      .run(campaign_id, author, content, image || null);

    const diary = db.prepare("SELECT * FROM campaign_diary WHERE campaign_id = ? ORDER BY created_at ASC").all(campaign_id);
    io.emit('campaign:diary:list', { campaign_id, diary });
  });

  socket.on('ai:start_session', (campaignId: number) => {
    const currentRole = getSocketRole(socket);
    if (currentRole === 'dm' || currentRole === 'admin' || currentRole === 'player') {
      handleStartAiSession(io, campaignId);
    }
  });

  socket.on('ai:end_session', (campaignId: number) => {
    handleEndAiSession(io, campaignId);
  });
}
