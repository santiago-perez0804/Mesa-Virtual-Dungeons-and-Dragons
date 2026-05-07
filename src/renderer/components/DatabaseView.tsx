import { useState } from 'react';

const typeIcons: any = {
  monster: '👾 Monstruos',
  spell: '📜 Hechizos',
  item: '⚔️ Objetos'
};

const ACTION_TYPES = ['Acción', 'Acción Adicional', 'Reacción', 'Acción Legendaria', 'Acción de Guarida'];
const DAMAGE_TYPES = ['contundente', 'perforante', 'cortante', 'acido', 'fuego', 'frio', 'relampago', 'trueno', 'fuerza', 'veneno', 'necrotico', 'radiante', 'psiquico'];

export const DatabaseView = ({ compendium, socket, userRole }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<'all' | 'monster' | 'spell' | 'item'>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 24;

  // Estados de Creación / Edición
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [createType, setCreateType] = useState<'monster' | 'item'>('monster');
  const [createName, setCreateName] = useState('');
  const [createImage, setCreateImage] = useState('');
  const [createDesc, setCreateDesc] = useState('');

  // Monster stats
  const [createHp, setCreateHp] = useState<string>('10');
  const [createAc, setCreateAc] = useState(10);
  const [createCr, setCreateCr] = useState('');
  const [createSpeed, setCreateSpeed] = useState('30 ft.');
  const [createStats, setCreateStats] = useState({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
  const [createAttacks, setCreateAttacks] = useState([{ 
    name: '', desc: '', isAttack: false, actionType: 'Acción', 
    attackBonus: '', damageFormula: '', damageType: 'cortante', range: '' 
  }]);
  const [createVuln, setCreateVuln] = useState<string[]>([]);
  const [createRes, setCreateRes] = useState<string[]>([]);
  const [createImm, setCreateImm] = useState<string[]>([]);
  const [createSize, setCreateSize] = useState('Mediano');
  const [createTraits, setCreateTraits] = useState([{ name: '', desc: '' }]);

  // Item stats
  const [createRarity, setCreateRarity] = useState('Común');
  const [createDamage, setCreateDamage] = useState('');

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCreateImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!createName) return alert("El elemento necesita un nombre");

    let data: any = { description: createDesc };
    if (createImage) data.image = createImage;

    if (createType === 'monster') {
      data.hit_points = createHp;
      data.armor_class = createAc;
      data.challenge_rating = createCr;
      data.speed = createSpeed;
      data.strength = createStats.str;
      data.dexterity = createStats.dex;
      data.constitution = createStats.con;
      data.intelligence = createStats.int;
      data.wisdom = createStats.wis;
      data.charisma = createStats.cha;
      data.type = "homebrew_monster";
      data.actions = createAttacks.filter(a => a.name || a.desc);
      data.vulnerabilities = createVuln;
      data.resistances = createRes;
      data.immunities = createImm;
      data.size = createSize;
      data.traits = createTraits.filter(t => t.name || t.desc);
    } else {
      data.rarity = createRarity;
      if (createDamage) data.damage = createDamage;
    }

    if (editingId) {
      socket.emit('content:update', { id: editingId, name: createName, type: createType, data });
    } else {
      socket.emit('content:create', { name: createName, type: createType, data });
    }

    // Reset
    setIsCreating(false);
    setEditingId(null);
    setCreateName('');
    setCreateDesc('');
    setCreateImage('');
    setCreateSize('Mediano');
    setCreateTraits([{ name: '', desc: '' }]);
    setCreateAttacks([{ name: '', desc: '', isAttack: false, actionType: 'Acción', attackBonus: '', damageFormula: '', damageType: 'cortante', range: '' }]);
  };

  const handleEditClick = (item: any) => {
    const safeStr = (v: any) => {
      if (typeof v === 'string') return v;
      if (Array.isArray(v)) return v.join('\n');
      return String(v ?? '');
    };

    setSelectedItem(null);
    setIsCreating(true);
    setEditingId(item.id);
    setCreateType(item.type === 'monster' ? 'monster' : 'item');
    setCreateName(item.name ?? '');

    let data: any = {};
    try {
      if (item.data) {
        data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
      }
    } catch { data = {}; }
    if (!data) data = {};

    setCreateDesc(safeStr(data.description ?? data.desc ?? ''));
    setCreateImage(safeStr(data.image ?? ''));

    if (item.type === 'monster') {
      let parsedAc = 10;
      if (Array.isArray(data.armor_class)) parsedAc = data.armor_class[0]?.value ?? 10;
      else if (typeof data.armor_class === 'number') parsedAc = data.armor_class;
      else parsedAc = parseInt(data.armor_class ?? data.ac) || 10;

      let parsedSpeed = '30 ft.';
      if (data.speed && typeof data.speed === 'object') {
        parsedSpeed = Object.entries(data.speed).map(([k, v]) => `${k} ${v}`).join(', ');
      } else if (data.speed) {
        parsedSpeed = String(data.speed);
      }

      setCreateHp(safeStr(data.hit_points ?? data.hp ?? '10'));
      setCreateAc(parsedAc);
      setCreateCr(safeStr(data.challenge_rating ?? data.cr ?? ''));
      setCreateSpeed(safeStr(parsedSpeed));
      setCreateStats({
        str: parseInt(data.strength ?? data.str) || 10,
        dex: parseInt(data.dexterity ?? data.dex) || 10,
        con: parseInt(data.constitution ?? data.con) || 10,
        int: parseInt(data.intelligence ?? data.int) || 10,
        wis: parseInt(data.wisdom ?? data.wis) || 10,
        cha: parseInt(data.charisma ?? data.cha) || 10,
      });

      const actionsArray = Array.isArray(data.actions) ? data.actions : [];
      const safeActions = actionsArray.map((a: any) => ({
        name: safeStr(a.name ?? ''),
        desc: safeStr(a.desc ?? a.description ?? ''),
        isAttack: !!a.isAttack,
        actionType: safeStr(a.actionType ?? 'Acción'),
        attackBonus: safeStr(a.attackBonus ?? ''),
        damageFormula: safeStr(a.damageFormula ?? ''),
        damageType: safeStr(a.damageType ?? 'cortante'),
        range: safeStr(a.range ?? '')
      }));
      setCreateAttacks(safeActions.length > 0 ? safeActions : [{ name: '', desc: '', isAttack: false, actionType: 'Acción', attackBonus: '', damageFormula: '', damageType: 'cortante', range: '' }]);
      setCreateVuln(Array.isArray(data.vulnerabilities) ? data.vulnerabilities : []);
      setCreateRes(Array.isArray(data.resistances) ? data.resistances : []);
      setCreateImm(Array.isArray(data.immunities) ? data.immunities : []);
      setCreateSize(safeStr(data.size ?? 'Mediano'));
      const traitsArray = Array.isArray(data.traits) ? data.traits : [];
      setCreateTraits(traitsArray.length > 0 ? traitsArray : [{ name: '', desc: '' }]);
    } else {
      setCreateRarity(safeStr(data.rarity ?? 'Común'));
      setCreateDamage(safeStr(data.damage ?? ''));
    }
  };

  const filteredCompendium = compendium.filter((item: any) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || item.type === category;
    return matchesSearch && matchesCategory;
  });
  const totalPages = Math.max(1, Math.ceil(filteredCompendium.length / PAGE_SIZE));
  const pagedItems = filteredCompendium.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearchTerm(val); setCurrentPage(1); };
  const handleCategory = (val: any) => { setCategory(val); setCurrentPage(1); };

  return (
    <div style={{ width: '100%', height: '100%', padding: '40px', overflowY: 'auto', background: '#0a0f1a' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ margin: 0, color: 'white', fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }}>📚 Compendio</h1>
            <p style={{ color: '#94a3b8', margin: '5px 0 0 0' }}>Gestiona hechizos, monstruos y objetos legendarios</p>
          </div>
          {userRole === 'admin' && (
            <button
              onClick={() => { setIsCreating(true); setEditingId(null); }}
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)', transition: 'transform 0.2s' }}
            >
              + Nuevo Elemento
            </button>
          )}
        </div>

        {isCreating ? (
          <div style={{ background: '#0f172a', borderRadius: '24px', padding: '40px', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ margin: 0, color: 'white' }}>{editingId ? 'Editando Elemento' : 'Nuevo Elemento'}</h2>
              <button onClick={() => setIsCreating(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div 
                  onClick={() => document.getElementById('imageUpload')?.click()}
                  style={{ width: '100%', aspectRatio: '1/1', background: '#1e293b', borderRadius: '16px', border: '2px dashed #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                >
                  {createImage ? <img src={createImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ textAlign: 'center', color: '#64748b' }}>📷 Subir Imagen</div>}
                  <input id="imageUpload" type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </div>
                
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>Tipo</label>
                  <select 
                    style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}
                    value={createType} onChange={e => setCreateType(e.target.value as any)}
                  >
                    <option value="monster">Monstruo</option>
                    <option value="item">Objeto</option>
                  </select>
                </div>

                {createType === 'monster' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Vulnerabilidades</label>
                      <input 
                        style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white', fontSize: '0.85rem' }}
                        value={createVuln.join(', ')} 
                        onChange={e => setCreateVuln(e.target.value.split(',').map(s => s.trim()))}
                        placeholder="fuego, frio..."
                      />
                    </div>
                    <div>
                      <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Resistencias</label>
                      <input 
                        style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white', fontSize: '0.85rem' }}
                        value={createRes.join(', ')} 
                        onChange={e => setCreateRes(e.target.value.split(',').map(s => s.trim()))}
                        placeholder="veneno, psiquico..."
                      />
                    </div>
                    <div>
                      <label style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>Inmunidades</label>
                      <input 
                        style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white', fontSize: '0.85rem' }}
                        value={createImm.join(', ')} 
                        onChange={e => setCreateImm(e.target.value.split(',').map(s => s.trim()))}
                        placeholder="necrotico, trueno..."
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>Nombre</label>
                  <input 
                    style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white', fontSize: '1.1rem' }}
                    value={createName} onChange={e => setCreateName(e.target.value)} placeholder="Ej: Dragón Rojo Adulto"
                  />
                </div>

                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>Descripción</label>
                  <textarea 
                    style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white', minHeight: '100px', resize: 'vertical' }}
                    value={createDesc} onChange={e => setCreateDesc(e.target.value)} placeholder="Lore o descripción mecánica..."
                  />
                </div>

                {createType === 'monster' && (
                  <div style={{ borderTop: '1px solid #334155', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* STATS DE MONSTRUO */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>HP (Fórmula o Valor)</label>
                        <input style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white' }} value={createHp} onChange={e => setCreateHp(e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>AC (Clase de Armadura)</label>
                        <input type="number" style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white' }} value={createAc} onChange={e => setCreateAc(parseInt(e.target.value))} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>CR (Nivel de Desafío)</label>
                        <input style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white' }} value={createCr} onChange={e => setCreateCr(e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Velocidad</label>
                        <input style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white' }} value={createSpeed} onChange={e => setCreateSpeed(e.target.value)} />
                      </div>
                    </div>

                    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '16px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                      {Object.keys(createStats).map(s => (
                        <div key={s}>
                          <label style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>{s}</label>
                          <input type="number" style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: 'white', textAlign: 'center' }} value={(createStats as any)[s]} onChange={e => setCreateStats({...createStats, [s]: parseInt(e.target.value)})} />
                        </div>
                      ))}
                    </div>

                    {/* ACCIONES Y ATAQUES */}
                    <div>
                      <h4 style={{ color: '#ef4444', margin: '0 0 15px 0' }}>⚔️ Acciones y Ataques</h4>
                      {createAttacks.map((atk, index) => (
                        <div key={index} style={{ background: '#1e293b', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #334155' }}>
                          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input 
                              style={{ flex: 2, padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', fontWeight: 'bold' }}
                              placeholder="Nombre de la acción" value={atk.name}
                              onChange={e => { const newA = [...createAttacks]; newA[index].name = e.target.value; setCreateAttacks(newA); }}
                            />
                            <select 
                              style={{ padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}
                              value={atk.actionType}
                              onChange={e => { const newA = [...createAttacks]; newA[index].actionType = e.target.value; setCreateAttacks(newA); }}
                            >
                              {ACTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <button onClick={() => {
                              const newA = [...createAttacks];
                              newA[index].isAttack = !newA[index].isAttack;
                              setCreateAttacks(newA);
                            }} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: atk.isAttack ? '#ef4444' : '#444', color: 'white', cursor: 'pointer' }}>
                              {atk.isAttack ? 'Es Ataque' : 'Solo Descr.'}
                            </button>
                            <button onClick={() => setCreateAttacks(createAttacks.filter((_, i) => i !== index))} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }}>✕</button>
                          </div>
                          
                          {atk.isAttack && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                              <input 
                                style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
                                placeholder="+Bono" value={atk.attackBonus}
                                onChange={e => { const newA = [...createAttacks]; newA[index].attackBonus = e.target.value; setCreateAttacks(newA); }}
                              />
                              <input 
                                style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
                                placeholder="Daño (1d8+2)" value={atk.damageFormula}
                                onChange={e => { const newA = [...createAttacks]; newA[index].damageFormula = e.target.value; setCreateAttacks(newA); }}
                              />
                              <select 
                                style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
                                value={atk.damageType}
                                onChange={e => { const newA = [...createAttacks]; newA[index].damageType = e.target.value; setCreateAttacks(newA); }}
                              >
                                {DAMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                              <input 
                                style={{ padding: '8px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: 'white', fontSize: '0.85rem' }}
                                placeholder="Alcance" value={atk.range}
                                onChange={e => { const newA = [...createAttacks]; newA[index].range = e.target.value; setCreateAttacks(newA); }}
                              />
                            </div>
                          )}

                          <textarea 
                            style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', minHeight: '60px', marginBottom: '10px' }}
                            placeholder="Descripción..." value={atk.desc}
                            onChange={e => { const newA = [...createAttacks]; newA[index].desc = e.target.value; setCreateAttacks(newA); }}
                          />
                        </div>
                      ))}
                      <button onClick={() => setCreateAttacks([...createAttacks, { name: '', desc: '', isAttack: false, actionType: 'Acción', attackBonus: '', damageFormula: '', damageType: 'cortante', range: '' }])} style={{ background: '#334155', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>+ Añadir Acción</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button onClick={handleSave} style={{ width: '100%', background: '#3b82f6', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              {editingId ? 'Guardar Cambios' : 'Guardar en el Compendio'}
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              <input 
                style={{ flex: 1, padding: '15px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', fontSize: '1.1rem' }}
                placeholder="Buscar.." value={searchTerm} onChange={(e) => handleSearch(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                {['all', 'monster', 'spell', 'item'].map(cat => (
                  <button key={cat} onClick={() => handleCategory(cat as any)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: category === cat ? '#3b82f6' : '#1e293b', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                    {cat === 'all' ? 'Ver Todo' : typeIcons[cat]}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '12px' }}>
              Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredCompendium.length)} de {filteredCompendium.length} elementos
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {pagedItems.map((item: any) => {
                let data: any = {};
                try {
                  data = item.data ? (typeof item.data === 'string' ? JSON.parse(item.data) : item.data) : {};
                } catch { data = {}; }
                if (!data) data = {};
                return (
                  <div key={item.id} style={{ background: '#0f172a', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }} onClick={() => setSelectedItem(item)}>
                    <div style={{ width: '100%', aspectRatio: '16/9', background: '#1e293b', overflow: 'hidden' }}>
                      {data.image ? <img src={data.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>{typeIcons[item.type]?.split(' ')[0]}</div>}
                    </div>
                    <div style={{ padding: '20px', flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>{item.type}</div>
                      <h3 style={{ margin: '0 0 10px 0', color: 'white', fontSize: '1.2rem' }}>{item.name}</h3>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{data.description || data.desc}</p>
                    </div>
                    {userRole === 'admin' && (
                      <div style={{ padding: '15px', borderTop: '1px solid #334155', display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.02)' }}>
                        <button onClick={(e) => { e.stopPropagation(); handleEditClick(item); }} style={{ flex: 1, background: '#334155', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Editar</button>
                        <button onClick={(e) => { e.stopPropagation(); if (confirm(`¿Eliminar ${item.name}?`)) socket.emit('content:delete', item.id); }} style={{ background: 'transparent', color: '#ef4444', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '1rem' }}>🗑️</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* PAGINACIÓN */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #1e293b' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ background: currentPage === 1 ? '#0f172a' : '#1e293b', color: currentPage === 1 ? '#334155' : 'white', border: '1px solid #334155', padding: '8px 16px', borderRadius: '8px', cursor: currentPage === 1 ? 'default' : 'pointer', fontWeight: 'bold' }}>Anterior</button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .reduce((acc: any[], p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) => p === '...' ? (
                    <span key={`e${i}`} style={{ color: '#475569', padding: '0 4px' }}>...</span>
                  ) : (
                    <button key={p} onClick={() => setCurrentPage(p as number)}
                      style={{ background: currentPage === p ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : '#1e293b', color: 'white', border: currentPage === p ? 'none' : '1px solid #334155', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: currentPage === p ? '800' : '400', boxShadow: currentPage === p ? '0 2px 8px rgba(59,130,246,0.4)' : 'none', minWidth: '38px' }}
                    >{p}</button>
                  ))
                }

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ background: currentPage === totalPages ? '#0f172a' : '#1e293b', color: currentPage === totalPages ? '#334155' : 'white', border: '1px solid #334155', padding: '8px 16px', borderRadius: '8px', cursor: currentPage === totalPages ? 'default' : 'pointer', fontWeight: 'bold' }}>Siguiente &rsaquo;</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL DE DETALLE */}
      {selectedItem && (() => {
        let d: any = {};
        try {
          d = selectedItem.data
            ? (typeof selectedItem.data === 'string' ? JSON.parse(selectedItem.data) : selectedItem.data)
            : {};
        } catch { d = {}; }
        if (!d) d = {};

        const isMonster = selectedItem.type === 'monster';
        // Normaliza campos que vienen de distintas fuentes (SRD vs homebrew)
        const hp   = d.hit_points ?? d.hp ?? d.hitPoints ?? '—';
        const ac   = d.armor_class ?? d.ac ?? d.armorClass ?? '—';
        const spd  = d.speed ?? '—';
        const cr   = d.challenge_rating ?? d.cr ?? d.challengeRating ?? '?';
        const desc = d.description ?? d.desc ?? '';
        const STATS: [string, any][] = [
          ['FUE', d.strength ?? d.str ?? 10],
          ['DES', d.dexterity ?? d.dex ?? 10],
          ['CON', d.constitution ?? d.con ?? 10],
          ['INT', d.intelligence ?? d.int ?? 10],
          ['SAB', d.wisdom ?? d.wis ?? 10],
          ['CAR', d.charisma ?? d.cha ?? 10],
        ];
        const statMod = (v: number) => { const m = Math.floor((v - 10) / 2); return (m >= 0 ? '+' : '') + m; };
        const actions = Array.isArray(d.actions) ? d.actions : [];
        const traits  = Array.isArray(d.traits)  ? d.traits  : [];
        
        // SRD normalization for tags
        const vuln = Array.isArray(d.vulnerabilities) ? d.vulnerabilities : (typeof d.damage_vulnerabilities === 'string' ? d.damage_vulnerabilities.split(', ') : []);
        const res  = Array.isArray(d.resistances) ? d.resistances : (typeof d.damage_resistances === 'string' ? d.damage_resistances.split(', ') : []);
        const imm  = Array.isArray(d.immunities) ? d.immunities : (typeof d.damage_immunities === 'string' ? d.damage_immunities.split(', ') : []);

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setSelectedItem(null)}>
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '24px', width: '100%', maxWidth: '860px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
              {/* HEADER */}
              <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(168,85,247,0.15)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                {d.image && <img src={d.image} alt="" style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {selectedItem.type} • {selectedItem.source || 'Homebrew'}
                  </div>
                  <h2 style={{ margin: 0, color: 'white', fontSize: '1.6rem', fontWeight: '900' }}>{selectedItem.name}</h2>
                  {isMonster && <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '2px' }}>{d.size} • CR {cr}</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {userRole === 'admin' && (
                    <button
                      onClick={() => { setSelectedItem(null); handleEditClick(selectedItem); }}
                      style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)', border: 'none', color: 'white', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', borderRadius: '8px', padding: '8px 14px' }}
                    >✏️ Editar</button>
                  )}
                  <button onClick={() => setSelectedItem(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer', borderRadius: '8px', padding: '8px 12px' }}>✕</button>
                </div>
              </div>

              {/* BODY */}
              <div style={{ padding: '24px 28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {isMonster && (
                  <>
                    {/* Stats vitales */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      {([['❤️ HP', hp], ['🛡️ CA', ac], ['⚡ Vel.', spd]] as [string, any][]).map(([label, val]) => (
                        <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                          <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>{label}</div>
                          <div style={{ color: 'white', fontWeight: '800', fontSize: '1.1rem' }}>{val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Stats base */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '8px' }}>
                      {STATS.map(([label, val]) => (
                        <div key={label} style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                          <div style={{ color: '#a78bfa', fontSize: '0.7rem', fontWeight: '700' }}>{label}</div>
                          <div style={{ color: 'white', fontWeight: '800', fontSize: '1.1rem' }}>{val}</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{statMod(Number(val))}</div>
                        </div>
                      ))}
                    </div>

                    {/* Tags de daño */}
                    {(vuln.length > 0 || res.length > 0 || imm.length > 0) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px' }}>
                        {vuln.length > 0 && <div style={{ fontSize: '0.85rem' }}><span style={{ color: '#ef4444', fontWeight: 'bold' }}>Vulnerabilidades:</span> <span style={{ color: '#cbd5e1' }}>{vuln.join(', ')}</span></div>}
                        {res.length > 0 && <div style={{ fontSize: '0.85rem' }}><span style={{ color: '#fbbf24', fontWeight: 'bold' }}>Resistencias:</span> <span style={{ color: '#cbd5e1' }}>{res.join(', ')}</span></div>}
                        {imm.length > 0 && <div style={{ fontSize: '0.85rem' }}><span style={{ color: '#a78bfa', fontWeight: 'bold' }}>Inmunidades:</span> <span style={{ color: '#cbd5e1' }}>{imm.join(', ')}</span></div>}
                      </div>
                    )}
                  </>
                )}

                {/* Descripción — siempre antes de acciones */}
                {desc && (
                  <div style={{ color: '#94a3b8', lineHeight: '1.7', fontSize: '0.95rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', padding: '14px 16px', borderLeft: '3px solid rgba(168,85,247,0.3)' }}>{desc}</div>
                )}

                {/* Rasgos */}
                {traits.length > 0 && (
                  <div>
                    <h4 style={{ color: '#60a5fa', margin: '0 0 10px 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>✨ Rasgos</h4>
                    {traits.map((t: any, i: number) => (
                      <div key={i} style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#60a5fa', fontWeight: '700' }}>{t.name}. </span>
                        <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{t.desc}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Acciones */}
                {actions.length > 0 && (
                  <div>
                    <h4 style={{ color: '#fbbf24', margin: '0 0 10px 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>⚔️ Acciones</h4>
                    {actions.map((a: any, i: number) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid #fbbf24', borderRadius: '0 8px 8px 0', padding: '10px 14px', marginBottom: '8px' }}>
                        <div style={{ color: '#fbbf24', fontWeight: '700', marginBottom: '4px' }}>
                          {a.name} <span style={{ color: '#64748b', fontSize: '0.75rem' }}>({a.actionType || a.type || 'Acción'})</span>
                        </div>
                        {a.isAttack && <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{a.attackBonus ? `+${a.attackBonus} al golpe` : ''} • {a.damageFormula} {a.damageType} • Alcance: {a.range}</div>}
                        {(a.desc || a.description) && <div style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '4px' }}>{a.desc || a.description}</div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Item-only fields */}
                {!isMonster && d.damage && <div style={{ color: '#fbbf24' }}>Daño: {d.damage}</div>}
                {!isMonster && d.rarity && <div style={{ color: '#a78bfa', fontSize: '0.85rem' }}>Rareza: {d.rarity}</div>}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

