import React, { useState } from 'react';
import { Bot, Star, Check, BookOpen, OctagonX, Camera, Users, Scroll, ArrowLeft, Copy, Swords } from 'lucide-react';
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
  const [activeDetailTab, setActiveDetailTab] = useState<'panorama' | 'diario'>('panorama');
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

  const isOwnerOrAdmin = selectedCampaign.owner === currentUser?.name || !selectedCampaign.owner || currentUser?.role === 'admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--text-parchment)', animation: 'fadeInUp 0.3s ease', width: '100%' }}>

      {/* HERO BANNER */}
      <div style={{
        position: 'relative',
        height: '300px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: selectedCampaign.image
          ? `linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.85) 100%), url("${selectedCampaign.image}")`
          : 'linear-gradient(135deg, #1a1a1f, #0d0c09)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        border: '1px solid var(--border-color)'
      }}>
        {/* Back button */}
        <button onClick={() => setSelectedCampaign(null)}
          style={{
            position: 'absolute', top: '15px', left: '15px', zIndex: 2,
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
            color: 'var(--accent-gold)', border: '1px solid var(--border-color)',
            padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
            fontSize: '0.8rem', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,135,42,0.2)'; e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
        >
          <ArrowLeft size={14} />
          Volver
        </button>

        {/* Owner controls top-right */}
        {isOwnerOrAdmin && (
          <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 2, display: 'flex', gap: '8px' }}>
            <button onClick={() => socket.emit('campaign:set_active', selectedCampaign.id)}
              style={{
                background: selectedCampaign.is_active === 1 ? 'rgba(45, 94, 58, 0.8)' : 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(6px)',
                color: 'white', border: '1px solid var(--border-color)',
                padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <Check size={12} />
              {selectedCampaign.is_active === 1 ? 'Activa' : 'Activar'}
            </button>
            <button onClick={() => openEditForm(selectedCampaign)}
              style={{
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
                color: 'var(--accent-gold)', border: '1px solid var(--border-color)',
                padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                fontSize: '0.75rem', transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,135,42,0.2)'; e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              Editar
            </button>
            <button onClick={() => deleteCampaign(selectedCampaign.id)}
              style={{
                background: 'rgba(139, 32, 32, 0.6)', backdropFilter: 'blur(6px)',
                color: 'white', border: '1px solid var(--combat-red)',
                padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                fontSize: '0.75rem', transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,32,32,0.9)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,32,32,0.6)'; }}
            >
              Eliminar
            </button>
          </div>
        )}

        {/* Hero content overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '30px 35px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <h1 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: 0, fontSize: '2.2rem', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                  {selectedCampaign.name}
                </h1>
                {selectedCampaign.is_ai_dm === 1 && (
                  <span style={{ background: 'rgba(59, 130, 246, 0.25)', color: '#60a5fa', padding: '3px 10px', borderRadius: '4px', fontSize: '0.7rem', border: '1px solid rgba(59,130,246,0.4)', display: 'flex', alignItems: 'center', gap: '4px', backdropFilter: 'blur(4px)' }}>
                    <Bot size={11} /> DM IA
                  </span>
                )}
                {selectedCampaign.is_active === 1 && (
                  <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '3px 10px', borderRadius: '4px', fontSize: '0.7rem', border: '1px solid rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', gap: '4px', backdropFilter: 'blur(4px)' }}>
                    <Star size={11} /> Activa
                  </span>
                )}
              </div>
              {selectedCampaign.description && (
                <p style={{ margin: 0, color: 'rgba(244,230,212,0.8)', fontSize: '1rem', textShadow: '0 1px 8px rgba(0,0,0,0.9)', maxWidth: '600px' }}>
                  {selectedCampaign.description}
                </p>
              )}
            </div>

            {onEnterCampaign && (
              <div style={{ display: 'flex', gap: '10px', flexShrink: 0, alignItems: 'center' }}>
                {copied && (
                  <span style={{
                    color: 'var(--natural-green)', fontSize: '0.8rem',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
                    padding: '8px 14px', borderRadius: '6px',
                    border: '1px solid var(--natural-green)',
                    animation: 'fadeInUp 0.2s ease'
                  }}>
                    ¡Enlace copiado!
                  </span>
                )}
                <button onClick={() => {
                    const link = `${window.location.protocol}//${window.location.host}/?room=${selectedCampaign.id}`;
                    navigator.clipboard.writeText(link);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
                    color: 'var(--accent-gold)', border: '1px solid var(--border-color)',
                    padding: '12px 16px', borderRadius: '6px', cursor: 'pointer',
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center',
                    animation: copied ? 'flashBorder 0.5s ease' : 'none'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,135,42,0.15)'; e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => onEnterCampaign(selectedCampaign)}
                  className="torch-glow"
                  style={{
                    background: 'linear-gradient(135deg, var(--natural-green), #1b8a4f)',
                    color: 'white', border: 'none', padding: '14px 28px', borderRadius: '6px',
                    cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem',
                    boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
                    letterSpacing: '2px', transition: 'transform 0.15s ease',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    animation: 'pulseGlow 3s ease-in-out infinite'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.animation = 'none'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.animation = 'pulseGlow 3s ease-in-out infinite'; }}
                >
                  <Swords size={18} />
                  ENTRAR
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        {[
          { id: 'panorama' as const, label: 'PANORAMA', icon: <Scroll size={14} /> },
          { id: 'diario' as const, label: 'DIARIO', icon: <BookOpen size={14} /> }
        ].map(tab => {
          const isActive = activeDetailTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveDetailTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: isActive ? 'var(--accent-gold)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'var(--accent-gold)' : 'var(--border-color)',
                borderRadius: '4px',
                color: isActive ? 'black' : 'var(--text-secondary)',
                fontSize: '0.8rem', fontWeight: 'bold',
                padding: '8px 20px', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── TAB: PANORAMA ─── */}
      {activeDetailTab === 'panorama' && (
        <div className="clipped-frame" style={{ padding: '25px', animation: 'fadeInUp 0.3s ease', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

            {/* Long description */}
            {selectedCampaign.long_description && (
              <div>
                <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 12px 0', fontSize: '0.9rem', letterSpacing: '2px' }}>
                  DESCRIPCIÓN
                </h3>
                <div style={{
                  background: 'rgba(200,135,42,0.03)', borderLeft: '3px solid var(--accent-gold)',
                  padding: '16px 20px', borderRadius: '0 8px 8px 0',
                  color: '#bbb', fontSize: '0.9rem', lineHeight: '1.7', whiteSpace: 'pre-wrap'
                }}>
                  {selectedCampaign.long_description}
                </div>
              </div>
            )}

            {/* Room Info + Heroes row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Active Heroes */}
              <div>
                <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 12px 0', fontSize: '0.9rem', letterSpacing: '2px' }}>
                  <Users size={14} className="inline-block mr-2" /> HÉROES ACTIVOS
                </h3>
                {activeCharacterObjects.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeCharacterObjects.map((c, i) => (
                      <div key={c.id} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: 'rgba(200,135,42,0.04)', border: '1px solid var(--border-gold-subtle)',
                        padding: '8px 12px', borderRadius: '6px', transition: 'all 0.2s',
                        animation: `fadeInUp 0.3s ease ${i * 0.06}s both`
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,135,42,0.08)'; e.currentTarget.style.borderColor = 'var(--border-gold-active)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,135,42,0.04)'; e.currentTarget.style.borderColor = 'var(--border-gold-subtle)'; }}
                      >
                        {c.image ? (
                          <img src={c.image} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-gold)' }} />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gold-dim)', border: '2px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', fontSize: '0.8rem' }}>
                            {c.name?.[0] || '?'}
                          </div>
                        )}
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-parchment)' }}>{c.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#555', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    No hay héroes asignados a esta campaña.
                  </p>
                )}
              </div>

              {/* Info de Sala */}
              <div>
                <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 12px 0', fontSize: '0.9rem', letterSpacing: '2px' }}>
                  INFORMACIÓN DE SALA
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(200,135,42,0.03)', border: '1px solid var(--border-gold-subtle)', padding: '10px 14px', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', minWidth: '80px' }}>ID de Sala</span>
                    <span className="mono" style={{ color: 'var(--accent-gold)', fontSize: '0.95rem', fontWeight: 'bold' }}>{selectedCampaign.id}</span>
                  </div>
                  {selectedCampaign.max_players && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(200,135,42,0.03)', border: '1px solid var(--border-gold-subtle)', padding: '10px 14px', borderRadius: '6px' }}>
                      <Users size={14} style={{ color: 'var(--text-secondary)' }} />
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Máx. {selectedCampaign.max_players} jugadores</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Session controls */}
            {selectedCampaign.is_ai_dm === 1 && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 12px 0', fontSize: '0.9rem', letterSpacing: '2px' }}>
                  <Bot size={14} className="inline-block mr-2" /> SESIÓN IA
                </h3>
                {isAiActive ? (
                  <button onClick={() => socket.emit('ai:end_session', selectedCampaign.id)}
                    style={{
                      background: 'var(--combat-red)', color: 'white', border: 'none',
                      padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
                      display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
                  >
                    <OctagonX size={16} /> Terminar Sesión IA
                  </button>
                ) : (
                  <button onClick={() => socket.emit('ai:start_session', selectedCampaign.id)}
                    style={{
                      background: '#3b82f6', color: 'white', border: 'none',
                      padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold',
                      display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
                  >
                    <Bot size={16} /> Iniciar Sesión IA
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ─── TAB: DIARIO ─── */}
      {activeDetailTab === 'diario' && (
        <div className="clipped-frame" style={{ padding: '25px', animation: 'fadeInUp 0.3s ease', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* New entry form */}
            <div style={{
              background: 'rgba(200,135,42,0.04)', border: '1px solid var(--border-gold-active)',
              borderRadius: '8px', padding: '20px'
            }}>
              <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 15px 0', fontSize: '0.9rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={14} /> NUEVA ENTRADA
              </h3>
              <textarea
                value={newDiaryContent}
                onChange={e => setNewDiaryContent(e.target.value)}
                placeholder="Escribe lo que ha sucedido en la sesión..."
                style={{
                  width: '100%', minHeight: '90px',
                  background: 'var(--bg-base)', color: 'var(--text-parchment)',
                  border: '1px solid var(--border-color)', borderRadius: '6px',
                  padding: '12px', boxSizing: 'border-box', marginBottom: '12px',
                  resize: 'vertical', fontFamily: 'var(--font-body)', fontSize: '0.9rem'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="file" accept="image/*" onChange={handleImageUpload} id="diary-img-upload" style={{ display: 'none' }} />
                  <label htmlFor="diary-img-upload"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: 'var(--bg-raised)', color: 'var(--text-secondary)',
                      padding: '8px 14px', borderRadius: '6px', cursor: 'pointer',
                      fontSize: '0.8rem', border: '1px solid var(--border-color)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.color = 'var(--accent-gold)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    <Camera size={14} /> Adjuntar Imagen
                  </label>
                  {newDiaryImage && (
                    <span style={{ color: 'var(--natural-green)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ✓ Imagen adjunta
                    </span>
                  )}
                </div>
                <button onClick={handlePublish}
                  style={{
                    background: 'var(--accent-gold)', color: '#000', border: 'none',
                    padding: '10px 24px', borderRadius: '6px', fontWeight: 'bold',
                    fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
                    opacity: (newDiaryContent.trim() || newDiaryImage) ? 1 : 0.5
                  }}
                  disabled={!newDiaryContent.trim() && !newDiaryImage}
                >
                  Publicar
                </button>
              </div>
            </div>

            {/* Diary entries */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto', paddingRight: '8px' }}>
              {diaryEntries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#555' }}>
                  <BookOpen size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                  <p style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>No hay entradas en el diario aún.</p>
                  <p style={{ fontSize: '0.8rem' }}>Comienza a documentar las aventuras de tus héroes.</p>
                </div>
              ) : (
                diaryEntries.map((entry, i) => (
                  <div key={entry.id} style={{
                    background: 'var(--bg-base)', border: '1px solid var(--border-color)',
                    borderLeft: '3px solid var(--accent-gold)', borderRadius: '6px',
                    padding: '16px', transition: 'all 0.2s',
                    animation: `fadeInUp 0.35s ease ${i * 0.05}s both`
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-gold-active)'; e.currentTarget.style.background = 'rgba(200,135,42,0.03)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-base)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--accent-gold)' }}>
                          {entry.author?.[0]?.toUpperCase() || '?'}
                        </div>
                        <strong style={{ color: 'var(--text-parchment)', fontSize: '0.85rem' }}>{entry.author}</strong>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {new Date(entry.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 10px 0', whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>{entry.content}</p>
                    {entry.image && (
                      <img src={entry.image} style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
