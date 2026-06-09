import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AlertTriangle } from 'lucide-react';

export type DiceType = "d3" | "d4" | "d6" | "d8" | "d10" | "d12" | "d20";

export interface DiceVisualizerProps {
  resultado: number;
  tipoDeDado: DiceType;
  onAnimationComplete?: () => void;
  width?: number;
  height?: number;
}

import { createDiceFaceTexture, createD10Geometry, groupGeometryByFaceNormal } from '../modules/dice/dados.materiales';
// ---------------------------------------------------------------------
// Componente de Visualizador de Dados 3D React
// ---------------------------------------------------------------------
const DiceVisualizer: React.FC<DiceVisualizerProps> = ({
  resultado,
  tipoDeDado,
  onAnimationComplete,
  width = 500,
  height = 500,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showResultPop, setShowResultPop] = useState(false);
  const [webglError, setWebglError] = useState(false);
  const [debugError, setDebugError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let dieMesh: THREE.Mesh | null = null;
    let materials: THREE.MeshStandardMaterial[] = [];
    let geom: THREE.BufferGeometry | null = null;
    let animationFrameId: number;

    const particles: Array<{
      mesh: THREE.Mesh;
      life: number;
      decay: number;
      velocity: THREE.Vector3;
    }> = [];

    try {
      const containerWidth = containerRef.current.clientWidth || width;
      const containerHeight = containerRef.current.clientHeight || height;

      // 1. Inicializar Escena, Cámara y Renderizador
      scene = new THREE.Scene();
      
      camera = new THREE.PerspectiveCamera(42, containerWidth / containerHeight, 0.1, 100);
      camera.position.set(0, 0, 15); // Mirando desde más lejos (Z = 15) para que el dado se vea más pequeño
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setSize(containerWidth, containerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0); // Fondo totalmente transparente para VTT
      
      // Estilos absolutos para evitar desplazamientos o colapsos de flexbox
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.top = '0';
      renderer.domElement.style.left = '0';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      
      containerRef.current.appendChild(renderer.domElement);

      // 2. Luces
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(ambientLight);

      const mainLight = new THREE.PointLight(0xffffff, 2.5, 30);
      mainLight.position.set(0, 0, 11);
      scene.add(mainLight);

      const rimLight = new THREE.DirectionalLight(0xa855f7, 1.5); // Reflejo púrpura místico
      rimLight.position.set(-5, 5, 6);
      scene.add(rimLight);

      // 3. Crear Geometría y Normales
      let rawGeom: THREE.BufferGeometry;
      const tDado = tipoDeDado === 'd3' ? 'd6' : tipoDeDado; // D3 es un D6 modelado

      switch (tDado) {
        case 'd4':
          rawGeom = new THREE.TetrahedronGeometry(0.85); // Más pequeños
          break;
        case 'd6':
          rawGeom = new THREE.BoxGeometry(1.0, 1.0, 1.0);
          break;
        case 'd8':
          rawGeom = new THREE.OctahedronGeometry(0.92);
          break;
        case 'd10':
          rawGeom = createD10Geometry();
          break;
        case 'd12':
          rawGeom = new THREE.DodecahedronGeometry(0.88);
          break;
        case 'd20':
          rawGeom = new THREE.IcosahedronGeometry(0.92);
          break;
        default:
          rawGeom = new THREE.BoxGeometry(1.0, 1.0, 1.0);
      }

      const grouped = groupGeometryByFaceNormal(rawGeom);
      geom = grouped.geometry;
      const faceNormals = grouped.normals;
      const numFaces = faceNormals.length;

      // Estilo de fondo basado en el tipo de dado para variedad premium
      const styleType = tipoDeDado === 'd20' ? 'resin' : tipoDeDado === 'd10' ? 'marble' : 'bone';

      // 4. Crear un material Standard para cada cara con texturas Canvas
      for (let i = 0; i < numFaces; i++) {
        let displayNum = String(i + 1);
        if (tipoDeDado === 'd3') {
          displayNum = String((i % 3) + 1);
        }

        const texture = createDiceFaceTexture(displayNum, '#fbbf24', styleType);
        
        const mat = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.12,
          metalness: 0.25,
          side: THREE.DoubleSide
        });
        materials.push(mat);
      }

      dieMesh = new THREE.Mesh(geom, materials);
      scene.add(dieMesh);

      // 5. Configuración de Física Inicial
      const cameraFovRad = (camera.fov * Math.PI) / 180;
      let visibleHeight = 2 * camera.position.z * Math.tan(cameraFovRad / 2);
      let visibleWidth = visibleHeight * camera.aspect;
      
      let limitY = visibleHeight / 2;
      let limitX = visibleWidth / 2;
      const rCollide = 0.58; // Radio de colisión proporcional al nuevo tamaño del dado

      // Posicionamiento de lanzamiento (se lanza desde más arriba y atrás)
      dieMesh.position.set(
        -limitX * 0.45 + Math.random() * (limitX * 0.25),
        limitY * 0.65 + Math.random() * (limitY * 0.15),
        5.5 + Math.random() * 2.0
      );

      // Velocidades iniciales para lanzamiento más dinámico y recorrido de mayor distancia
      const vel = new THREE.Vector3(
        5.5 + Math.random() * 5.0,
        -16.5 - Math.random() * 6.0,
        -3.0 - Math.random() * 5.0
      );

      const angVel = new THREE.Vector3(
        (Math.random() - 0.5) * 16, // Reducido drásticamente de 55 a 16 para un giro más elegante y natural
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 16
      );

      const gravity = -29.0; // Gravedad ligeramente menor para un vuelo y rodado más prolongado
      const restitution = 0.65; // Rebote un poco más elástico
      const friction = 0.86; // Fricción ideal para deslizar más trayecto
      const spinTransfer = 1.3; // Reducido de 3.6 a 1.3 para que no gane tanto giro loco al chocar contra las paredes

      // 6. Preparar Fase de Settle (Alineación exacta de la cara resultado)
      let targetFaceIdx = resultado - 1;
      if (tipoDeDado === 'd3') {
        targetFaceIdx = [0, 1, 2, 3, 4, 5].findIndex(idx => (idx % 3) + 1 === resultado);
      }
      if (targetFaceIdx < 0 || targetFaceIdx >= faceNormals.length) {
        targetFaceIdx = 0;
      }
      
      const localNormal = faceNormals[targetFaceIdx].clone();
      // Queremos que el localNormal termine alineado con el eje +Z del mundo (mirando a la cámara)
      const targetQuat = new THREE.Quaternion().setFromUnitVectors(localNormal, new THREE.Vector3(0, 0, 1));

      let timeElapsed = 0;
      let isSettling = false;
      let startSettleQuat = new THREE.Quaternion();
      let startSettleVel = new THREE.Vector3();
      let settleStartTime = 0;
      let screenShake = 0;

      // Evento de redimensión dinámico
      const handleResize = () => {
        if (!containerRef.current || !renderer || !camera) return;
        const w = containerRef.current.clientWidth || width;
        const h = containerRef.current.clientHeight || height;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        
        visibleHeight = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
        visibleWidth = visibleHeight * camera.aspect;
        limitY = visibleHeight / 2;
        limitX = visibleWidth / 2;
      };
      window.addEventListener('resize', handleResize);

      // Partículas al rodar
      const spawnGlitter = (pos: THREE.Vector3) => {
        const pGeom = new THREE.DodecahedronGeometry(0.12);
        const pMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.08 + Math.random() * 0.04, 1.0, 0.65), // Brillo dorado
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending
        });
        const pMesh = new THREE.Mesh(pGeom, pMat);
        pMesh.position.copy(pos).add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.35,
          (Math.random() - 0.5) * 0.35,
          (Math.random() - 0.5) * 0.35
        ));
        scene!.add(pMesh);
        
        particles.push({
          mesh: pMesh,
          life: 1.0,
          decay: 1.6 + Math.random() * 1.5,
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 2.0,
            (Math.random() - 0.5) * 2.0,
            (Math.random() - 0.5) * 2.0
          )
        });
      };

      // 7. Loop de Animación Principal
      let lastTime = performance.now();
      
      const animate = () => {
        try {
          const now = performance.now();
          let dt = (now - lastTime) / 1000;
          if (dt > 0.1) dt = 0.1; // Evitar saltos bruscos
          lastTime = now;

          timeElapsed += dt;

          if (dieMesh && scene && camera && renderer) {
            // Fase 1: Física Libre e Impactos
            if (!isSettling) {
              // Aplicar gravedad
              vel.z += gravity * dt;

              // Integración de Euler para posición
              dieMesh.position.addScaledVector(vel, dt);

              // Integración para rotación angular
              const deltaRotation = new THREE.Quaternion(
                angVel.x * dt * 0.5,
                angVel.y * dt * 0.5,
                angVel.z * dt * 0.5,
                1
              ).normalize();
              dieMesh.quaternion.multiplyQuaternions(deltaRotation, dieMesh.quaternion);

              // Resistencia del aire (Damping)
              vel.x *= Math.exp(-0.35 * dt);
              vel.y *= Math.exp(-0.35 * dt);
              vel.z *= Math.exp(-0.35 * dt);
              angVel.multiplyScalar(Math.exp(-1.15 * dt)); // Damping angular aumentado de 0.6 a 1.15 para frenar el giro rápido y simular resistencia y rodado

              // Colisiones y Rebotes
              // Suelo (Z = rCollide)
              if (dieMesh.position.z < rCollide) {
                dieMesh.position.z = rCollide;
                if (Math.abs(vel.z) > 3.0) {
                  screenShake = Math.min(0.25, Math.abs(vel.z) * 0.016);
                }
                vel.z = -vel.z * restitution;
                
                // Fricción e intercambio a momento rotacional
                vel.x *= friction;
                vel.y *= friction;
                angVel.x += -vel.y * spinTransfer;
                angVel.y += vel.x * spinTransfer;
              }

              // Techo
              if (dieMesh.position.z > 5.5) {
                dieMesh.position.z = 5.5;
                vel.z = -vel.z * restitution;
              }

              // Pared Izquierda
              if (dieMesh.position.x < -limitX + rCollide) {
                dieMesh.position.x = -limitX + rCollide;
                vel.x = -vel.x * restitution;
                angVel.z += vel.y * spinTransfer;
                angVel.y += vel.z * spinTransfer;
              }

              // Pared Derecha
              if (dieMesh.position.x > limitX - rCollide) {
                dieMesh.position.x = limitX - rCollide;
                vel.x = -vel.x * restitution;
                angVel.z -= vel.y * spinTransfer;
                angVel.y -= vel.z * spinTransfer;
              }

              // Pared Inferior
              if (dieMesh.position.y < -limitY + rCollide) {
                dieMesh.position.y = -limitY + rCollide;
                vel.y = -vel.y * restitution;
                angVel.z -= vel.x * spinTransfer;
                angVel.x += vel.z * spinTransfer;
              }

              // Pared Superior
              if (dieMesh.position.y > limitY - rCollide) {
                dieMesh.position.y = limitY - rCollide;
                vel.y = -vel.y * restitution;
                angVel.z += vel.x * spinTransfer;
                angVel.x -= vel.z * spinTransfer;
              }

              // Emitir partículas doradas si la velocidad es alta
              const speed = vel.length();
              if (speed > 2.0 && Math.random() < 0.65) {
                spawnGlitter(dieMesh.position);
              }

              // Detonar fase de reposo/Settle por tiempo (física libre de 2.6s para mayor realismo y duración)
              if (timeElapsed >= 2.6) {
                isSettling = true;
                startSettleQuat.copy(dieMesh.quaternion);
                
                // Asegurar un deslizamiento continuo en el plano horizontal (Z = 0)
                startSettleVel.copy(vel);
                startSettleVel.z = 0; 
                
                const slideSpeed = startSettleVel.length();
                if (slideSpeed < 2.5) {
                  if (slideSpeed < 0.15) {
                    // Si el dado ya se había frenado del todo, le damos un suave empuje hacia el centro
                    startSettleVel.set(-dieMesh.position.x, -dieMesh.position.y, 0).normalize().multiplyScalar(2.5);
                  } else {
                    // Si iba muy lento, conservamos su dirección y le inyectamos velocidad 2.5
                    startSettleVel.normalize().multiplyScalar(2.5);
                  }
                }
                
                // Sincronizar el vector del dado al inicio
                vel.copy(startSettleVel);
                settleStartTime = timeElapsed;
              }
            } else {
              // Fase 2: Interpolación Suave (Slerp) al objetivo de cara
              const settleProgress = Math.min(1.0, (timeElapsed - settleStartTime) / 1.05); // Slerp de 1.05s

              // Usar el método de instancia slerp que es 100% estándar y compatible
              dieMesh.quaternion.copy(startSettleQuat).slerp(targetQuat, settleProgress);

              // Interpolar linealmente la velocidad para que disminuya uniformemente a 0 en perfecta sincronía
              vel.copy(startSettleVel).multiplyScalar(1.0 - settleProgress);
              
              dieMesh.position.addScaledVector(vel, dt);
              
              // Ajustar la altura del dado suavemente al nivel del suelo
              if (dieMesh.position.z > rCollide) {
                dieMesh.position.z += (rCollide - dieMesh.position.z) * 0.15;
              }

              if (settleProgress >= 1.0) {
                dieMesh.quaternion.copy(targetQuat);
                if (animationFrameId) cancelAnimationFrame(animationFrameId);

                // Disparar flash del resultado pop
                setShowResultPop(true);

                // Esperar 1.6 segundos mostrando la puntuación gloriosa y luego cerrar
                setTimeout(() => {
                  window.removeEventListener('resize', handleResize);
                  if (onAnimationComplete) onAnimationComplete();
                }, 1600);
                return;
              }
            }

            // Aplicar efecto de sacudida de pantalla (Screen Shake)
            if (screenShake > 0.002) {
              camera.position.x = (Math.random() - 0.5) * screenShake;
              camera.position.y = (Math.random() - 0.5) * screenShake;
              screenShake *= 0.9;
            } else {
              camera.position.x = 0;
              camera.position.y = 0;
            }

            // Seguir con la luz puntual al dado para brillos realistas
            mainLight.position.copy(dieMesh.position);
            mainLight.position.z += 3.5;

            // Actualizar y decaer partículas activas
            for (let j = particles.length - 1; j >= 0; j--) {
              const p = particles[j];
              p.mesh.position.addScaledVector(p.velocity, dt);
              p.life -= p.decay * dt;
              if (p.life <= 0) {
                scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                (p.mesh.material as THREE.MeshBasicMaterial).dispose();
                particles.splice(j, 1);
              } else {
                p.mesh.scale.setScalar(p.life);
                (p.mesh.material as THREE.MeshBasicMaterial).opacity = p.life * 0.9;
              }
            }

            renderer.render(scene, camera);
          }

          // Agendar el siguiente frame solo si no hay fallos
          animationFrameId = requestAnimationFrame(animate);
        } catch (err: any) {
          console.error("Error catastrófico en loop de animación 3D:", err);
          setDebugError(err?.message + "\n" + err?.stack);
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
          setWebglError(true);
          // Auto-completar tras fallback para no colgar la UI del usuario
          setTimeout(() => {
            if (onAnimationComplete) onAnimationComplete();
          }, 2500);
        }
      };

      // Iniciar el loop de animación asincrónico estándar de forma segura
      animationFrameId = requestAnimationFrame(animate);

      // Limpieza (unmount)
      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);

        // Desalojar recursos para evitar leaks
        particles.forEach(p => {
          scene?.remove(p.mesh);
          p.mesh.geometry.dispose();
          (p.mesh.material as THREE.MeshBasicMaterial).dispose();
        });

        if (dieMesh) {
          scene?.remove(dieMesh);
        }
        if (geom) geom.dispose();
        materials.forEach(m => {
          m.dispose();
          if (m.map) m.map.dispose();
        });

        if (renderer && renderer.domElement && containerRef.current) {
          if (containerRef.current.contains(renderer.domElement)) {
            containerRef.current.removeChild(renderer.domElement);
          }
          renderer.dispose();
        }
      };
    } catch (err: any) {
      console.error("Fallo al inicializar dados 3D (WebGL):", err);
      setDebugError(err?.message + "\n" + err?.stack);
      setWebglError(true);
      // Auto completar tras fallback
      const timer = setTimeout(() => {
        if (onAnimationComplete) onAnimationComplete();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [resultado, tipoDeDado, onAnimationComplete]);

  // Si hay error de debug, mostrarlo con lujo de detalle técnico en pantalla
  if (debugError) {
    return (
      <div style={{
        padding: '24px', background: 'rgba(15, 23, 42, 0.98)', border: '2px solid #ef4444',
        borderRadius: '6px', color: '#fca5a5', fontFamily: 'monospace', fontSize: '11px',
        whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxWidth: '85vw', maxHeight: '85vh', overflow: 'auto',
        boxShadow: '0 0 50px rgba(0,0,0,0.95)', position: 'relative', zIndex: 99999
      }}>
        <h3 className="font-cinzel" style={{ color: '#ef4444', margin: '0 0 12px 0', fontSize: '1.2rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={20} /> ERROR EN DADOS 3D</h3>
        <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#cbd5e1' }}>Hubo una falla en tiempo de ejecución. Detalle técnico:</p>
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {debugError}
        </div>
      </div>
    );
  }

  // Si WebGL falla catastróficamente, fallback elegante
  if (webglError) {
    return (
      <div style={{
        padding: '30px', background: 'rgba(15, 23, 42, 0.95)', border: '2px solid var(--accent-gold)',
        borderRadius: '8px', color: 'white', textAlign: 'center', boxShadow: '0 0 40px rgba(0,0,0,0.8)',
        animation: 'resultPop 0.5s ease-out'
      }}>
        <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 10px 0' }}>¡Tirando Dados!</h3>
        <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#cbd5e1' }}>Resultado de la tirada ({tipoDeDado}):</p>
        <div style={{
          fontSize: '4.5rem', fontWeight: 'bold', textShadow: '0 0 20px rgba(251,191,36,0.8)',
          color: '#fbbf24', fontFamily: 'Georgia, serif'
        }}>
          {resultado}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: `${width}px`, height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <style>
        {`
          @keyframes glowPulse {
            0% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.4); border-color: rgba(251, 191, 36, 0.4); }
            50% { box-shadow: 0 0 50px rgba(251, 191, 36, 0.9); border-color: rgba(251, 191, 36, 1); }
            100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.4); border-color: rgba(251, 191, 36, 0.4); }
          }
          @keyframes resultRise {
            0% { transform: scale(0.3) translateY(40px); opacity: 0; filter: blur(4px); }
            50% { transform: scale(1.2) translateY(-10px); opacity: 1; filter: blur(0); }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
          .result-overlay-pop {
            animation: resultRise 0.65s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            background: linear-gradient(135deg, rgba(30, 27, 75, 0.9), rgba(15, 23, 42, 0.95));
            border: 2px solid var(--accent-gold);
            animation-delay: 0.1s;
          }
        `}
      </style>

      {/* Contenedor del lienzo 3D */}
      <div 
        ref={containerRef} 
        style={{ 
          width: `${width}px`, 
          height: `${height}px`, 
          outline: 'none', 
          cursor: 'not-allowed',
          pointerEvents: 'auto',
          position: 'relative'
        }} 
      />

      {/* Cartelera de Puntuación Flotante al Terminar de Rodar */}
      {showResultPop && (
        <div 
          className="result-overlay-pop"
          style={{
            position: 'absolute',
            padding: '24px 60px',
            borderRadius: '6px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '220px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.85)',
            pointerEvents: 'none', // Permitir que sea intangible
            animation: 'resultRise 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            border: '2px solid #fbbf24'
          }}
        >
          <div className="font-cinzel" style={{ fontSize: '0.8rem', color: '#cbd5e1', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Tiraste {tipoDeDado.toUpperCase()}
          </div>
          <div style={{
            fontSize: '5.5rem',
            fontFamily: '"Georgia", "Cinzel", serif',
            fontWeight: 'bold',
            color: '#fbbf24', // Dorado
            lineHeight: 1,
            textShadow: '0 0 15px rgba(251, 191, 36, 0.85), 0 0 30px rgba(168, 85, 247, 0.6), 0 4px 6px rgba(0,0,0,0.9)'
          }}>
            {resultado}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiceVisualizer;