export const useCompendiumSave = ({ socket, formState, setIsEditingFeature, refreshFeaturesList, setSelectedFeature, setIsEditingRule }: any) => {
  const {
    editingId, createType, createName, createImage, createDesc,
    createShortDesc, createSpellLevel, createSpellComponents, createSpellRange,
    createSpellDuration, createSpellConcentration, createHp, createAc, createCr,
    createSpeed, createStats, createAttacks, createVuln, createRes, createImm,
    createSize, createTraits, createRarity, isDamageItem, itemAttackBonus,
    itemDamageFormula, itemDamageType, createTags, createArmorType,
    createRequiresAttunement, createWeight, isProtectItem, itemDefenseBonus,
    itemAttackName, itemStatMod, itemStatSelection, itemTargetsCount, itemCritDamage,
    setCreateImage, resetForm,
    featureFormClass, featureFormName, featureFormDesc, featureFormLevel, featureFormShortDesc, featureFormId
  } = formState;

  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const backendUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
      const uploadUrl = `${backendUrl}/api/upload?folder=compendium`;
      
      try {
        const res = await fetch(uploadUrl, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          setCreateImage(data.url);
        } else {
          alert('Error al subir imagen: ' + data.error);
        }
      } catch (err) {
        console.error(err);
        alert('Error de conexión al subir la imagen');
      }
    }
  };

  const handleSave = () => {
    if (!createName) return alert("El elemento necesita un nombre");

    let data: any = { description: createDesc };
    if (createImage) {
      data.image = createImage;
    }

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
      data.actions = createAttacks.filter((a: any) => a.name || a.desc);
      data.vulnerabilities = createVuln;
      data.resistances = createRes;
      data.immunities = createImm;
      data.size = createSize;
      data.traits = createTraits.filter((t: any) => t.name || t.desc);
    } else if (createType === 'spell') {
      data.short_description = createShortDesc;
      data.level = createSpellLevel;
      data.components = createSpellComponents;
      data.range = createSpellRange;
      data.duration = createSpellDuration;
      data.concentration = createSpellConcentration;
    } else if (createType === 'rule') {
      data.category = formState.createRuleCategory;
    } else {
      data.rarity = createRarity;
      data.isDamage = isDamageItem;
      data.isProtect = isProtectItem;
      if (isProtectItem) {
        data.defenseBonus = itemDefenseBonus;
      }
      if (isDamageItem) {
        data.attackName = itemAttackName;
        data.attackBonus = itemAttackBonus;
        data.statMod = itemStatMod;
        data.statSelection = itemStatSelection;
        data.targetsCount = itemTargetsCount;
        data.damage = itemDamageFormula;
        data.damageType = itemDamageType;
        data.critDamage = itemCritDamage;
      }
      data.tags = createTags;
      if (createTags.includes('armadura')) {
        data.armorType = createArmorType;
      }
      data.requiresAttunement = createRequiresAttunement;
      data.weight = createWeight;
    }

    if (editingId) {
      socket.emit('content:update', { id: editingId, name: createName, type: createType, data });
    } else {
      socket.emit('content:create', { name: createName, type: createType, data });
    }

    // Reset
    resetForm();
  };

  const handleSaveFeature = () => {
    if (!featureFormClass || !featureFormName || !featureFormDesc) {
      alert("Todos los campos son requeridos.");
      return;
    }

    const host = window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin;
    const payload = {
      class_name: featureFormClass,
      feature_name: featureFormName,
      level_acquired: featureFormLevel,
      description: featureFormDesc,
      short_description: featureFormShortDesc
    };

    if (featureFormId && !isNaN(Number(featureFormId))) {
      fetch(`${host}/api/class-features/${featureFormId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => {
        if (!res.ok) throw new Error("Error al actualizar el rasgo");
        return res.json();
      })
      .then(() => {
        setIsEditingFeature(false);
        refreshFeaturesList();
      })
      .catch(err => alert(err.message));
    } else {
      fetch(`${host}/api/class-features`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => {
        if (!res.ok) throw new Error("Error al crear el rasgo");
        return res.json();
      })
      .then(() => {
        setIsEditingFeature(false);
        refreshFeaturesList();
      })
      .catch(err => alert(err.message));
    }
  };

  const handleDeleteFeature = (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este rasgo de clase de forma permanente?")) return;

    const host = window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin;
    fetch(`${host}/api/class-features/${id}`, {
      method: 'DELETE'
    })
    .then(res => {
      if (!res.ok) throw new Error("Error al eliminar el rasgo");
      return res.json();
    })
    .then(() => {
      refreshFeaturesList();
      setSelectedFeature(null);
    })
    .catch(err => alert(err.message));
  };

  const handleSaveRule = () => {
    const { ruleFormName, ruleFormDesc, ruleFormSubsections, ruleFormId, ruleFormType } = formState;
    if (!ruleFormName) return alert("El nombre es requerido.");
    const data = {
      description: ruleFormDesc,
      subsections: ruleFormSubsections.filter((s: any) => s.name || s.desc)
    };

    if (ruleFormId) {
      socket.emit('content:update', { id: ruleFormId, name: ruleFormName, type: ruleFormType, data });
    } else {
      socket.emit('content:create', { name: ruleFormName, type: ruleFormType, data });
    }
    
    setIsEditingRule(false);
  };

  return {
    handleImageUpload,
    handleSave,
    handleSaveFeature,
    handleDeleteFeature,
    handleSaveRule
  };
};
