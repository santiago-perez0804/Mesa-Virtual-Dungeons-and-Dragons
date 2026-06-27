import React from 'react';
import { useCampaignsState } from '../hooks/useCampaignsState';
import { useCampaignForm } from '../hooks/useCampaignForm';
import { CampaignGrid } from './CampaignGrid';
import { CampaignDetail } from './CampaignDetail';
import { CampaignForm } from './CampaignForm';

interface CampaignsViewProps {
  socket: any;
  userRole: string;
  characters: any[];
  currentUser?: { name: string; role: 'dm' | 'player' | 'admin'; profile_image?: string } | null;
  onEnterCampaign?: (campaignId: number) => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({ 
  socket, 
  characters, 
  currentUser, 
  onEnterCampaign 
}) => {
  const campaignsState = useCampaignsState(socket);
  const { 
    campaigns, 
    selectedCampaign, 
    setSelectedCampaign,
    diaryEntries, 
    isAiActive, 
    viewCampaign, 
    addDiaryEntry, 
    deleteCampaign 
  } = campaignsState;

  const formState = useCampaignForm(socket, selectedCampaign, setSelectedCampaign);
  const { isCreating, openCreateForm, openEditForm } = formState;

  if (isCreating) {
    return (
      <CampaignForm 
        formState={formState}
        characters={characters}
        selectedCampaign={selectedCampaign}
      />
    );
  }

  if (selectedCampaign) {
    return (
      <CampaignDetail 
        socket={socket}
        selectedCampaign={selectedCampaign}
        setSelectedCampaign={setSelectedCampaign}
        currentUser={currentUser}
        characters={characters}
        diaryEntries={diaryEntries}
        isAiActive={isAiActive}
        addDiaryEntry={addDiaryEntry}
        onEnterCampaign={onEnterCampaign}
        deleteCampaign={deleteCampaign}
        openEditForm={openEditForm}
      />
    );
  }

  return (
    <CampaignGrid 
      campaigns={campaigns}
      currentUser={currentUser}
      openCreateForm={openCreateForm}
      viewCampaign={viewCampaign}
      onEnterCampaign={onEnterCampaign}
    />
  );
};
