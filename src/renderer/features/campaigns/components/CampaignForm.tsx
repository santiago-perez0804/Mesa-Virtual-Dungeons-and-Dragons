import React from 'react';
import { Bot } from 'lucide-react';
import type { Campaign } from '../types';

interface CampaignFormProps {
  formState: any; // Return type of useCampaignForm
  characters: any[];
  selectedCampaign: Campaign | null;
}

export const CampaignForm: React.FC<CampaignFormProps> = ({ formState, characters, selectedCampaign }) => {
  const {
    name, setName,
    description, setDescription,
    image,
    activeHeroes,
    isAiDm, setIsAiDm,
    handleImageUpload,
    saveCampaign,
    closeForm,
    toggleHero
  } = formState;

  return (
    <div style={{ padding: '20px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-parchment)' }}>
      <h2>{selectedCampaign ? 'Editar Campaña' : 'Nueva Campaña'}</h2>
      
      <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
        <input 
          type="text" 
          placeholder="Título de la Campaña" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          style={{ padding: '10px', background: 'var(--bg-base)', color: 'white', border: '1px solid #444', borderRadius: '4px' }}
        />
        <textarea 
          placeholder="Descripción..." 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          style={{ padding: '10px', background: 'var(--bg-base)', color: 'white', border: '1px solid #444', borderRadius: '4px', minHeight: '100px' }}
        />
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Imagen de Portada:</label>
          <input type="file" accept="image/*" onChange={e => handleImageUpload(e)} style={{ color: 'white' }} />
          {image && <img src={image} alt="Preview" style={{ width: '200px', height: '100px', objectFit: 'cover', marginTop: '10px', borderRadius: '8px' }} />}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Héroes Activos:</label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {characters.map(c => (
              <div 
                key={c.id} 
                onClick={() => toggleHero(c.id)}
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: '20px', 
                  background: activeHeroes.includes(c.id) ? 'var(--natural-green)' : '#333', 
                  color: 'white',
                  cursor: 'pointer',
                  border: activeHeroes.includes(c.id) ? '2px solid white' : '2px solid transparent'
                }}
              >
                {c.name} ({c.owner})
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={isAiDm} onChange={e => setIsAiDm(e.target.checked)} style={{ transform: 'scale(1.2)' }} />
            <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}><Bot className="w-4 h-4 inline-block mr-2" /> Activar DM con Inteligencia Artificial (Permite a los jugadores jugar sin DM humano)</span>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={saveCampaign} style={{ background: 'var(--natural-green)', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Guardar</button>
          <button onClick={closeForm} style={{ background: '#555', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};
