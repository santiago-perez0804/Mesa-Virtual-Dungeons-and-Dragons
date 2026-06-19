import DiceVisualizer, { type DiceType } from '../VisualizadorDados';

export type { DiceType };

export type CurrentRoll = {
  value: number;
  die: DiceType;
};

export function DiceRollOverlay({ roll, onComplete }: { roll: CurrentRoll; onComplete: () => void }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'all', backgroundColor: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(3px)'
    }}>
      <DiceVisualizer
        resultado={roll.value}
        tipoDeDado={roll.die}
        width={window.innerWidth}
        height={window.innerHeight}
        onAnimationComplete={onComplete}
      />
    </div>
  );
}
