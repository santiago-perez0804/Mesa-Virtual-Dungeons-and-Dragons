import { useState, useEffect } from 'react';
import type { Campaign } from '../types';

export const useCampaignForm = (socket: any, selectedCampaign: Campaign | null, setSelectedCampaign: (c: Campaign | null) => void) => {
  const [isCreating, setIsCreating] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [activeHeroes, setActiveHeroes] = useState<number[]>([]);
  const [isAiDm, setIsAiDm] = useState(false);

  // Populate form when editing an existing campaign
  useEffect(() => {
    if (selectedCampaign && !isCreating) {
      setName(selectedCampaign.name || '');
      setDescription(selectedCampaign.description || '');
      setImage(selectedCampaign.image || '');
      setIsAiDm(selectedCampaign.is_ai_dm === 1);
      try {
        const parsed = JSON.parse(selectedCampaign.active_heroes || '[]');
        setActiveHeroes(Array.isArray(parsed) ? parsed : []);
      } catch {
        setActiveHeroes([]);
      }
    }
  }, [selectedCampaign, isCreating]);

  const openCreateForm = () => {
    setSelectedCampaign(null);
    setName('');
    setDescription('');
    setImage('');
    setActiveHeroes([]);
    setIsAiDm(false);
    setIsCreating(true);
  };

  const openEditForm = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsCreating(true);
  };

  const closeForm = () => {
    setIsCreating(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const backendUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
      const uploadUrl = `${backendUrl}/api/upload?folder=misc`;
      
      try {
        const res = await fetch(uploadUrl, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          setImage(data.url);
        } else {
          alert('Error al subir imagen: ' + data.error);
        }
      } catch (err) {
        console.error(err);
        alert('Error de conexión al subir la imagen');
      }
    }
  };

  const saveCampaign = () => {
    if (!name) return;
    const payload = {
      name,
      description,
      image,
      active_heroes: activeHeroes,
      is_ai_dm: isAiDm ? 1 : 0
    };
    if (selectedCampaign && isCreating) {
      socket.emit('campaign:update', { id: selectedCampaign.id, ...payload });
    } else {
      socket.emit('campaign:create', payload);
    }
    setIsCreating(false);
    setSelectedCampaign(null);
  };

  const toggleHero = (id: number) => {
    if (activeHeroes.includes(id)) {
      setActiveHeroes(activeHeroes.filter(h => h !== id));
    } else {
      setActiveHeroes([...activeHeroes, id]);
    }
  };

  return {
    isCreating,
    name, setName,
    description, setDescription,
    image, setImage,
    activeHeroes, setActiveHeroes,
    isAiDm, setIsAiDm,
    openCreateForm,
    openEditForm,
    closeForm,
    handleImageUpload,
    saveCampaign,
    toggleHero
  };
};
