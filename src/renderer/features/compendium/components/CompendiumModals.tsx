export const CompendiumRuleModal = ({ formState, compendiumSave, setIsEditingRule }: any) => {
  const { isEditingRule, ruleFormId, ruleFormName, setRuleFormName, ruleFormType, setRuleFormType, ruleFormDesc, setRuleFormDesc, ruleFormSubsections, setRuleFormSubsections } = formState;
  const { handleSaveRule } = compendiumSave;

  if (!isEditingRule) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, overflowY: 'auto', padding: '40px 0'
    }} onClick={() => setIsEditingRule(false)}>
      <div className="clipped-frame" style={{
        background: 'var(--bg-surface)', border: '2px solid var(--border-color)',
        width: '90%', maxWidth: '800px', padding: '25px', position: 'relative', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 80px rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', gap: '30px'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
          <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.8rem' }}>
            {ruleFormId ? 'EDITAR REGLA' : 'CREAR REGLA'}
          </h2>
          <button onClick={() => setIsEditingRule(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.8rem', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>Título</label>
            <input 
              className="mono font-cinzel" 
              style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none', fontSize: '1.1rem' }} 
              placeholder="Nombre de la regla o sección" 
              value={ruleFormName} 
              onChange={e => setRuleFormName(e.target.value)} 
            />
          </div>

          <div>
            <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>Tipo de Regla</label>
            <select 
              className="mono" 
              style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }} 
              value={ruleFormType} 
              onChange={e => setRuleFormType(e.target.value)}
            >
              <option value="rule">Regla Principal</option>
              <option value="rule_section">Sección de Regla</option>
            </select>
          </div>
          <div>
            <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>Contenido / Descripción</label>
            <textarea 
              className="mono custom-scrollbar" 
              style={{ width: '100%', height: '300px', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none', resize: 'vertical', lineHeight: '1.6' }} 
              placeholder="Escribe el contenido (soporta Markdown)..." 
              value={ruleFormDesc} 
              onChange={e => setRuleFormDesc(e.target.value)} 
            />
          </div>

          {ruleFormType === 'rule' && (
            <div>
              <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>Subsecciones Integradas</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {ruleFormSubsections.map((sub: any, idx: number) => (
                  <div key={idx} style={{ padding: '15px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', position: 'relative' }}>
                    <button onClick={() => setRuleFormSubsections((prev: any) => prev.filter((_: any, i: number) => i !== idx))} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'var(--combat-red)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                    <input 
                      className="mono font-cinzel" 
                      style={{ width: 'calc(100% - 30px)', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none', marginBottom: '10px' }} 
                      placeholder="Título de la subsección" 
                      value={sub.name || ''} 
                      onChange={e => setRuleFormSubsections((prev: any) => { const n = [...prev]; n[idx].name = e.target.value; return n; })} 
                    />
                    <textarea 
                      className="mono custom-scrollbar" 
                      style={{ width: '100%', height: '100px', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none', resize: 'vertical' }} 
                      placeholder="Contenido de la subsección..." 
                      value={sub.desc || sub.description || ''} 
                      onChange={e => setRuleFormSubsections((prev: any) => { const n = [...prev]; n[idx].desc = e.target.value; return n; })} 
                    />
                  </div>
                ))}
                <button onClick={() => setRuleFormSubsections((prev: any) => [...prev, { name: '', desc: '' }])} style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--border-color)', color: 'var(--text-parchment)', padding: '10px', cursor: 'pointer' }}>
                  + AGREGAR SUBSECCIÓN
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <button onClick={() => setIsEditingRule(false)} className="font-cinzel" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', padding: '10px 20px', cursor: 'pointer' }}>CANCELAR</button>
          <button onClick={handleSaveRule} className="font-cinzel torch-glow" style={{ background: 'var(--accent-gold)', border: 'none', color: 'white', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold' }}>
            GUARDAR REGLA
          </button>
        </div>
      </div>
    </div>
  );
};

export const CompendiumFeatureModal = ({ formState, compendiumSave, setIsEditingFeature }: any) => {
  const { isEditingFeature, featureFormId, featureFormName, setFeatureFormName, featureFormClass, setFeatureFormClass, featureFormLevel, setFeatureFormLevel, featureFormShortDesc, setFeatureFormShortDesc, featureFormDesc, setFeatureFormDesc } = formState;
  const { handleSaveFeature } = compendiumSave;

  if (!isEditingFeature) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, overflowY: 'auto', padding: '40px 0'
    }} onClick={() => setIsEditingFeature(false)}>
      <div className="clipped-frame" style={{
        background: 'var(--bg-surface)', border: '2px solid var(--border-color)',
        width: '90%', maxWidth: '600px', padding: '25px', position: 'relative', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 80px rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', gap: '30px'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
          <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.8rem' }}>
            {featureFormId ? 'FORJAR RASGO MODIFICADO' : 'REGISTRAR NUEVO RASGO'}
          </h2>
          <button onClick={() => setIsEditingFeature(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.8rem', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>Nombre del Rasgo</label>
            <input 
              className="mono font-cinzel" 
              style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none', fontSize: '1.1rem' }} 
              placeholder="Ej: Furia, Acción en Oleada..." 
              value={featureFormName} 
              onChange={e => setFeatureFormName(e.target.value)} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div>
              <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>Clase Perteneciente</label>
              <input 
                className="mono font-cinzel" 
                style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }} 
                placeholder="Ej: Guerrero, Bárbaro, Mago..." 
                value={featureFormClass} 
                onChange={e => setFeatureFormClass(e.target.value)} 
              />
            </div>

            <div>
              <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>Nivel de Obtención</label>
              <select 
                className="mono" 
                style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }} 
                value={featureFormLevel} 
                onChange={e => setFeatureFormLevel(parseInt(e.target.value) || 1)}
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map(lvl => (
                  <option key={lvl} value={lvl}>Nivel {lvl}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>Descripción Corta (se muestra al pasar el cursor)</label>
            <input 
              className="mono" 
              style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }} 
              placeholder="Ej: Adoptas un estilo de combate particular como tu especialidad ( CA +1, Duelista +2...)." 
              value={featureFormShortDesc} 
              onChange={e => setFeatureFormShortDesc(e.target.value)} 
            />
          </div>

          <div>
            <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>Descripción de la Habilidad</label>
            <textarea 
              className="mono" 
              style={{ width: '100%', height: '180px', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none', resize: 'none', lineHeight: '1.6' }} 
              placeholder="Escribe la descripción completa del rasgo de clase y sus efectos..." 
              value={featureFormDesc} 
              onChange={e => setFeatureFormDesc(e.target.value)} 
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <button onClick={() => setIsEditingFeature(false)} className="font-cinzel" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', padding: '10px 20px', cursor: 'pointer' }}>CANCELAR</button>
          <button onClick={handleSaveFeature} className="font-cinzel torch-glow" style={{ background: 'var(--accent-gold)', border: 'none', color: 'white', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold' }}>
            {featureFormId ? 'GUARDAR CAMBIOS' : 'FORJAR RASGO'}
          </button>
        </div>
      </div>
    </div>
  );
};
