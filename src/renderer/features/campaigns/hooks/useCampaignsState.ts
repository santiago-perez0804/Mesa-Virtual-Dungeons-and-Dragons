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

    const handleCampaignList = (list: Campaign[]) => {
      setCampaigns(list);
      setSelectedCampaign(prevSelected => {
        if (prevSelected) {
          const updated = list.find(c => c.id === prevSelected.id);
          return updated ? updated : null;
        }
        return prevSelected;
      });
    };

    const handleDiaryList = (data: { campaign_id: number; diary: DiaryEntry[] }) => {
      setSelectedCampaign(prevSelected => {
        if (prevSelected && prevSelected.id === data.campaign_id) {
          setDiaryEntries(data.diary);
        }
        return prevSelected;
      });
    };

    const handleSessionStatus = (data: { campaignId: number; active: boolean }) => {
      setSelectedCampaign(prevSelected => {
        if (prevSelected && prevSelected.id === data.campaignId) {
          setIsAiActive(data.active);
        }
        return prevSelected;
      });
    };

    socket.on('campaign:list', handleCampaignList);
    socket.on('campaign:diary:list', handleDiaryList);
    socket.on('ai:session_status', handleSessionStatus);

    return () => {
      socket.off('campaign:list', handleCampaignList);
      socket.off('campaign:diary:list', handleDiaryList);
      socket.off('ai:session_status', handleSessionStatus);
    };
  }, [socket]);

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
