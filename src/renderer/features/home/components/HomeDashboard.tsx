import React from 'react';
import { Swords, Users, BookOpen, Dice5, Scroll, Sword, Shield, UserPlus, MessageCircle, Activity } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';

interface HomeDashboardProps {
  socket: any;
  user: any;
  campaigns: any[];
  characters: any[];
  onNavigate: (tab: string) => void;
  onEnterCampaign: (campaign: any) => void;
  onOpenCharacter: (id: number) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  socket, user, campaigns, characters,
  onNavigate, onEnterCampaign, onOpenCharacter
}) => {
  const { myCampaigns, myCharacters, activeCampaigns, friendsOnline, recentActivity } = useDashboard(socket, campaigns, characters, user);

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '60px', color: 'var(--text-secondary)' }}>
        <p>Inicia sesión para ver el panel.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', animation: 'fadeInUp 0.3s ease', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>

      {/* Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(200,135,42,0.08), rgba(200,135,42,0.02))',
        border: '1px solid var(--border-gold-active)', borderRadius: '12px',
        padding: '30px 35px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,135,42,0.06), transparent 70%)',
          pointerEvents: 'none'
        }} />
        <h1 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 6px 0', fontSize: '1.8rem' }}>
          ¡Bienvenido de vuelta, {user.name}!
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          {activeCampaigns.length > 0
            ? `Tienes ${activeCampaigns.length} campaña${activeCampaigns.length !== 1 ? 's' : ''} activa${activeCampaigns.length !== 1 ? 's' : ''}. ¿Listo para la próxima sesión?`
            : 'Explora tus campañas, revisa tus personajes o crea algo nuevo.'}
        </p>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Tirar Dados', icon: <Dice5 size={20} />, action: () => onNavigate('dice'), color: 'var(--accent-gold)' },
          { label: 'Compendio', icon: <BookOpen size={20} />, action: () => onNavigate('database'), color: '#3b82f6' },
          { label: 'Mis Héroes', icon: <Shield size={20} />, action: () => onNavigate('characters'), color: 'var(--natural-green)' },
          { label: 'Nueva Campaña', icon: <Swords size={20} />, action: () => onNavigate('campaigns'), color: 'var(--combat-red)' },
        ].map(btn => (
          <button key={btn.label} onClick={btn.action}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
              borderRadius: '8px', padding: '16px', cursor: 'pointer',
              color: btn.color, fontWeight: 'bold', fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-raised)'; e.currentTarget.style.borderColor = btn.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {btn.icon} {btn.label}
          </button>
        ))}
      </div>

      {/* Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* My Campaigns */}
        <div className="clipped-frame" style={{ padding: '20px' }}>
          <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 15px 0', fontSize: '0.9rem', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Swords size={16} /> MIS CAMPAÑAS
          </h3>
          {campaigns.length === 0 ? (
            <p style={{ color: '#555', fontSize: '0.85rem', fontStyle: 'italic' }}>
              No tienes campañas aún. ¡Crea una!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {campaigns.slice(0, 5).map((c: any) => (
                <div key={c.id}
                  onClick={() => onEnterCampaign(c)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: 'rgba(200,135,42,0.03)', border: '1px solid var(--border-gold-subtle)',
                    borderRadius: '6px', padding: '10px 14px', cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,135,42,0.08)'; e.currentTarget.style.borderColor = 'var(--border-gold-active)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,135,42,0.03)'; e.currentTarget.style.borderColor = 'var(--border-gold-subtle)'; }}
                >
                  {c.image ? (
                    <img src={c.image} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', fontSize: '1rem' }}>
                      <Swords size={16} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'var(--text-parchment)', fontSize: '0.9rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.name}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                      {c.is_active === 1 ? 'Activa' : 'Inactiva'} · {c.owner === user?.name ? 'DM' : 'Jugador'}
                    </div>
                  </div>
                  {c.is_active === 1 && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--natural-green)', boxShadow: '0 0 6px rgba(45,94,58,0.6)' }} />}
                </div>
              ))}
            </div>
          )}
          <button onClick={() => onNavigate('campaigns')}
            style={{
              marginTop: '12px', width: '100%', padding: '8px',
              background: 'transparent', border: '1px dashed var(--border-color)',
              borderRadius: '6px', color: 'var(--text-secondary)', fontSize: '0.8rem',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.color = 'var(--accent-gold)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            Ver todas las campañas →
          </button>
        </div>

        {/* Recent Activity + Friends */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Recent Activity */}
          <div className="clipped-frame" style={{ padding: '20px' }}>
            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 15px 0', fontSize: '0.9rem', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} /> ACTIVIDAD RECIENTE
            </h3>
            {recentActivity.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#555' }}>
                <Scroll size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
                <p style={{ fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>Aún no hay actividad.</p>
                <p style={{ fontSize: '0.75rem', margin: '4px 0 0 0' }}>Las entradas del diario y los mensajes aparecerán aquí.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentActivity.map((a: any, i: number) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 10px', borderRadius: '6px',
                    background: 'rgba(200,135,42,0.03)',
                    fontSize: '0.8rem', color: 'var(--text-secondary)'
                  }}>
                    {a.icon === 'diary' ? '📝' : a.icon === 'dice' ? '🎲' : '💬'}
                    <span style={{ flex: 1 }}>{a.text}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{a.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Friends Online */}
          <div className="clipped-frame" style={{ padding: '20px' }}>
            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 15px 0', fontSize: '0.9rem', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} /> AMIGOS
            </h3>
            {friendsOnline.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#555' }}>
                <UserPlus size={24} style={{ opacity: 0.3, marginBottom: '8px' }} />
                <p style={{ fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>No hay amigos conectados.</p>
                <p style={{ fontSize: '0.75rem', margin: '4px 0 0 0' }}>Agrega amigos para verlos aquí.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {friendsOnline.map((f: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', borderRadius: '6px', background: 'rgba(200,135,42,0.03)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.online ? 'var(--natural-green)' : '#555', boxShadow: f.online ? '0 0 6px rgba(45,94,58,0.6)' : 'none' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-parchment)' }}>{f.name}</span>
                    {f.online && <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>En línea</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* My Characters */}
      {myCharacters.length > 0 && (
        <div className="clipped-frame" style={{ padding: '20px' }}>
          <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 15px 0', fontSize: '0.9rem', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} /> MIS PERSONAJES
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {myCharacters.map((c: any) => (
              <div key={c.id}
                onClick={() => onOpenCharacter?.(c.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: 'rgba(200,135,42,0.03)', border: '1px solid var(--border-gold-subtle)',
                  borderRadius: '6px', padding: '8px 14px', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,135,42,0.08)'; e.currentTarget.style.borderColor = 'var(--border-gold-active)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,135,42,0.03)'; e.currentTarget.style.borderColor = 'var(--border-gold-subtle)'; }}
              >
                {c.image ? (
                  <img src={c.image} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-gold)' }} />
                ) : (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--gold-dim)', border: '2px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', fontSize: '0.7rem' }}>
                    {c.name?.[0] || '?'}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-parchment)' }}>{c.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Nv. {c.level || 1} · {c.race || ''} {c.class || ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
