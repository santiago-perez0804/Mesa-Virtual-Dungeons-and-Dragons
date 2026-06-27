import { useState, useEffect } from 'react';
import type { Campaign, DiaryEntry } from '../types';

export const useCampaignsState = (socket: any) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  // Diary State
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  
  // AI State
  const [isAiActive, setIsAiActive] = useState(false);

  useEffect(() => {
    if (!socket) return;
    
    socket.emit('campaign:request');

    socket.on('campaign:list', (list: Campaign[]) => {
      setCampaigns(list);
      if (selectedCampaign) {
        const updated = list.find(c => c.id === selectedCampaign.id);
        if (updated) setSelectedCampaign(updated);
        else setSelectedCampaign(null);
      }
    });

    socket.on('campaign:diary:list', (data: { campaign_id: number; diary: DiaryEntry[] }) => {
      if (selectedCampaign && selectedCampaign.id === data.campaign_id) {
        setDiaryEntries(data.diary);
      }
    });

    socket.on('ai:session_status', (data: { campaignId: number; active: boolean }) => {
      if (selectedCampaign && selectedCampaign.id === data.campaignId) {
        setIsAiActive(data.active);
      }
    });

    return () => {
      socket.off('campaign:list');
      socket.off('campaign:diary:list');
      socket.off('ai:session_status');
    };
  }, [socket, selectedCampaign]);

  const viewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    if (socket) {
      socket.emit('campaign:diary:request', campaign.id);
    }
  };

  const addDiaryEntry = (content: string, image: string) => {
    if (!content && !image) return;
    if (selectedCampaign && socket) {
      socket.emit('campaign:diary:add', {
        campaign_id: selectedCampaign.id,
        content: content,
        image: image
      });
    }
  };

  const deleteCampaign = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta campaña?')) {
      socket.emit('campaign:delete', id);
      setSelectedCampaign(null);
    }
  };

  return {
    campaigns,
    selectedCampaign,
    setSelectedCampaign,
    diaryEntries,
    isAiActive,
    viewCampaign,
    addDiaryEntry,
    deleteCampaign
  };
};
