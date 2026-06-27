import { useGestorPersonajesState } from '../features/personaje/hooks/useGestorPersonajesState';
import { HeroGrid } from '../features/personaje/components/HeroGrid';
import { CharacterCreatorWizard } from '../features/personaje/components/CharacterCreatorWizard';
import { ImageCropModal } from '../features/personaje/components/ImageCropModal';
import { CharacterSheetDetailed } from '../features/personaje/components/CharacterSheetDetailed';

export const CharacterManager = (props: any) => {
  const stateProps = useGestorPersonajesState(props);

  return (
    <div style={{
      ...stateProps.styles.container,
      ...(stateProps.isCreating || stateProps.selectedCharacter 
        ? { padding: 0, flex: 1, margin: 'calc(-1 * var(--main-padding-top, 25px)) -25px -25px -25px', width: 'calc(100% + 50px)', minHeight: 'calc(100vh - 75px)', height: '100%' }
        : { maxWidth: '1000px', margin: '0 auto', padding: '20px' })
    }}>
      {stateProps.isCreating ? (
        <CharacterCreatorWizard {...stateProps} />
      ) : stateProps.selectedCharacter ? (
        <CharacterSheetDetailed {...stateProps} />
      ) : (
        <HeroGrid {...stateProps} />
      )}
      <ImageCropModal {...stateProps} />
    </div>
  );
};
