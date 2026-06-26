import { db } from '../bd.js';

/** Rol dinamico del socket: admin global, o 'dm' si es dueno de la campana activa/actual. */
export function getSocketRole(socket: any): string {
  if (socket.data.role === 'admin') return 'admin';
  try {
    const campaignId = socket.data.campaignId;
    if (campaignId) {
      const campaign = db.prepare("SELECT owner FROM campaigns WHERE id = ?").get(campaignId) as { owner: string | null } | undefined;
      if (campaign && campaign.owner === socket.data.userName) {
        return 'dm';
      }
    } else {
      const activeCampaign = db.prepare("SELECT owner FROM campaigns WHERE is_active = 1").get() as { owner: string | null } | undefined;
      if (activeCampaign && activeCampaign.owner === socket.data.userName) {
        return 'dm';
      }
    }
  } catch (e) {
    console.error("Error al obtener rol dinamico de socket:", e);
  }
  return 'player';
}
