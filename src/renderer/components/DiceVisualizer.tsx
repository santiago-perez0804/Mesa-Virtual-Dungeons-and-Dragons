import React, { useEffect, useState } from 'react';

export type DiceType = "d4" | "d6" | "d8" | "d10" | "d12" | "d20";

export interface DiceVisualizerProps {
  resultado: number;
  tipoDeDado: DiceType;
  onAnimationComplete?: () => void;
  width?: number;
  height?: number;
}

const DiceVisualizer: React.FC<DiceVisualizerProps> = ({
  resultado,
  onAnimationComplete,
  width = 250,
  height = 250,
}) => {
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    // Termina de rodar tras 1.5s
    const timer = setTimeout(() => {
      setAnimating(false);
      
      // Espera 2s para mostrar el resultado y luego llama a complete
      setTimeout(() => {
        if (onAnimationComplete) onAnimationComplete();
      }, 2000);
    }, 1500);
    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <div style={{
      width, height, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: animating ? 'diceRollAnim 1.5s ease-out forwards' : 'none',
      filter: 'drop-shadow(0 0 30px rgba(168, 85, 247, 0.8))'
    }}>
      <style>
        {`
          @keyframes diceRollAnim {
            0% { transform: translateY(-400px) rotate(0deg) scale(0.2); opacity: 0; }
            40% { transform: translateY(40px) rotate(720deg) scale(1.2); opacity: 1; }
            60% { transform: translateY(-60px) rotate(900deg) scale(0.9); }
            80% { transform: translateY(15px) rotate(1080deg) scale(1.05); }
            100% { transform: translateY(0) rotate(1440deg) scale(1); }
          }
          @keyframes resultPop {
            0% { transform: scale(0) rotate(-20deg); opacity: 0; }
            60% { transform: scale(1.4) rotate(10deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
        `}
      </style>
      
      {/* Imagen del dado */}
      <img 
        src="/dice.png" 
        alt="Dice" 
        style={{
          width: '100%', height: '100%', objectFit: 'contain',
          filter: !animating ? 'brightness(0.6) sepia(0.5) hue-rotate(240deg)' : 'brightness(1.2)',
          transition: 'filter 0.4s ease',
          pointerEvents: 'none'
        }} 
      />
      
      {/* Número de resultado */}
      {!animating && (
        <div style={{
          position: 'absolute',
          color: 'white',
          fontSize: `${width * 0.35}px`,
          fontFamily: 'impact, sans-serif',
          letterSpacing: '2px',
          textShadow: '0 0 10px #c084fc, 0 0 20px #a855f7, 0 0 40px #9333ea, 0 5px 5px rgba(0,0,0,0.9), 0 -2px 2px rgba(255,255,255,0.8)',
          animation: 'resultPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          pointerEvents: 'none'
        }}>
          {resultado}
        </div>
      )}
    </div>
  );
};

export default DiceVisualizer;