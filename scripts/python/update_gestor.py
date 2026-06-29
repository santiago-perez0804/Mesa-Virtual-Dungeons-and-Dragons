import io

path = 'src/renderer/components/GestorPersonajes.tsx'

new_content = """import React from 'react';
import { useGestorPersonajesState } from '../features/personaje/hooks/useGestorPersonajesState';
import { HeroGrid } from '../features/personaje/components/HeroGrid';
import { CharacterCreatorWizard } from '../features/personaje/components/CharacterCreatorWizard';
import { ImageCropModal } from '../features/personaje/components/ImageCropModal';
import { CharacterSheetDetailed } from '../features/personaje/components/CharacterSheetDetailed';

export const CharacterManager = (props: any) => {
  const stateProps = useGestorPersonajesState(props);

  return (
    <div style={stateProps.styles.container}>
      <HeroGrid {...stateProps} />
      <CharacterCreatorWizard {...stateProps} />
      <ImageCropModal {...stateProps} />
      <CharacterSheetDetailed {...stateProps} />
    </div>
  );
};
"""

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("GestorPersonajes.tsx updated!")
