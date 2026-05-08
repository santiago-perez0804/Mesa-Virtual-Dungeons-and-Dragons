import { useState } from 'react';

const typeIcons: any = {
  monster: '👾 Monstruos',
  spell: '📜 Hechizos',
  item: '⚔️ Objetos',
  class: '🛡️ Clases',
  subclass: '✨ Subclases',
  race: '👣 Razas',
  subrace: '🧬 Subrazas',
  condition: '⚠️ Estados'
};

const ACTION_TYPES = ['Acción', 'Acción Adicional', 'Reacción', 'Acción Legendaria', 'Acción de Guarida'];
const DAMAGE_TYPES = ['contundente', 'perforante', 'cortante', 'acido', 'fuego', 'frio', 'relampago', 'trueno', 'fuerza', 'veneno', 'necrotico', 'radiante', 'psiquico'];

export const DatabaseView = ({ compendium, socket, userRole }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<'all' | 'monster' | 'spell' | 'item' | 'class' | 'subclass' | 'race' | 'subrace' | 'condition'>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 24;

  // Estados de Creación / Edición
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [createType, setCreateType] = useState<'monster' | 'item' | 'class' | 'subclass' | 'race' | 'subrace' | 'condition'>('monster');
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
  const [isDamageItem, setIsDamageItem] = useState(false);
  const [itemAttackBonus, setItemAttackBonus] = useState('');
  const [itemDamageFormula, setItemDamageFormula] = useState('');
  const [itemDamageType, setItemDamageType] = useState('cortante');
  const [createTags, setCreateTags] = useState<string[]>([]);

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCreateImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleDamage = (type: string, current: string[], setter: (val: string[]) => void) => {
    if (current.includes(type)) {
      setter(current.filter(t => t !== type));
    } else {
      setter([...current, type]);
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
      data.isDamage = isDamageItem;
      if (isDamageItem) {
        data.attackBonus = itemAttackBonus;
        data.damage = itemDamageFormula;
        data.damageType = itemDamageType;
      }
      data.tags = createTags;
    }

    if (editingId) {
      socket.emit('content:update', { id: editingId, name: createName, type: createType, data });
    } else {
      socket.emit('content:create', { name: createName, type: createType, data });
    }

    // Reset
    resetForm();
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setCreateName('');
    setCreateDesc('');
    setCreateImage('');
    setCreateType('monster');
    setCreateHp('10');
    setCreateAc(10);
    setCreateCr('');
    setCreateSpeed('30 ft.');
    setCreateStats({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
    setCreateAttacks([{ name: '', desc: '', isAttack: false, actionType: 'Acción', attackBonus: '', damageFormula: '', damageType: 'cortante', range: '' }]);
    setCreateTraits([{ name: '', desc: '' }]);
    setCreateVuln([]);
    setCreateRes([]);
    setCreateImm([]);
    setIsDamageItem(false);
    setItemAttackBonus('');
    setItemDamageFormula('');
    setItemDamageType('cortante');
    setCreateTags([]);
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
    const validTypes = ['monster', 'item', 'class', 'subclass', 'race', 'subrace', 'condition'];
    setCreateType(validTypes.includes(item.type) ? item.type : 'item');
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
      if (typeof data.armor_class === 'number') parsedAc = data.armor_class;
      else if (Array.isArray(data.armor_class)) parsedAc = data.armor_class[0]?.value ?? 10;
      else if (typeof data.armor_class === 'object' && data.armor_class !== null) parsedAc = data.armor_class.value ?? 10;
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

      const actionsArray = [
        ...(Array.isArray(data.actions) ? data.actions : []),
        ...(Array.isArray(data.legendary_actions) ? data.legendary_actions : []),
        ...(Array.isArray(data.reactions) ? data.reactions : [])
      ];
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
      const traitsArray = Array.isArray(data.traits) ? data.traits : (Array.isArray(data.special_abilities) ? data.special_abilities : []);
      setCreateTraits(traitsArray.length > 0 ? traitsArray : [{ name: '', desc: '' }]);
    } else {
      setCreateRarity(safeStr(data.rarity ?? 'Común'));
      setIsDamageItem(!!data.isDamage);
      setItemAttackBonus(safeStr(data.attackBonus ?? ''));
      setItemDamageFormula(safeStr(data.damage ?? ''));
      setItemDamageType(safeStr(data.damageType ?? 'cortante'));
      setCreateTags(Array.isArray(data.tags) ? data.tags : []);
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
    <div style={{ width: '100%', height: 'calc(100vh - 120px)', background: 'var(--bg-base)', display: 'flex', overflow: 'hidden' }}>
      {/* SIDEBAR DE CATEGORÍAS */}
      <div style={{ width: '220px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: '30px 0' }}>
        <div style={{ padding: '0 20px', marginBottom: '30px' }}>
          <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.2rem', letterSpacing: '2px' }}>BIBLIOTECA</h2>
          <div style={{ width: '40px', height: '2px', background: 'var(--accent-gold)', marginTop: '10px' }} />
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {['all', 'monster', 'spell', 'item', 'class', 'subclass', 'race', 'subrace', 'condition'].map(cat => (
            <button
              key={cat}
              onClick={() => handleCategory(cat as any)}
              className="font-cinzel torch-glow"
              style={{
                textAlign: 'left',
                padding: '12px 25px',
                background: category === cat ? 'rgba(200, 135, 42, 0.1)' : 'transparent',
                color: category === cat ? 'var(--accent-gold)' : 'var(--text-secondary)',
                border: 'none',
                borderLeft: category === cat ? '3px solid var(--accent-gold)' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}
            >
              {cat === 'all' ? 'Ver Todo' : typeIcons[cat]}
            </button>
          ))}
        </div>

        {userRole === 'admin' && (
          <div style={{ padding: '0 20px', marginTop: '20px' }}>
            <button
              onClick={() => { resetForm(); setIsCreating(true); }}
              className="font-cinzel torch-glow"
              style={{ width: '100%', background: 'var(--accent-gold)', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              + NUEVO
            </button>
          </div>
        )}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '60px', position: 'relative' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px', borderBottom: '2px solid var(--border-color)', paddingBottom: '20px' }}>
            <div>
              <h1 className="font-cinzel" style={{ margin: 0, color: 'var(--text-parchment)', fontSize: '3rem', fontWeight: '900' }}>Compendio</h1>
              <p style={{ color: 'var(--text-secondary)', margin: '10px 0 0 0', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Registros oficiales del reino</p>
            </div>
            <div style={{ width: '350px' }}>
              <input 
                className="mono clipped-frame"
                style={{ width: '100%', padding: '12px 20px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }}
                placeholder="Buscar pergamino..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {isCreating ? (
            <div className="clipped-frame" style={{ background: 'var(--bg-surface)', padding: '40px', border: '1px solid var(--border-color)', boxShadow: '0 25px 80px rgba(0,0,0,0.8)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)' }}>{editingId ? 'EDITAR PERGAMINO' : 'NUEVO REGISTRO'}</h2>
                <button onClick={() => setIsCreating(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '2rem', cursor: 'pointer' }}>✕</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div 
                    onClick={() => document.getElementById('imageUpload')?.click()}
                    style={{ width: '100%', aspectRatio: '1/1', background: 'var(--bg-base)', border: '2px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                  >
                    {createImage ? <img src={createImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>📷 Subir Imagen</div>}
                    <input id="imageUpload" type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  </div>
                  
                  <div>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>Tipo de Entrada</label>
                    <select 
                      className="mono"
                      style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }}
                      value={createType} onChange={e => setCreateType(e.target.value as any)}
                    >
                      <option value="monster">Monstruo</option>
                      <option value="item">Objeto</option>
                      <option value="class">Clase</option>
                      <option value="race">Raza</option>
                      <option value="condition">Estado / Condición</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>Nombre</label>
                    <input 
                      className="font-cinzel"
                      style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1.2rem' }}
                      value={createName} onChange={e => setCreateName(e.target.value)} placeholder="Ej: Dragón de Oro..."
                    />
                  </div>

                  <div>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>Descripción</label>
                    <textarea 
                      style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', minHeight: '120px' }}
                      value={createDesc} onChange={e => setCreateDesc(e.target.value)} placeholder="Escribe el lore o reglas..."
                    />
                  </div>

                  {createType === 'item' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isDamageItem ? '15px' : '0' }}>
                          <h4 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)' }}>⚔️ PROPIEDADES DE DAÑO</h4>
                          <button 
                            onClick={() => setIsDamageItem(!isDamageItem)}
                            style={{ background: isDamageItem ? 'var(--combat-red)' : 'var(--natural-green)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.7rem' }}
                          >
                            {isDamageItem ? 'QUITAR' : 'HABILITAR'}
                          </button>
                        </div>
                        {isDamageItem && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                            <div>
                              <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>BONO</label>
                              <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} placeholder="+5" value={itemAttackBonus} onChange={e => setItemAttackBonus(e.target.value)} />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>DAÑO</label>
                              <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} placeholder="1d8+2" value={itemDamageFormula} onChange={e => setItemDamageFormula(e.target.value)} />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>TIPO</label>
                              <select className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={itemDamageType} onChange={e => setItemDamageType(e.target.value)}>
                                {DAMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Categoría / Tag</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {['arma', 'armadura', 'consumible', 'artefacto'].map(tag => (
                            <button
                              key={tag}
                              onClick={() => {
                                if (createTags.includes(tag)) setCreateTags(createTags.filter(t => t !== tag));
                                else setCreateTags([...createTags, tag]);
                              }}
                              className="font-cinzel"
                              style={{
                                flex: 1, padding: '8px', fontSize: '0.7rem', cursor: 'pointer',
                                background: createTags.includes(tag) ? 'var(--accent-gold)' : 'var(--bg-base)',
                                color: createTags.includes(tag) ? 'black' : 'var(--text-secondary)',
                                border: `1px solid ${createTags.includes(tag) ? 'var(--accent-gold)' : 'var(--border-color)'}`
                              }}
                            >
                              {tag.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {createType === 'monster' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                        <div>
                          <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>HP (Ej: 10 o 2d8+2)</label>
                          <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={createHp} onChange={e => setCreateHp(e.target.value)} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>AC</label>
                          <input className="mono" type="number" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={createAc} onChange={e => setCreateAc(+e.target.value)} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>CR</label>
                          <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={createCr} onChange={e => setCreateCr(e.target.value)} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>VELOCIDAD</label>
                          <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={createSpeed} onChange={e => setCreateSpeed(e.target.value)} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                        {Object.entries(createStats).map(([s, v]) => (
                          <div key={s}>
                            <label style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', display: 'block', textAlign: 'center' }}>{s.toUpperCase()}</label>
                            <input className="mono" type="number" style={{ width: '100%', padding: '5px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', textAlign: 'center' }} value={v} onChange={e => setCreateStats({ ...createStats, [s]: +e.target.value })} />
                          </div>
                        ))}
                      </div>

                      {/* RASGOS */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>✨ RASGOS ESPECIALES</label>
                          <button onClick={() => setCreateTraits([...createTraits, { name: '', desc: '' }])} style={{ background: 'var(--natural-green)', color: 'white', border: 'none', padding: '2px 8px', cursor: 'pointer', fontSize: '0.8rem' }}>+ Añadir</button>
                        </div>
                        {createTraits.map((t, i) => (
                          <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input className="font-cinzel" style={{ flex: 1, padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} placeholder="Nombre" value={t.name} onChange={e => {
                              const newTraits = [...createTraits];
                              newTraits[i].name = e.target.value;
                              setCreateTraits(newTraits);
                            }} />
                            <input style={{ flex: 2, padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)' }} placeholder="Descripción" value={t.desc} onChange={e => {
                              const newTraits = [...createTraits];
                              newTraits[i].desc = e.target.value;
                              setCreateTraits(newTraits);
                            }} />
                            <button onClick={() => setCreateTraits(createTraits.filter((_, idx) => idx !== i))} style={{ background: 'transparent', color: 'var(--combat-red)', border: 'none', cursor: 'pointer' }}>✕</button>
                          </div>
                        ))}
                      </div>

                      {/* ACCIONES */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--combat-red)' }}>⚔️ ACCIONES Y ATAQUES</label>
                          <button onClick={() => setCreateAttacks([...createAttacks, { name: '', desc: '', isAttack: false, actionType: 'Acción', attackBonus: '', damageFormula: '', damageType: 'cortante', range: '' }])} style={{ background: 'var(--combat-red)', color: 'white', border: 'none', padding: '2px 8px', cursor: 'pointer', fontSize: '0.8rem' }}>+ Añadir</button>
                        </div>
                        {createAttacks.map((a, i) => (
                          <div key={i} style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', border: '1px solid var(--border-color)', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                              <input className="font-cinzel" style={{ flex: 1, padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} placeholder="Nombre de la acción" value={a.name} onChange={e => {
                                const newAttacks = [...createAttacks];
                                newAttacks[i].name = e.target.value;
                                setCreateAttacks(newAttacks);
                              }} />
                              <select className="mono" style={{ width: '150px', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={a.actionType} onChange={e => {
                                const newAttacks = [...createAttacks];
                                newAttacks[i].actionType = e.target.value;
                                setCreateAttacks(newAttacks);
                              }}>
                                {ACTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                              <button onClick={() => {
                                const newAttacks = [...createAttacks];
                                newAttacks[i].isAttack = !newAttacks[i].isAttack;
                                setCreateAttacks(newAttacks);
                              }} style={{ background: a.isAttack ? 'var(--combat-red)' : 'transparent', color: a.isAttack ? 'white' : 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '0 10px', cursor: 'pointer', fontSize: '0.7rem' }}>ATAQUE</button>
                              <button onClick={() => setCreateAttacks(createAttacks.filter((_, idx) => idx !== i))} style={{ background: 'transparent', color: 'var(--combat-red)', border: 'none', cursor: 'pointer' }}>✕</button>
                            </div>
                            <textarea style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', minHeight: '60px', marginBottom: a.isAttack ? '10px' : '0' }} placeholder="Descripción" value={a.desc} onChange={e => {
                              const newAttacks = [...createAttacks];
                              newAttacks[i].desc = e.target.value;
                              setCreateAttacks(newAttacks);
                            }} />
                            {a.isAttack && (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                <input className="mono" style={{ padding: '5px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} placeholder="Bono (+5)" value={a.attackBonus} onChange={e => {
                                  const newAttacks = [...createAttacks];
                                  newAttacks[i].attackBonus = e.target.value;
                                  setCreateAttacks(newAttacks);
                                }} />
                                <input className="mono" style={{ padding: '5px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} placeholder="Daño (1d8+3)" value={a.damageFormula} onChange={e => {
                                  const newAttacks = [...createAttacks];
                                  newAttacks[i].damageFormula = e.target.value;
                                  setCreateAttacks(newAttacks);
                                }} />
                                <select className="mono" style={{ padding: '5px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={a.damageType} onChange={e => {
                                  const newAttacks = [...createAttacks];
                                  newAttacks[i].damageType = e.target.value;
                                  setCreateAttacks(newAttacks);
                                }}>
                                  {DAMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <input className="mono" style={{ padding: '5px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} placeholder="Alcance (5ft)" value={a.range} onChange={e => {
                                  const newAttacks = [...createAttacks];
                                  newAttacks[i].range = e.target.value;
                                  setCreateAttacks(newAttacks);
                                }} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* VULN / RES / IMM */}
                      <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', display: 'block', marginBottom: '10px' }}>🛡️ RESISTENCIAS Y DEBILIDADES</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          <div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--combat-red)', marginBottom: '5px' }}>VULNERABILIDADES</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                              {DAMAGE_TYPES.map(t => (
                                <button key={t} onClick={() => toggleDamage(t, createVuln, setCreateVuln)} style={{ background: createVuln.includes(t) ? 'var(--combat-red)' : 'transparent', color: createVuln.includes(t) ? 'white' : 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '2px 8px', fontSize: '0.7rem', cursor: 'pointer' }}>{t}</button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', marginBottom: '5px' }}>RESISTENCIAS</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                              {DAMAGE_TYPES.map(t => (
                                <button key={t} onClick={() => toggleDamage(t, createRes, setCreateRes)} style={{ background: createRes.includes(t) ? 'var(--accent-gold)' : 'transparent', color: createRes.includes(t) ? 'white' : 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '2px 8px', fontSize: '0.7rem', cursor: 'pointer' }}>{t}</button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.65rem', color: 'white', marginBottom: '5px' }}>INMUNIDADES</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                              {DAMAGE_TYPES.map(t => (
                                <button key={t} onClick={() => toggleDamage(t, createImm, setCreateImm)} style={{ background: createImm.includes(t) ? 'white' : 'transparent', color: createImm.includes(t) ? 'black' : 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '2px 8px', fontSize: '0.7rem', cursor: 'pointer' }}>{t}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button onClick={handleSave} className="font-cinzel torch-glow" style={{ width: '100%', background: 'var(--accent-gold)', color: 'white', border: 'none', padding: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', letterSpacing: '2px' }}>
                {editingId ? 'GUARDAR CAMBIOS' : 'AÑADIR AL COMPENDIO'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
              {pagedItems.map((item: any) => {
                let data: any = {};
                try {
                  data = item.data ? (typeof item.data === 'string' ? JSON.parse(item.data) : item.data) : {};
                } catch { data = {}; }
                if (!data) data = {};
                return (
                  <div key={item.id} className="clipped-frame torch-glow" 
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'all 0.3s' }} 
                    onClick={() => setSelectedItem(item)}
                  >
                    <div style={{ width: '100%', aspectRatio: '4/3', background: 'var(--bg-base)', overflow: 'hidden', borderBottom: '1px solid var(--border-color)' }}>
                      {data.image ? <img src={data.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: 'var(--text-secondary)' }}>{typeIcons[item.type]?.split(' ')[0]}</div>}
                    </div>
                    <div style={{ padding: '25px', flex: 1 }}>
                      <div className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>{item.type}</div>
                      <h3 className="font-cinzel" style={{ margin: '0 0 12px 0', color: 'var(--text-parchment)', fontSize: '1.3rem' }}>{item.name}</h3>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {(() => {
                          const desc = data.description || data.desc || "";
                          return Array.isArray(desc) ? desc.join('\n') : String(desc);
                        })()}
                      </p>
                    </div>
                    {userRole === 'admin' && (
                      <div style={{ padding: '15px 25px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '15px', background: 'rgba(0,0,0,0.1)' }}>
                        <button onClick={(e) => { e.stopPropagation(); handleEditClick(item); }} className="font-cinzel" style={{ flex: 1, background: 'transparent', color: 'var(--text-parchment)', border: '1px solid var(--border-color)', padding: '8px', cursor: 'pointer', fontSize: '0.75rem' }}>EDITAR</button>
                        <button onClick={(e) => { e.stopPropagation(); if (confirm(`¿Eliminar ${item.name}?`)) socket.emit('content:delete', item.id); }} style={{ background: 'transparent', color: 'var(--combat-red)', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '1.1rem' }}>🗑️</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* PAGINACIÓN */}
          {!isCreating && totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '50px' }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="font-cinzel"
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-parchment)', padding: '8px 20px', cursor: 'pointer' }}
              >ANTERIOR</button>
              <span className="mono" style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>PÁGINA {currentPage} DE {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="font-cinzel"
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: currentPage === totalPages ? 'var(--text-secondary)' : 'var(--text-parchment)', padding: '8px 20px', cursor: 'pointer' }}
              >SIGUIENTE</button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE DETALLE */}
      {selectedItem && (() => {
        let d: any = {};
        try {
          d = selectedItem.data ? (typeof selectedItem.data === 'string' ? JSON.parse(selectedItem.data) : selectedItem.data) : {};
        } catch { d = {}; }
        if (!d) d = {};

        const isMonster = selectedItem.type === 'monster';
        
        let hp = d.hit_points ?? d.hp ?? '—';
        let ac = '—';
        if (d.armor_class !== undefined) {
          if (typeof d.armor_class === 'number') ac = String(d.armor_class);
          else if (Array.isArray(d.armor_class)) ac = String(d.armor_class[0]?.value ?? '—');
          else if (typeof d.armor_class === 'object' && d.armor_class !== null) ac = String(d.armor_class.value ?? '—');
          else ac = String(d.armor_class);
        } else if (d.ac !== undefined) ac = String(d.ac);

        const cr = d.challenge_rating ?? d.cr ?? '—';
        const speed = d.speed ?? '—';
        const desc = d.description ?? d.desc ?? '';

        const stats = [
          { label: 'FUE', val: d.strength ?? d.str ?? 10 },
          { label: 'DES', val: d.dexterity ?? d.dex ?? 10 },
          { label: 'CON', val: d.constitution ?? d.con ?? 10 },
          { label: 'INT', val: d.intelligence ?? d.int ?? 10 },
          { label: 'SAB', val: d.wisdom ?? d.wis ?? 10 },
          { label: 'CAR', val: d.charisma ?? d.cha ?? 10 },
        ];

        const getMod = (val: number) => {
          const mod = Math.floor((val - 10) / 2);
          return mod >= 0 ? `+${mod}` : `${mod}`;
        };

        const renderTags = (title: string, tags: string[]) => {
          if (!tags || tags.length === 0) return null;
          return (
            <div style={{ marginBottom: '15px' }}>
              <div style={{ color: 'var(--accent-gold)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '5px' }}>{title}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {tags.map((t, i) => (
                  <span key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-parchment)' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          );
        };

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '40px' }} onClick={() => setSelectedItem(null)}>
            <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '40px', boxShadow: '0 0 100px rgba(0,0,0,1)' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '2px solid var(--border-color)', paddingBottom: '20px' }}>
                <div>
                  <h1 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '2.8rem', textShadow: '0 0 20px rgba(200, 135, 42, 0.2)' }}>{selectedItem.name}</h1>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '5px' }}>
                    <span className="font-cinzel" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>{selectedItem.type}</span>
                    {isMonster && d.size && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>• {d.size}</span>}
                    {isMonster && cr !== '—' && <span style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: 'bold' }}>• CR {cr}</span>}
                  </div>
                </div>
                <button onClick={() => setSelectedItem(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '2.5rem', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--combat-red)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>✕</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMonster ? '1fr 2fr' : '1fr 2fr', gap: '50px' }}>
                {/* COLUMNA IZQUIERDA: IMAGEN Y STATS BASE */}
                <div>
                  <div style={{ position: 'relative', marginBottom: '30px' }}>
                    <div style={{ width: '100%', aspectRatio: '1/1', background: 'var(--bg-base)', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {d.image ? (
                        <img src={d.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ fontSize: '5rem', opacity: 0.2 }}>{typeIcons[selectedItem.type]?.split(' ')[0]}</div>
                      )}
                    </div>
                    <div style={{ position: 'absolute', bottom: '-10px', left: '10px', right: '10px', height: '4px', background: 'var(--accent-gold)', boxShadow: '0 0 15px var(--accent-gold)' }} />
                  </div>

                  {isMonster && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                          <div style={{ color: 'var(--accent-gold)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Puntos de Vida</div>
                          <div className="mono" style={{ fontSize: '1.4rem', color: 'white', fontWeight: 'bold' }}>{hp}</div>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                          <div style={{ color: 'var(--accent-gold)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Armadura</div>
                          <div className="mono" style={{ fontSize: '1.4rem', color: 'white', fontWeight: 'bold' }}>{ac}</div>
                        </div>
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 15px', border: '1px solid var(--border-color)' }}>
                        <div style={{ color: 'var(--accent-gold)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Velocidad</div>
                        <div className="mono" style={{ fontSize: '0.95rem', color: 'var(--text-parchment)' }}>
                          {typeof speed === 'object' ? Object.entries(speed).map(([k, v]) => `${k} ${v}`).join(', ') : speed}
                        </div>
                      </div>

                      {/* STAT BLOCKS */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '10px' }}>
                        {stats.map(s => (
                          <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '8px 5px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{s.label}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white' }}>{s.val}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>({getMod(s.val)})</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: '15px' }}>
                        {renderTags('Vulnerabilidades', d.vulnerabilities)}
                        {renderTags('Resistencias', d.resistances)}
                        {renderTags('Inmunidades', d.immunities)}
                      </div>
                    </div>
                  )}
                </div>

                {/* COLUMNA DERECHA: DESCRIPCIÓN Y ACCIONES */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {/* LORE / DESCRIPCIÓN */}
                  <section>
                    <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px', fontSize: '1.1rem' }}>📜 REGISTRO</h4>
                    <div style={{ color: 'var(--text-parchment)', lineHeight: '1.8', fontSize: '1rem', whiteSpace: 'pre-wrap', fontStyle: desc ? 'normal' : 'italic', opacity: desc ? 1 : 0.5 }}>
                      {desc ? (Array.isArray(desc) ? desc.join('\n') : String(desc)) : "No hay registros adicionales para esta entrada."}
                    </div>
                  </section>

                  {isMonster && (
                    <>
                      {/* RASGOS */}
                      {(d.traits || d.special_abilities) && (d.traits?.length > 0 || d.special_abilities?.length > 0) && (
                        <section>
                          <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px', fontSize: '1.1rem' }}>✨ RASGOS ESPECIALES</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {(d.traits || d.special_abilities).map((t: any, i: number) => (
                              <div key={i}>
                                <span style={{ fontWeight: 'bold', color: 'var(--accent-gold)', fontSize: '0.95rem' }}>{t.name}.</span>{' '}
                                <span style={{ color: 'var(--text-parchment)', fontSize: '0.9rem', lineHeight: '1.5' }}>{t.desc || t.description}</span>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* ACCIONES */}
                      {d.actions && d.actions.length > 0 && (
                        <section>
                          <h4 className="font-cinzel" style={{ color: 'var(--combat-red)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px', fontSize: '1.1rem' }}>⚔️ ACCIONES</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {d.actions.map((a: any, i: number) => (
                              <div key={i} style={{ background: 'rgba(139, 32, 32, 0.05)', padding: '12px', borderLeft: '3px solid var(--combat-red)' }}>
                                <div style={{ fontWeight: 'bold', color: 'white', fontSize: '1rem', marginBottom: '4px' }}>{a.name}</div>
                                <div style={{ color: 'var(--text-parchment)', fontSize: '0.9rem', lineHeight: '1.5' }}>{a.desc || a.description}</div>
                                {a.isAttack && (
                                  <div style={{ marginTop: '8px', display: 'flex', gap: '15px', fontSize: '0.8rem' }}>
                                    <span className="mono" style={{ color: 'var(--accent-gold)' }}><b>BONO:</b> {a.attackBonus || '+0'}</span>
                                    <span className="mono" style={{ color: 'var(--combat-red)' }}><b>DAÑO:</b> {a.damageFormula} ({a.damageType})</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* ACCIONES LEGENDARIAS */}
                      {d.legendary_actions && d.legendary_actions.length > 0 && (
                        <section>
                          <h4 className="font-cinzel" style={{ color: '#f59e0b', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px', fontSize: '1.1rem' }}>👑 ACCIONES LEGENDARIAS</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {d.legendary_actions.map((a: any, i: number) => (
                              <div key={i}>
                                <span style={{ fontWeight: 'bold', color: '#f59e0b', fontSize: '0.95rem' }}>{a.name}.</span>{' '}
                                <span style={{ color: 'var(--text-parchment)', fontSize: '0.9rem', lineHeight: '1.5' }}>{a.desc || a.description}</span>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </>
                  )}

                  {!isMonster && d.isDamage && (
                    <div style={{ marginTop: '10px', padding: '25px', background: 'rgba(200,135,42,0.05)', border: '1px solid var(--accent-gold)', borderLeft: '5px solid var(--accent-gold)' }}>
                      <h5 className="font-cinzel" style={{ margin: '0 0 15px 0', color: 'var(--accent-gold)', fontSize: '1rem' }}>⚔️ PROPIEDADES DE COMBATE</h5>
                      <div style={{ display: 'flex', gap: '30px' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Bono de Ataque</div>
                          <div className="mono" style={{ fontSize: '1.2rem', color: 'white' }}>{d.attackBonus || '+0'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Daño Base</div>
                          <div className="mono" style={{ fontSize: '1.2rem', color: 'white' }}>{d.damage} <span style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>({d.damageType})</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};

