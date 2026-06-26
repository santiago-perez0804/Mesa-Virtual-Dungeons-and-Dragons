import type { CSSProperties } from 'react';

const stepTitles: Record<number, string> = {
  1: 'ESENCIA',
  2: 'COMPETENCIAS',
  3: 'VITALIDAD'
};

const baseCircleStyle: CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  transition: 'all 0.3s ease'
};

const getCircleStyle = (creationStep: number, step: number): CSSProperties => {
  if (creationStep === step) {
    return {
      ...baseCircleStyle,
      background: 'var(--accent-gold)',
      color: 'var(--bg-base)',
      border: '2px solid var(--accent-gold)',
      boxShadow: '0 0 10px rgba(200, 135, 42, 0.5)'
    };
  }

  if (creationStep > step) {
    return {
      ...baseCircleStyle,
      background: 'transparent',
      color: 'var(--accent-gold)',
      border: '2px solid var(--accent-gold)'
    };
  }

  return {
    ...baseCircleStyle,
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '2px solid var(--border-color)'
  };
};

type CharacterCreationStepperProps = {
  creationStep: number;
  setCreationStep: (step: number) => void;
};

export const CharacterCreationStepper = ({
  creationStep,
  setCreationStep
}: CharacterCreationStepperProps) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', padding: '25px 40px 20px 40px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
      {[1, 2, 3].map(step => {
        const isCompleted = creationStep > step;

        return (
          <div
            key={step}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: isCompleted ? 'pointer' : 'default' }}
            onClick={() => isCompleted && setCreationStep(step)}
          >
            <div className="mono" style={getCircleStyle(creationStep, step)} title={stepTitles[step]}>
              {isCompleted ? '✓' : step}
            </div>
          </div>
        );
      })}
    </div>
  );
};
