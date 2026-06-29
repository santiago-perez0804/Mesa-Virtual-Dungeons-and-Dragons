import sys

path = 'src/renderer/features/compendium/components/CompendiumView.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Imports
content = content.replace("from './TooltipRasgos'", "from '../../../components/TooltipRasgos'")
content = content.replace("from './ui/CartaCompendio'", "from '../../../components/ui/CartaCompendio'")
content = content.replace("from './compendium/DetalleBaseDatos'", "from '../../../components/compendium/DetalleBaseDatos'")
content = content.replace("from './compendium/FormularioCrearBaseDatos'", "from '../../../components/compendium/FormularioCrearBaseDatos'")
content = content.replace("from './compendium/ModalAsistenteClases'", "from '../../../components/compendium/ModalAsistenteClases'")
content = content.replace("from './compendium/ModalSubclase'", "from '../../../components/compendium/ModalSubclase'")
content = content.replace("from './compendium/DetalleRasgo'", "from '../../../components/compendium/DetalleRasgo'")
content = content.replace("from '../utils/formateador'", "from '../../../utils/formateador'")
content = content.replace("from '../modules/compendium/hooks/useFormulariosBaseDatos'", "from '../../../modules/compendium/hooks/useFormulariosBaseDatos'")
content = content.replace("from '../modules/compendium/compendio.traducciones'", "from '../../../modules/compendium/compendio.traducciones'")

# Add our new hooks
content = content.replace("import { useDatabaseForms }", "import { useCompendiumState } from '../hooks/useCompendiumState';\nimport { useCompendiumSave } from '../hooks/useCompendiumSave';\nimport { useDatabaseForms }")

# Replace DatabaseView with CompendiumView
content = content.replace("export const DatabaseView =", "export const CompendiumView =")

# Find where hooks start and end.
# Line 79 is `export const CompendiumView = ({ compendium, socket, userRole, isOverlay, forceOpenId, onCloseOverlay }: any) => {`
start_marker = "export const CompendiumView = ({ compendium, socket, userRole, isOverlay, forceOpenId, onCloseOverlay }: any) => {"
# The end of the old hooks is around `const totalPages = Math.max` which is now in `useCompendiumState`.
# Actually, let's just use regex or split manually.

import re

# We need to remove all the useState and useEffect and functions that we moved to useCompendiumState and useCompendiumSave.
# It's better to just write the new top part of CompendiumView and replace everything from start_marker to `return (`.

new_hooks_section = """
  const formState = useDatabaseForms();
  const { isCreating, setIsCreating, totalPages } = formState; // extract whatever is needed from formState for the UI
  // Wait, we need to extract everything that the UI uses from formState!
  const {
    editingId, setEditingId,
    createType, setCreateType,
    createName, setCreateName,
    createImage, setCreateImage,
    createDesc, setCreateDesc,
    createShortDesc, setCreateShortDesc,
    createSpellLevel, setCreateSpellLevel,
    createSpellComponents, setCreateSpellComponents,
    createSpellRange, setCreateSpellRange,
    createSpellDuration, setCreateSpellDuration,
    createSpellConcentration, setCreateSpellConcentration,
    createHp, setCreateHp,
    createAc, setCreateAc,
    createCr, setCreateCr,
    createSpeed, setCreateSpeed,
    createStats, setCreateStats,
    createAttacks, setCreateAttacks,
    createVuln, setCreateVuln,
    createRes, setCreateRes,
    createImm, setCreateImm,
    createSize, setCreateSize,
    createTraits, setCreateTraits,
    createRarity, setCreateRarity,
    isDamageItem, setIsDamageItem,
    itemAttackBonus, setItemAttackBonus,
    itemDamageFormula, setItemDamageFormula,
    itemDamageType, setItemDamageType,
    createTags, setCreateTags,
    createArmorType, setCreateArmorType,
    createRequiresAttunement, setCreateRequiresAttunement,
    createWeight, setCreateWeight,
    isProtectItem, setIsProtectItem,
    itemDefenseBonus, setItemDefenseBonus,
    itemAttackName, setItemAttackName,
    itemStatMod, setItemStatMod,
    itemStatSelection, setItemStatSelection,
    itemTargetsCount, setItemTargetsCount,
    itemCritDamage, setItemCritDamage,
    setImageZoom,
    isCreatingClass, setIsCreatingClass,
    setImagePosX,
    setImagePosY,
    setClassWizardStep,
    setCName,
    setCDesc,
    setCHitDie,
    setCSubclassLvl,
    setCSubclassTitle,
    setCArmors,
    setCWeapons,
    setCTools,
    setCSaves,
    setCSkills,
    setCSkillsLimit,
    setCResourceName,
    setCResourceProg,
    setSubclassName,
    setSubclassDesc,
    setSubclassTraits,
    isAddingSubclass, setIsAddingSubclass,
    resetForm,
    createRuleCategory, setCreateRuleCategory
  } = formState;

  const compendiumState = useCompendiumState(compendium, isOverlay, forceOpenId);
  const {
    searchTerm, setSearchTerm,
    category, setCategory,
    selectedItem, setSelectedItem,
    currentPage, setCurrentPage,
    expandedRuleCategory, setExpandedRuleCategory,
    selectedClass, setSelectedClass,
    isImportingClasses, setIsImportingClasses,
    expandedTraits, setExpandedTraits,
    editingClassId, setEditingClassId,
    srdDisconnected, setSrdDisconnected,
    classFeatures, setClassFeatures,
    loadingFeatures, setLoadingFeatures,
    selectedFeatureClass, setSelectedFeatureClass,
    selectedFeatureLevel, setSelectedFeatureLevel,
    selectedFeature, setSelectedFeature,
    isEditingFeature, setIsEditingFeature,
    featureFormId, setFeatureFormId,
    featureFormClass, setFeatureFormClass,
    featureFormName, setFeatureFormName,
    featureFormLevel, setFeatureFormLevel,
    featureFormShortDesc, setFeatureFormShortDesc,
    featureFormDesc, setFeatureFormDesc,
    isEditingRule, setIsEditingRule,
    ruleFormId, setRuleFormId,
    ruleFormType, setRuleFormType,
    ruleFormName, setRuleFormName,
    ruleFormDesc, setRuleFormDesc,
    ruleFormSubsections, setRuleFormSubsections,
    hoveredCardId, setHoveredCardId,
    handleSearch,
    handleCategory,
    refreshFeaturesList,
    handleImportSRD,
    filteredCompendium,
    pagedItems,
    totalPages: stateTotalPages,
    classesList,
    allMergedFeatures,
    PAGE_SIZE
  } = compendiumState;

  const compendiumSave = useCompendiumSave({ socket, formState, setIsEditingFeature, refreshFeaturesList, setSelectedFeature });
  const { handleImageUpload, handleSave, handleSaveFeature, handleDeleteFeature } = compendiumSave;
"""

# Now we need to extract `openCreateFeatureForm`, `openEditFeatureForm`, `handleEditClick`, `generateTableMarkdown`, `getValidSubclassLevels`, `getRemainingLevels`, `getFeatureCardSize`, `renderFeatureCrudModal`, `renderRuleCrudModal` from the original code and keep them in `CompendiumView` for now.
# Actually, the functions from `openCreateFeatureForm` to the `return (` statement are from line 272 to 890... It's huge.
# The best way is to use regex to replace lines 80 to 271, and lines 292 to 464.
# Let's write the file lines logic!

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False

import_inserted = False

for i, line in enumerate(lines):
    if line.startswith("import { useDatabaseForms }"):
        new_lines.append("import { useCompendiumState } from '../hooks/useCompendiumState';\n")
        new_lines.append("import { useCompendiumSave } from '../hooks/useCompendiumSave';\n")
        
    line = line.replace("from './TooltipRasgos'", "from '../../../components/TooltipRasgos'")
    line = line.replace("from './ui/CartaCompendio'", "from '../../../components/ui/CartaCompendio'")
    line = line.replace("from './compendium/DetalleBaseDatos'", "from '../../../components/compendium/DetalleBaseDatos'")
    line = line.replace("from './compendium/FormularioCrearBaseDatos'", "from '../../../components/compendium/FormularioCrearBaseDatos'")
    line = line.replace("from './compendium/ModalAsistenteClases'", "from '../../../components/compendium/ModalAsistenteClases'")
    line = line.replace("from './compendium/ModalSubclase'", "from '../../../components/compendium/ModalSubclase'")
    line = line.replace("from './compendium/DetalleRasgo'", "from '../../../components/compendium/DetalleRasgo'")
    line = line.replace("from '../utils/formateador'", "from '../../../utils/formateador'")
    line = line.replace("from '../modules/compendium/hooks/useFormulariosBaseDatos'", "from '../../../modules/compendium/hooks/useFormulariosBaseDatos'")
    line = line.replace("from '../modules/compendium/compendio.traducciones'", "from '../../../modules/compendium/compendio.traducciones'")
    
    if "export const DatabaseView = " in line:
        line = line.replace("export const DatabaseView = ", "export const CompendiumView = ")
        new_lines.append(line)
        new_lines.append(new_hooks_section)
        skip = True
        continue
    
    if skip:
        # We resume copying when we hit `const openCreateFeatureForm = () => {`
        if "const openCreateFeatureForm = () => {" in line:
            skip = False
            new_lines.append(line)
        continue
    
    if "const handleSaveFeature = () => {" in line:
        skip = True
        continue
        
    if skip and "const handleDeleteFeature =" in line:
        continue # still skip
        
    if skip and "const handleImageUpload =" in line:
        continue
        
    if skip and "const handleSave =" in line:
        continue
        
    if skip and "const handleEditClick =" in line:
        skip = False # We keep handleEditClick and below
        
    if not skip:
        new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Done python processing")
