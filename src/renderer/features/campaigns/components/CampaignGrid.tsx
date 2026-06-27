import React, { useState } from 'react';
import { Bot, Star, Tent } from 'lucide-react';
import type { Campaign } from '../types';

interface CampaignGridProps {
  campaigns: Campaign[];
  currentUser: any;
  openCreateForm: () => void;
  viewCampaign: (campaign: Campaign) => void;
  onEnterCampaign?: (campaign: Campaign) => void;
}

export const CampaignGrid: React.FC<CampaignGridProps> = ({
  campaigns,
  currentUser,
  openCreateForm,
  viewCampaign,
  onEnterCampaign
}) => {
  const [roomInput, setRoomInput] = useState('');

  const joinCampaignRoom = (e: React.MouseEvent, campaign: Campaign) => {
    e.stopPropagation();
    if (onEnterCampaign) {
      onEnterCampaign(campaign);
    }
  };

  return (
    <div style={{ color: 'var(--text-parchment)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: 0 }}>Tus Campañas</h1>
        {currentUser?.role !== 'admin' && (
          <button 
            onClick={openCreateForm}
            className="font-cinzel torch-glow"
            style={{ 
              background: 'transparent', 
              color: 'var(--accent-gold)', 
              border: '1px solid var(--accent-gold)', 
              padding: '8px 20px', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              fontSize: '0.85rem',
              letterSpacing: '1px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--accent-gold)';
              e.currentTarget.style.color = '#111';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--accent-gold)';
            }}
          >
            ➕ NUEVA CAMPAÑA
          </button>
        )}
      </div>

      <div style={{ 
        background: 'rgba(0, 0, 0, 0.2)', 
        border: '1px solid var(--border-color)', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '25px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: '15px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '250px' }}>
          <span className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', letterSpacing: '1px', fontWeight: 'bold' }}>¿TIENES UN ID DE SALA?</span>
          <input
            type="text"
            placeholder="Ej: 5"
            value={roomInput}
            onChange={e => setRoomInput(e.target.value)}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid #444', 
              color: 'white', 
              padding: '6px 12px', 
              borderRadius: '4px', 
              width: '100px',
              textAlign: 'center',
              fontSize: '0.9rem'
            }}
          />
          <button
            onClick={() => {
              const id = Number(roomInput.trim());
              if (isNaN(id) || id <= 0) {
                alert('Por favor ingresa un ID de sala válido.');
                return;
              }
              const campaignObj = campaigns.find(c => c.id === id);
              if (campaignObj && onEnterCampaign) {
                onEnterCampaign(campaignObj);
              } else {
                alert('No se encontró ninguna campaña con el ID de sala ingresado. Asegúrate de tener acceso.');
              }
            }}
            className="torch-glow font-cinzel"
            style={{ 
              background: 'var(--accent-gold)', 
              color: 'black', 
              padding: '6px 16px', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              fontSize: '0.85rem'
            }}
          >
            UNIRSE A SALA
          </button>
        </div>
        
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          * Solicita el ID o enlace de invitación al Dungeon Master de la campaña.
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {campaigns.length === 0 ? (
          <p style={{ color: '#666' }}>No hay campañas creadas aún.</p>
        ) : (
          campaigns.map(campaign => (
            <div 
              key={campaign.id} 
              onClick={() => viewCampaign(campaign)}
              style={{ 
                background: 'var(--bg-surface)', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)'; }}
            >
              <div style={{ height: '150px', background: '#222', position: 'relative' }}>
                {campaign.image ? (
                  <img src={campaign.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: '2rem' }}><Tent className="w-10 h-10 m-auto" /></div>
                )}
              </div>
              <div style={{ padding: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <h3 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)' }}>{campaign.name}</h3>
                  {campaign.is_ai_dm === 1 && <span title="DM IA" style={{ fontSize: '1.2rem' }}><Bot className="w-5 h-5 m-auto" /></span>}
                  {campaign.is_active === 1 && <span title="Activa" style={{ fontSize: '1.2rem' }}><Star className="w-5 h-5 m-auto" /></span>}
                </div>
                <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '15px' }}>
                  {campaign.description || 'Sin descripción'}
                </p>
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); viewCampaign(campaign); }} 
                    style={{
                      background: 'transparent',
                      color: 'var(--accent-gold)',
                      border: '1px solid var(--accent-gold)',
                      padding: '8px 0',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      flex: '0.4',
                      textAlign: 'center'
                    }}
                  >
                    Detalles
                  </button>
                  <button 
                    onClick={(e) => joinCampaignRoom(e, campaign)} 
                    className="torch-glow"
                    style={{
                      background: 'linear-gradient(135deg, var(--natural-green), #1b8a4f)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 0',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      flex: '0.6',
                      boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)',
                      textAlign: 'center'
                    }}
                  >
                    🎲 A la Grilla
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
