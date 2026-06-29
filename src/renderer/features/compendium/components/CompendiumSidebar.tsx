import { typeIcons, typeLabels } from './CompendiumUtils';

export const CompendiumSidebar = ({ compendiumState, formState, openCreateFeatureForm, userRole, onOpenBooks }: any) => {
  const { category, handleCategory } = compendiumState;
  const { 
    setIsCreating, resetForm, setCreateType, setEditingClassId, setCName, setCDesc, setCHitDie, 
    setCSubclassLvl, setCSubclassTitle, setCArmors, setCWeapons, setCTools, setCSaves, setCSkills, 
    setCSkillsLimit, setCResourceName, setCResourceProg, setClassWizardStep, setIsCreatingClass 
  } = formState;

  return (
    <div style={{ width: 'var(--sidebar-width)', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: 'var(--sidebar-padding)' }}>
      <div style={{ padding: '0 20px', marginBottom: 'var(--sidebar-header-margin)' }}>
        <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: 'var(--sidebar-header-size)', letterSpacing: '2px' }}>BIBLIOTECA</h2>
        <div style={{ width: '40px', height: '2px', background: 'var(--accent-gold)', marginTop: '10px' }} />
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sidebar-btn-gap)', overflowY: 'auto' }} className="custom-scrollbar">
        {['all', 'monster', 'spell', 'item', 'class', 'subclass', 'race', 'subrace', 'condition', 'language', 'features', 'rule'].map(cat => (
          <button
            key={cat}
            onClick={() => handleCategory(cat as any)}
            className="font-cinzel torch-glow"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'left',
              padding: 'var(--sidebar-btn-padding)',
              background: category === cat ? 'rgba(200, 135, 42, 0.1)' : 'transparent',
              color: category === cat ? 'var(--accent-gold)' : 'var(--text-secondary)',
              border: 'none',
              borderLeft: category === cat ? '3px solid var(--accent-gold)' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: 'var(--sidebar-btn-size)',
              transition: 'all 0.2s'
            }}
          >
            {typeIcons[cat]} <span>{typeLabels[cat] || cat}</span>
          </button>
        ))}
      </div>

      <div style={{ padding: '0 20px', marginTop: '8px', marginBottom: '8px' }}>
        <div style={{ height: '1px', background: 'var(--border-subtle)' }} />
      </div>

      <button
        onClick={() => onOpenBooks?.()}
        className="font-cinzel torch-glow"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textAlign: 'left',
          padding: 'var(--sidebar-btn-padding)',
          background: 'transparent',
          color: 'var(--accent-gold)',
          border: 'none',
          borderLeft: '3px solid transparent',
          cursor: 'pointer',
          fontSize: 'var(--sidebar-btn-size)',
          transition: 'all 0.2s',
          marginBottom: '4px'
        }}
      >
        📚 LIBROS
      </button>

      {(userRole === 'admin' || userRole === 'dm') && (() => {
        let btnText = '+ NUEVO';
        let btnAction = () => {
          resetForm();
          setIsCreating(true);
        };

        if (category === 'monster') {
          btnText = '+ NUEVO MONSTRUO';
          btnAction = () => {
            resetForm();
            setCreateType('monster');
            setIsCreating(true);
          };
        } else if (category === 'item') {
          btnText = '+ NUEVO OBJETO';
          btnAction = () => {
            resetForm();
            setCreateType('item');
            setIsCreating(true);
          };
        } else if (category === 'features') {
          btnText = '+ NUEVO RASGO';
          btnAction = () => {
            openCreateFeatureForm();
          };
        } else if (category === 'class') {
          btnText = '+ NUEVA CLASE';
          btnAction = () => {
            setEditingClassId(null);
            setCName('');
            setCDesc('');
            setCHitDie('d8');
            setCSubclassLvl(3);
            setCSubclassTitle('Arquetipo');
            setCArmors([]);
            setCWeapons([]);
            setCTools('');
            setCSaves([]);
            setCSkills([]);
            setCSkillsLimit(2);
            setCResourceName('');
            setCResourceProg('');
            setClassWizardStep(1);
            setIsCreatingClass(true);
          };
        } else if (category === 'spell') {
          btnText = '+ NUEVO HECHIZO';
          btnAction = () => {
            resetForm();
            setCreateType('spell');
            setIsCreating(true);
          };
        } else if (category === 'subclass') {
          btnText = '+ NUEVA SUBCLASE';
          btnAction = () => alert('La creación de subclases por separado no está disponible por ahora. Puedes añadir subclases editando una clase base.');
        } else if (category === 'race') {
          btnText = '+ NUEVA RAZA';
          btnAction = () => alert('La creación de razas personalizadas estará disponible próximamente.');
        } else if (category === 'subrace') {
          btnText = '+ NUEVA SUBRAZA';
          btnAction = () => alert('La creación de subrazas personalizadas estará disponible próximamente.');
        } else if (category === 'condition') {
          btnText = '+ NUEVO ESTADO';
          btnAction = () => alert('La creación de estados y condiciones personalizados estará disponible próximamente.');
        } else if (category === 'language') {
          btnText = '+ NUEVO IDIOMA';
          btnAction = () => alert('La creación de idiomas personalizados estará disponible próximamente.');
        } else if (category === 'all') {
          btnText = '+ NUEVO REGISTRO';
          btnAction = () => alert('Por favor, selecciona una categoría específica (ej. Monstruos, Clases, Rasgos) en el menú lateral para crear un nuevo registro.');
        }

        const isPlaceholder = ['subclass', 'race', 'subrace', 'condition', 'language', 'all'].includes(category);

        return (
          <div style={{ padding: '0 20px', marginTop: 'var(--sidebar-create-margin)' }}>
            <button
              onClick={btnAction}
              className="font-cinzel torch-glow"
              style={{ 
                width: '100%', 
                background: isPlaceholder ? 'rgba(255,255,255,0.03)' : 'var(--accent-gold)', 
                color: isPlaceholder ? 'var(--text-secondary)' : 'white', 
                border: isPlaceholder ? '1px solid var(--border-color)' : 'none', 
                padding: 'var(--sidebar-create-padding)', 
                borderRadius: '4px', 
                fontWeight: 'bold', 
                cursor: 'pointer', 
                fontSize: 'var(--sidebar-create-size)',
                opacity: isPlaceholder ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (isPlaceholder) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (isPlaceholder) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }
              }}
            >
              {btnText}
            </button>
          </div>
        );
      })()}
    </div>
  );
};
