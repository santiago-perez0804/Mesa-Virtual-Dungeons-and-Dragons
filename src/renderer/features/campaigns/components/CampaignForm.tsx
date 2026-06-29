import React from 'react';
import { Bot, ImagePlus, Users } from 'lucide-react';
import type { Campaign } from '../types';

interface CampaignFormProps {
  formState: any;
  characters: any[];
  selectedCampaign: Campaign | null;
}

export const CampaignForm: React.FC<CampaignFormProps> = ({ formState, characters, selectedCampaign }) => {
  const {
    name, setName,
    description, setDescription,
    longDescription, setLongDescription,
    maxPlayers, setMaxPlayers,
    image,
    activeHeroes,
    isAiDm, setIsAiDm,
    handleImageUpload,
    saveCampaign,
    closeForm,
    toggleHero
  } = formState;

  return (
    <div style={{ 
      padding: '30px', 
      background: 'var(--bg-surface)', 
      borderRadius: '12px', 
      border: '1px solid var(--border-color)', 
      color: 'var(--text-parchment)'
    }}>
      <h2 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 25px 0', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '2px' }}>
        {selectedCampaign ? '✦ EDITAR CAMPAÑA ✦' : '✦ NUEVA CAMPAÑA ✦'}
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
        <div>
          <div 
            style={{ 
              width: '100%', 
              aspectRatio: '1', 
              background: 'var(--bg-base)', 
              border: '2px dashed var(--border-gold-subtle)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              position: 'relative'
            }}
            onClick={() => document.getElementById('cover-image-input')?.click()}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(200, 135, 42, 0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-gold-subtle)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {image ? (
              <img src={image} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
            ) : (
              <>
                <ImagePlus size={48} style={{ color: 'var(--gold-muted)', marginBottom: '10px' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Imagen de Portada</span>
              </>
            )}
          </div>
          <input 
            id="cover-image-input"
            type="file" 
            accept="image/*" 
            onChange={e => handleImageUpload(e)} 
            style={{ display: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '1px', fontWeight: 'bold' }}>TÍTULO</label>
            <input 
              type="text" 
              placeholder="Nombre de la campaña" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              style={{ 
                width: '100%',
                padding: '12px 14px', 
                background: 'var(--bg-base)', 
                color: 'white', 
                border: '1px solid var(--border-subtle)', 
                borderRadius: '6px',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '1px', fontWeight: 'bold' }}>DESCRIPCIÓN BREVE</label>
            <textarea 
              placeholder="Describe brevemente tu campaña..." 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              maxLength={300}
              style={{ 
                width: '100%',
                padding: '12px 14px', 
                background: 'var(--bg-base)', 
                color: 'white', 
                border: '1px solid var(--border-subtle)', 
                borderRadius: '6px',
                flex: 1,
                fontSize: '0.9rem',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'var(--font-body)',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
            />
            <span style={{ fontSize: '0.7rem', color: description.length > 280 ? 'var(--accent-gold)' : 'var(--text-dim)', textAlign: 'right', marginTop: '4px' }}>
              {description.length}/300
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '1px', fontWeight: 'bold' }}>DESCRIPCIÓN LARGA</label>
        <textarea 
          placeholder="Lore, historia, reglas de la casa, información detallada de la campaña..." 
          value={longDescription} 
          onChange={e => setLongDescription(e.target.value)} 
          style={{ 
            width: '100%',
            padding: '14px 16px', 
            background: 'var(--bg-base)', 
            color: 'white', 
            border: '1px solid var(--border-subtle)', 
            borderRadius: '6px',
            minHeight: '180px',
            fontSize: '0.9rem',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'var(--font-body)',
            lineHeight: '1.6',
            transition: 'border-color 0.2s'
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
        />
      </div>

      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '1px', fontWeight: 'bold' }}>HÉROES ACTIVOS</label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {characters.map(c => (
              <div 
                key={c.id} 
                onClick={() => toggleHero(c.id)}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '20px', 
                  background: activeHeroes.includes(c.id) ? 'var(--natural-green)' : 'rgba(255,255,255,0.05)', 
                  color: 'white',
                  cursor: 'pointer',
                  border: activeHeroes.includes(c.id) ? '2px solid var(--accent-gold)' : '2px solid var(--border-subtle)',
                  transition: 'all 0.2s',
                  fontSize: '0.85rem'
                }}
                onMouseEnter={e => { if (!activeHeroes.includes(c.id)) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}}
                onMouseLeave={e => { if (!activeHeroes.includes(c.id)) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}}
              >
                {c.name} ({c.owner})
              </div>
            ))}
          </div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '1px', fontWeight: 'bold' }}>
            <Users size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />MÁXIMO DE JUGADORES
          </label>
          <input 
            type="number" 
            min={0}
            max={99}
            placeholder="0 = sin límite" 
            value={maxPlayers || ''} 
            onChange={e => setMaxPlayers(Math.max(0, parseInt(e.target.value) || 0))} 
            style={{ 
              width: '100%',
              padding: '10px 14px', 
              background: 'var(--bg-base)', 
              color: 'white', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: '6px',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', display: 'block' }}>
            0 = sin límite de jugadores
          </span>
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px 16px', background: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <input type="checkbox" checked={isAiDm} onChange={e => setIsAiDm(e.target.checked)} style={{ transform: 'scale(1.2)', accentColor: 'var(--accent-gold)' }} />
          <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bot size={18} /> DM con Inteligencia Artificial
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginLeft: '8px' }}>
            (Permite a los jugadores jugar sin DM humano)
          </span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
        <button 
          onClick={saveCampaign} 
          style={{ 
            background: 'linear-gradient(135deg, var(--natural-green), #1b8a4f)',
            color: 'white', 
            padding: '10px 28px', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(34, 197, 94, 0.2)'; e.currentTarget.style.transform = 'none'; }}
        >
          GUARDAR
        </button>
        <button 
          onClick={closeForm} 
          style={{ 
            background: 'transparent',
            color: 'var(--text-secondary)', 
            padding: '10px 28px', 
            border: '1px solid var(--border-color)', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            letterSpacing: '1px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-parchment)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          CANCELAR
        </button>
      </div>
    </div>
  );
};