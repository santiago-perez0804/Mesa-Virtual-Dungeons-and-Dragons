import React, { useState, useEffect } from 'react';
import { Bot, Star, Check, BookOpen, OctagonX, Camera, Tent } from 'lucide-react';

interface Campaign {
  id: number;
  name: string;
  description: string;
  image: string;
  active_heroes: string; // JSON array of character IDs
  is_ai_dm: number;
  is_active: number;
  owner?: string;
  created_at: string;
}

interface DiaryEntry {
  id: number;
  campaign_id: number;
  author: string;
  content: string;
  image: string;
  created_at: string;
}

interface CampaignsViewProps {
  socket: any;
  userRole: string;
  characters: any[];
  campaigns?: any[];
  currentUser?: { name: string; role: 'dm' | 'player' | 'admin'; profile_image?: string } | null;
  onEnterCampaign?: (campaignId: number) => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({ socket, characters, currentUser, onEnterCampaign, campaigns: propsCampaigns = [] }) => {
  const campaigns = propsCampaigns as Campaign[];
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [roomInput, setRoomInput] = useState('');
  
  // Create / Edit State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [activeHeroes, setActiveHeroes] = useState<number[]>([]);
  const [isAiDm, setIsAiDm] = useState(false);
  const [imageHovered, setImageHovered] = useState(false);

  // Diary State
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [newDiaryContent, setNewDiaryContent] = useState('');
  const [newDiaryImage, setNewDiaryImage] = useState('');
  
  // AI State
  const [isAiActive, setIsAiActive] = useState(false);

  useEffect(() => {
    socket.emit('campaign:request');

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
      socket.off('campaign:diary:list');
      socket.off('ai:session_status');
    };
  }, [socket, selectedCampaign]);

  // Sincronizar selectedCampaign cuando la lista de campaigns cambia desde props
  const prevCampaignsRef = React.useRef(campaigns);
  useEffect(() => {
    if (selectedCampaign) {
      const updated = campaigns.find(c => c.id === selectedCampaign.id);
      if (updated) setSelectedCampaign(updated);
      else setSelectedCampaign(null);
    }
    prevCampaignsRef.current = campaigns;
  }, [campaigns]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Leer como base64 para almacenamiento local inmediato
    const reader = new FileReader();
    reader.onload = () => {
      setter(reader.result as string);
    };
    reader.onerror = () => alert('Error al leer el archivo');
    reader.readAsDataURL(file);
    // Limpiar el input para que el mismo archivo se pueda volver a seleccionar
    e.target.value = '';
  };


  const saveCampaign = () => {
    if (!name) return;
    const payload = {
      name,
      description,
      image,
      active_heroes: activeHeroes,
      is_ai_dm: isAiDm
    };
    if (selectedCampaign && isCreating === false) {
      socket.emit('campaign:update', { id: selectedCampaign.id, ...payload });
    } else {
      socket.emit('campaign:create', payload);
    }
    setIsCreating(false);
    setSelectedCampaign(null);
  };

  const deleteCampaign = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta campaña?')) {
      socket.emit('campaign:delete', id);
      setSelectedCampaign(null);
    }
  };

  const viewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsCreating(false);
    socket.emit('campaign:diary:request', campaign.id);
  };

  const addDiaryEntry = () => {
    if (!newDiaryContent && !newDiaryImage) return;
    if (selectedCampaign) {
      socket.emit('campaign:diary:add', {
        campaign_id: selectedCampaign.id,
        content: newDiaryContent,
        image: newDiaryImage
      });
      setNewDiaryContent('');
      setNewDiaryImage('');
    }
  };

  const toggleHero = (id: number) => {
    if (activeHeroes.includes(id)) {
      setActiveHeroes(activeHeroes.filter(h => h !== id));
    } else {
      setActiveHeroes([...activeHeroes, id]);
    }
  };

  if (isCreating) {
    // FORMULARIO DE CREACIÓN/EDICIÓN (DM SOLO)
    return (
      <div style={{ padding: '25px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-parchment)' }}>
        <h2 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginTop: 0 }}>
          {selectedCampaign ? 'Editar Campaña' : 'Nueva Campaña'}
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', marginTop: '20px' }}>
          {/* COLUMNA IZQUIERDA: DETALLES DE LA CAMPAÑA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '0.9rem' }}>Título de la Campaña</label>
              <input 
                type="text" 
                placeholder="Ej: La Maldición de Strahd" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                style={{ padding: '12px', background: 'var(--bg-base)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '1rem' }}
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '0.9rem' }}>Descripción</label>
              <textarea 
                placeholder="Escribe la sinopsis o detalles para los aventureros..." 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                style={{ padding: '12px', background: 'var(--bg-base)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', minHeight: '120px', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={isAiDm} onChange={e => setIsAiDm(e.target.checked)} style={{ transform: 'scale(1.2)' }} />
                <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '0.95rem' }}>
                  <Bot className="w-4 h-4 inline-block mr-2" /> Activar DM con Inteligencia Artificial (Permite a los jugadores jugar sin DM humano)
                </span>
              </label>
            </div>

            {selectedCampaign && (
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '0.9rem' }}>Héroes Activos:</label>
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
                        border: activeHeroes.includes(c.id) ? '2px solid white' : '2px solid transparent',
                        fontSize: '0.9rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {c.name} ({c.owner})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: PORTADA 1:1 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: '15px' }}>
            <label style={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '0.9rem', alignSelf: 'flex-start' }}>Imagen de Portada (1:1)</label>
            
            <input 
              type="file" 
              id="campaign-cover-upload" 
              accept="image/*" 
              onChange={e => handleImageUpload(e, setImage)} 
              style={{ display: 'none' }} 
            />
            
            <label 
              htmlFor="campaign-cover-upload"
              style={{ 
                width: '100%', 
                maxWidth: '280px', 
                aspectRatio: '1/1', 
                borderRadius: '8px', 
                border: image ? '2px solid var(--accent-gold)' : '2px dashed var(--border-color)', 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer', 
                background: 'var(--bg-base)', 
                transition: 'all 0.2s', 
                position: 'relative',
                boxShadow: image ? '0 4px 15px rgba(201,168,76,0.15)' : 'none'
              }}
              onMouseEnter={() => setImageHovered(true)}
              onMouseLeave={() => setImageHovered(false)}
            >
              {image ? (
                <>
                  <img src={image} alt="Portada de la campaña" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {imageHovered && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                      background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '10px',
                      color: 'var(--accent-gold)', transition: 'all 0.2s'
                    }}>
                      <Camera className="w-8 h-8" />
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Cambiar Portada</span>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Camera className="w-10 h-10" style={{ color: 'var(--accent-gold)' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>Subir Portada</span>
                  <span style={{ fontSize: '0.75rem', color: '#666' }}>Formato sugerido: 1:1 (Cuadrado)</span>
                </div>
              )}
            </label>
            
            {image && (
              <button 
                type="button" 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImage(''); }}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
              >
                Quitar Imagen
              </button>
            )}
          </div>
        </div>

        {/* ACCIONES DEL FORMULARIO */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '20px', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => { setIsCreating(false); setSelectedCampaign(null); }} 
            style={{ background: 'transparent', border: '1px solid #555', color: 'var(--text-secondary)', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Cancelar
          </button>
          <button 
            onClick={saveCampaign} 
            className="torch-glow"
            style={{ background: 'var(--natural-green)', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)' }}
          >
            Guardar
          </button>
        </div>
      </div>
    );
  }

  if (selectedCampaign) {
    // VISTA DETALLE DE CAMPAÑA
    let heroesList: number[] = [];
    try { heroesList = JSON.parse(selectedCampaign.active_heroes); } catch(e) {}
    const activeCharacterObjects = characters.filter(c => heroesList.includes(c.id));

    // Agrupar héroes por owner (jugador)
    const playerMap: Record<string, any[]> = {};
    activeCharacterObjects.forEach(c => {
      const owner = c.owner || 'Desconocido';
      if (!playerMap[owner]) playerMap[owner] = [];
      playerMap[owner].push(c);
    });

    const isOwner = selectedCampaign.owner === currentUser?.name || !selectedCampaign.owner || currentUser?.role === 'admin';

    const roomLink = `${window.location.protocol}//${window.location.host}/?room=${selectedCampaign.id}`;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-parchment)' }}>
        {/* NAV */}
        <button
          onClick={() => setSelectedCampaign(null)}
          style={{
            alignSelf: 'flex-start',
            background: 'transparent',
            color: 'var(--accent-gold)',
            border: '1px solid rgba(200,135,42,0.4)',
            padding: '5px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,135,42,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          ← Volver a Campañas
        </button>

        {/* CONTENEDOR 1: HEADER */}
        <div style={{
          background: 'var(--bg-surface)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '24px'
        }}>
          {/* Izquierda: Título + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <h1 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: 0, fontSize: '1.6rem' }}>{selectedCampaign.name}</h1>
              {selectedCampaign.is_ai_dm === 1 && (
                <span style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '3px 9px', borderRadius: '20px', fontSize: '0.78rem', border: '1px solid rgba(59,130,246,0.4)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                  <Bot style={{ width: '12px', height: '12px' }} /> DM IA
                </span>
              )}
            </div>

            {/* Link de invitación + ID + ENTRAR en columna */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                maxWidth: '380px'
              }}>
                <span style={{ color: '#666', whiteSpace: 'nowrap' }}>ID de sala:</span>
                <strong style={{ color: 'var(--accent-gold)', whiteSpace: 'nowrap' }}>#{selectedCampaign.id}</strong>
                <span style={{ color: '#444', margin: '0 2px' }}>|</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#888', minWidth: 0 }}>{roomLink}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(roomLink);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  title={copied ? 'Copiado' : 'Copiar enlace'}
                  style={{
                    background: copied ? 'rgba(34,197,94,0.2)' : 'transparent',
                    color: copied ? 'var(--natural-green)' : '#888',
                    border: 'none',
                    padding: '2px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '4px',
                    transition: 'all 0.15s',
                    flexShrink: 0
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-gold)'}
                  onMouseLeave={e => e.currentTarget.style.color = copied ? 'var(--natural-green)' : '#888'}
                >
                  {copied
                    ? <Check style={{ width: '14px', height: '14px' }} />
                    : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  }
                </button>
              </div>

              {onEnterCampaign && (
                <button
                  onClick={() => onEnterCampaign(selectedCampaign.id)}
                  className="torch-glow"
                  style={{
                    background: 'linear-gradient(135deg, var(--natural-green), #1b8a4f)',
                    color: 'white',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    letterSpacing: '1px',
                    boxShadow: '0 2px 10px rgba(34,197,94,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'transform 0.15s',
                    alignSelf: 'flex-start',
                    marginTop: '10px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  ENTRAR
                </button>
              )}
            </div>
          </div>

          {/* Derecha: botones + lista jugadores */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px', flexShrink: 0 }}>
            {/* Botones Editar / Eliminar */}
            {isOwner && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => {
                    setName(selectedCampaign.name);
                    setDescription(selectedCampaign.description || '');
                    setImage(selectedCampaign.image || '');
                    setActiveHeroes(heroesList);
                    setIsAiDm(selectedCampaign.is_ai_dm === 1);
                    setIsCreating(true);
                  }}
                  title="Editar campaña"
                  style={{
                    background: 'rgba(59,130,246,0.1)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59,130,246,0.3)',
                    padding: '7px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s',
                    width: '32px',
                    height: '32px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button
                  onClick={() => deleteCampaign(selectedCampaign.id)}
                  title="Eliminar campaña"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    color: '#f87171',
                    border: '1px solid rgba(239,68,68,0.3)',
                    padding: '7px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s',
                    width: '32px',
                    height: '32px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div>
            )}

            {/* Lista jugadores → héroes */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Aventureros</div>
              {Object.keys(playerMap).length === 0 ? (
                <span style={{ color: '#555', fontSize: '0.85rem' }}>Nadie se ha unido aún</span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.entries(playerMap).map(([player, heroes]) => (
                    <div key={player} style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {heroes.map(h => (
                          <div key={h.id} title={h.name} style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(200,135,42,0.1)', border: '1px solid rgba(200,135,42,0.25)', borderRadius: '20px', padding: '2px 8px 2px 3px' }}>
                            {h.image
                              ? <img src={h.image} style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} />
                              : <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg></div>
                            }
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-parchment)' }}>{h.name}</span>
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#888', borderLeft: '1px solid #333', paddingLeft: '6px' }}>{player}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTENEDOR 2: DESCRIPCIÓN + IMAGEN */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 200px',
          gap: '16px',
          background: 'var(--bg-surface)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Descripción</div>
            <p style={{ margin: 0, color: '#ccc', fontSize: '1rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
              {selectedCampaign.description || <span style={{ color: '#444', fontStyle: 'italic' }}>Sin descripción.</span>}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>Portada</div>
            {selectedCampaign.image ? (
              <img src={selectedCampaign.image} style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
            ) : (
              <div style={{ width: '200px', height: '200px', background: '#111', borderRadius: '8px', border: '1px dashed #333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
            )}
          </div>
        </div>

        {/* CONTENEDOR 3: DIARIO DE CAMPAÑA */}
        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen style={{ width: '18px', height: '18px' }} />
              Diario de Campaña
            </h2>
            {selectedCampaign.is_ai_dm === 1 && (
              isAiActive ? (
                <button onClick={() => socket.emit('ai:end_session', selectedCampaign.id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <OctagonX style={{ width: '14px', height: '14px' }} /> Terminar sesión IA
                </button>
              ) : (
                <button onClick={() => socket.emit('ai:start_session', selectedCampaign.id)} style={{ background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bot style={{ width: '14px', height: '14px' }} /> Iniciar sesión IA
                </button>
              )
            )}
          </div>

          {/* INPUT para nueva entrada */}
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '28px' }}>
            <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Nueva entrada</div>
            <textarea
              value={newDiaryContent}
              onChange={e => setNewDiaryContent(e.target.value)}
              placeholder="Describe lo que ha sucedido en la sesión..."
              style={{
                width: '100%',
                minHeight: '80px',
                background: 'rgba(0,0,0,0.3)',
                color: 'var(--text-parchment)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '10px 12px',
                boxSizing: 'border-box',
                marginBottom: '10px',
                resize: 'vertical',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, setNewDiaryImage)} id="diary-img-upload" style={{ display: 'none' }} />
                <label htmlFor="diary-img-upload" style={{ background: 'rgba(255,255,255,0.05)', color: '#aaa', border: '1px solid var(--border-color)', padding: '5px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s' }}>
                  <Camera style={{ width: '14px', height: '14px' }} /> Adjuntar imagen
                </label>
                {newDiaryImage && (
                  <span style={{ color: 'var(--natural-green)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check style={{ width: '12px', height: '12px' }} /> Imagen lista
                  </span>
                )}
              </div>
              <button
                onClick={addDiaryEntry}
                style={{
                  background: 'var(--accent-gold)',
                  color: '#111',
                  border: 'none',
                  padding: '7px 20px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  letterSpacing: '0.5px',
                  transition: 'opacity 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Publicar
              </button>
            </div>
          </div>

          {/* LÍNEA DE VIDA del diario */}
          {diaryEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#444' }}>
              <BookOpen style={{ width: '28px', height: '28px', margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
              <span style={{ fontSize: '0.9rem' }}>El diario está vacío. La historia aún no ha comenzado.</span>
            </div>
          ) : (
            <div style={{ position: 'relative', paddingLeft: '28px', maxHeight: '780px', overflowY: 'auto', paddingRight: '6px' }} className="custom-scrollbar">
              {/* Línea vertical */}
              <div style={{
                position: 'absolute',
                left: '9px',
                top: '8px',
                bottom: '8px',
                width: '2px',
                background: 'linear-gradient(to bottom, var(--accent-gold), rgba(200,135,42,0.1))',
                borderRadius: '2px'
              }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {diaryEntries.map((entry, idx) => (
                  <div key={entry.id} style={{ position: 'relative', paddingBottom: '24px' }}>
                    {/* Nodo en la línea */}
                    <div style={{
                      position: 'absolute',
                      left: '-23px',
                      top: '4px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: idx === 0 ? 'var(--accent-gold)' : '#333',
                      border: `2px solid ${idx === 0 ? 'var(--accent-gold)' : '#555'}`,
                      boxShadow: idx === 0 ? '0 0 8px rgba(200,135,42,0.5)' : 'none',
                      transition: 'all 0.2s'
                    }} />

                    {/* Tarjeta de entrada */}
                    <div style={{
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '14px 16px',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,135,42,0.4)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(200,135,42,0.15)', border: '1px solid rgba(200,135,42,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
                          </div>
                          <strong style={{ color: 'var(--text-parchment)', fontSize: '0.85rem' }}>{entry.author}</strong>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#666' }}>
                          {new Date(entry.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}
                          {new Date(entry.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ margin: 0, color: '#ccc', fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{entry.content}</p>
                      {entry.image && (
                        <img src={entry.image} style={{ marginTop: '10px', maxWidth: '100%', maxHeight: '260px', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'block' }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // LISTA DE CAMPAÑAS
  return (
    <div style={{ color: 'var(--text-parchment)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: 0 }}>Tus Campañas</h1>
        {currentUser?.role !== 'admin' && (
          <button 
            onClick={() => { setName(''); setDescription(''); setImage(''); setActiveHeroes([]); setIsAiDm(false); setIsCreating(true); }}
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
            ✦ NUEVA CAMPAÑA
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
              const campaignExists = campaigns.some(c => c.id === id);
              if (campaignExists && onEnterCampaign) {
                onEnterCampaign(id);
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <h3 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)' }}>{campaign.name}</h3>
                  {campaign.is_ai_dm === 1 && <span title="DM IA"><Bot className="w-5 h-5" /></span>}
                  {campaign.is_active === 1 && <span title="Activa"><Star className="w-5 h-5" /></span>}
                </div>
                <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {campaign.description || 'Sin descripción'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
