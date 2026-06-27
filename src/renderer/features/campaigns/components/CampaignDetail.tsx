import React, { useState } from 'react';
import { Bot, Star, Check, BookOpen, OctagonX, Camera } from 'lucide-react';
import type { Campaign, DiaryEntry } from '../types';

interface CampaignDetailProps {
  socket: any;
  selectedCampaign: Campaign;
  setSelectedCampaign: (c: Campaign | null) => void;
  currentUser: any;
  characters: any[];
  diaryEntries: DiaryEntry[];
  isAiActive: boolean;
  addDiaryEntry: (content: string, image: string) => void;
  onEnterCampaign?: (campaign: Campaign) => void;
  deleteCampaign: (id: number) => void;
  openEditForm: (campaign: Campaign) => void;
}

export const CampaignDetail: React.FC<CampaignDetailProps> = ({
  socket,
  selectedCampaign,
  setSelectedCampaign,
  currentUser,
  characters,
  diaryEntries,
  isAiActive,
  addDiaryEntry,
  onEnterCampaign,
  deleteCampaign,
  openEditForm
}) => {
  const [copied, setCopied] = useState(false);
  const [newDiaryContent, setNewDiaryContent] = useState('');
  const [newDiaryImage, setNewDiaryImage] = useState('');

  let heroesList: number[] = [];
  try { heroesList = JSON.parse(selectedCampaign.active_heroes); } catch(e) {}
  const activeCharacterObjects = characters.filter(c => heroesList.includes(c.id));

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
        if (data.success) setNewDiaryImage(data.url);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePublish = () => {
    addDiaryEntry(newDiaryContent, newDiaryImage);
    setNewDiaryContent('');
    setNewDiaryImage('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--text-parchment)' }}>
      <button onClick={() => setSelectedCampaign(null)} style={{ alignSelf: 'flex-start', background: 'transparent', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>
        ← Volver a Campañas
      </button>

      <div style={{ display: 'flex', gap: '20px', background: 'var(--bg-surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', alignItems: 'center' }}>
        {selectedCampaign.image ? (
          <img src={selectedCampaign.image} style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--accent-gold)' }} />
        ) : (
          <div style={{ width: '150px', height: '150px', background: '#222', borderRadius: '8px', border: '2px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Sin Imagen</div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: 0 }}>{selectedCampaign.name}</h1>
              {selectedCampaign.is_ai_dm === 1 && (
                <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid #3b82f6' }}><Bot className="w-3 h-3 inline-block mr-1" /> DM IA</span>
              )}
              {selectedCampaign.is_active === 1 && (
                <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid #22c55e' }}><Star className="w-3 h-3 inline-block mr-1" /> Activa</span>
              )}
            </div>
            {(selectedCampaign.owner === currentUser?.name || !selectedCampaign.owner || currentUser?.role === 'admin') && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => socket.emit('campaign:set_active', selectedCampaign.id)} style={{ background: selectedCampaign.is_active === 1 ? 'var(--natural-green)' : '#444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                  {selectedCampaign.is_active === 1 ? <><Check className="w-4 h-4 inline-block mr-1" /> Activa</> : 'Establecer Activa'}
                </button>
                <button onClick={() => openEditForm(selectedCampaign)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                <button onClick={() => deleteCampaign(selectedCampaign.id)} style={{ background: 'var(--combat-red)', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
              </div>
            )}
          </div>
          <p style={{ marginTop: '10px', fontSize: '1.1rem', color: '#ccc' }}>{selectedCampaign.description}</p>
          
          <div style={{ marginTop: '15px' }}>
            <h4 style={{ margin: '0 0 5px 0', color: 'var(--accent-gold)' }}>Héroes Activos:</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              {activeCharacterObjects.length > 0 ? activeCharacterObjects.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#222', padding: '5px 10px', borderRadius: '20px', border: '1px solid #444' }}>
                  {c.image ? <img src={c.image} style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} /> : <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#444' }}/>}
                  <span style={{ fontSize: '0.85rem' }}>{c.name}</span>
                </div>
              )) : <span style={{ color: '#666', fontSize: '0.9rem' }}>No hay héroes asignados</span>}
            </div>
          </div>

          {onEnterCampaign && (
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button 
                  onClick={() => onEnterCampaign(selectedCampaign)}
                  className="torch-glow"
                  style={{
                    background: 'linear-gradient(135deg, var(--natural-green), #1b8a4f)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1.05rem',
                    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.35)',
                    letterSpacing: '1px',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  🚪 ENTRAR
                </button>

                <button 
                  onClick={() => {
                    const link = `${window.location.protocol}//${window.location.host}/?room=${selectedCampaign.id}`;
                    navigator.clipboard.writeText(link);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{
                    background: 'transparent',
                    color: 'var(--accent-gold)',
                    border: '1px solid var(--accent-gold)',
                    padding: '10px 18px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(200, 135, 42, 0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {copied ? '¡Enlace Copiado! 📝' : '🔗 Copiar Enlace de Invitación'}
                </button>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                ID de Sala: <strong style={{ color: 'var(--accent-gold)' }}>{selectedCampaign.id}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DIARIO DE CAMPAÑA */}
      <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '20px' }}>
          <h2 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: 0 }}><BookOpen className="w-6 h-6 inline-block mr-2" /> Diario de Campaña</h2>
          
          {selectedCampaign.is_ai_dm === 1 && (
            isAiActive ? (
              <button onClick={() => socket.emit('ai:end_session', selectedCampaign.id)} style={{ background: 'var(--combat-red)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                <OctagonX className="w-4 h-4 inline-block mr-2" /> Terminar Sesión IA
              </button>
            ) : (
              <button onClick={() => socket.emit('ai:start_session', selectedCampaign.id)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Bot className="w-4 h-4 inline-block mr-2" /> Iniciar Sesión IA
              </button>
            )
          )}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px', marginBottom: '20px' }}>
          {diaryEntries.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center' }}>No hay entradas en el diario aún.</p>
          ) : (
            diaryEntries.map(entry => (
              <div key={entry.id} style={{ background: '#1a1a1a', padding: '15px', borderRadius: '8px', borderLeft: '4px solid var(--accent-gold)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong style={{ color: 'var(--text-parchment)' }}>{entry.author}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(entry.created_at).toLocaleString()}</span>
                </div>
                <p style={{ margin: '0 0 10px 0', whiteSpace: 'pre-wrap' }}>{entry.content}</p>
                {entry.image && <img src={entry.image} style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }} />}
              </div>
            ))
          )}
        </div>

        <div style={{ background: '#111', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#ccc' }}>Nueva Entrada en el Diario</h4>
          <textarea 
            value={newDiaryContent}
            onChange={e => setNewDiaryContent(e.target.value)}
            placeholder="Escribe lo que ha sucedido..."
            style={{ width: '100%', minHeight: '80px', background: '#222', color: 'white', border: '1px solid #444', borderRadius: '4px', padding: '10px', boxSizing: 'border-box', marginBottom: '10px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="file" accept="image/*" onChange={handleImageUpload} id="diary-img-upload" style={{ display: 'none' }} />
              <label htmlFor="diary-img-upload" style={{ background: '#333', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <Camera className="w-4 h-4 inline-block mr-2" /> Adjuntar Imagen
              </label>
              {newDiaryImage && <span style={{ color: 'var(--natural-green)', fontSize: '0.9rem' }}>📸 Imagen adjunta</span>}
            </div>
            <button onClick={handlePublish} style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              Publicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
