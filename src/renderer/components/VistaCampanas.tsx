import React, { useState, useEffect } from 'react';
import { Bot, Star, Check, BookOpen, OctagonX, Camera, Tent, X } from 'lucide-react';

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

export const CampaignsView: React.FC<CampaignsViewProps> = ({ socket, userRole, characters, currentUser, onEnterCampaign }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
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
          setter(data.url);
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
                  <button onClick={() => { 
                    setName(selectedCampaign.name); 
                    setDescription(selectedCampaign.description || ''); 
                    setImage(selectedCampaign.image || ''); 
                    setActiveHeroes(heroesList); 
                    setIsAiDm(selectedCampaign.is_ai_dm === 1);
                    setIsCreating(true); 
                  }} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
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
                    onClick={() => onEnterCampaign(selectedCampaign.id)}
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
                    ⚔️ ENTRAR A LA REJILLA DE COMBATE
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
                    {copied ? '¡Enlace Copiado! ✓' : '🔗 Copiar Enlace de Invitación'}
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
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, setNewDiaryImage)} id="diary-img-upload" style={{ display: 'none' }} />
                <label htmlFor="diary-img-upload" style={{ background: '#333', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <Camera className="w-4 h-4 inline-block mr-2" /> Adjuntar Imagen
                </label>
                {newDiaryImage && <span style={{ color: 'var(--natural-green)', fontSize: '0.9rem' }}>✓ Imagen adjunta</span>}
              </div>
              <button onClick={addDiaryEntry} style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                Publicar
              </button>
            </div>
          </div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <h3 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)' }}>{campaign.name}</h3>
                  {campaign.is_ai_dm === 1 && <span title="DM IA" style={{ fontSize: '1.2rem' }}><Bot className="w-5 h-5 m-auto" /></span>}
                  {campaign.is_active === 1 && <span title="Activa" style={{ fontSize: '1.2rem' }}><Star className="w-5 h-5 m-auto" /></span>}
                </div>
                <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '15px' }}>
                  {campaign.description || 'Sin descripción'}
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); viewCampaign(campaign); }} 
                  className="torch-glow"
                  style={{
                    background: 'linear-gradient(135deg, var(--natural-green), #1b8a4f)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    width: '100%',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)'
                  }}
                >
                  🚀 Entrar a la Aventura
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
