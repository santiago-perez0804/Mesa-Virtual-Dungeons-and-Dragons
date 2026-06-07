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

// ---------------------------------------------------------------------
// 1. Textura Dinámica Generada por Canvas 2D en Memoria
// ---------------------------------------------------------------------
function createDiceFaceTexture(
  number: string,
  textColor: string = '#fbbf24', // Dorado brillante
  bgStyle: 'resin' | 'marble' | 'bone' = 'resin'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Fondo Premium
  if (bgStyle === 'marble') {
    // Estilo mármol: azul/negro profundo con vetas
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)'; // Púrpura traslúcido
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 256, 0);
      ctx.bezierCurveTo(
        Math.random() * 256, Math.random() * 256,
        Math.random() * 256, Math.random() * 256,
        Math.random() * 256, 256
      );
      ctx.stroke();
    }
  } else if (bgStyle === 'bone') {
    // Estilo hueso antiguo: crema con ruido orgánico
    ctx.fillStyle = '#fef3c7'; // crema
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = 'rgba(120, 113, 108, 0.12)';
    for (let i = 0; i < 150; i++) {
      ctx.fillRect(Math.random() * 256, Math.random() * 256, Math.random() * 5, Math.random() * 5);
    }
  } else {
    // Estilo resina translúcida: degradado carmesí/púrpura con destellos
    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 150);
    grad.addColorStop(0, '#581c87'); // violet-900
    grad.addColorStop(0.6, '#311052');
    grad.addColorStop(1, '#0c0714'); // ultra oscuro
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Partículas de brillo (Glitter)
    ctx.fillStyle = 'rgba(236, 72, 153, 0.35)'; // rosa-500
    for (let i = 0; i < 45; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 256, Math.random() * 256, Math.random() * 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Bordes ornamentados dorados
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, 240, 240);

  ctx.strokeStyle = textColor;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(18, 18, 220, 220);

  // Número estilizado
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 115px "Georgia", "Cinzel", "Times New Roman", serif';

  // Sombras del texto para legibilidad máxima en 3D
  ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;

  ctx.fillText(number, 128, 128);

  // Punto indicador para distinguir 6 y 9
  if (number === '6' || number === '9') {
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.arc(128, 195, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

// ---------------------------------------------------------------------
// 2. Geometría D10 Personalizada (Trapezoedro Pentagonal)
// ---------------------------------------------------------------------
function createD10Geometry(): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const h = 0.98; // Escalado a ~0.7x de su tamaño
  const r = 0.73;
  const z_ring = 0.24;

  const vertices: number[] = [
    0, 0, h,    // 0: polo superior
    0, 0, -h,   // 1: polo inferior
  ];

  // Anillo superior (5 vértices)
  for (let i = 0; i < 5; i++) {
    const theta = (i * 2 * Math.PI) / 5;
    vertices.push(r * Math.cos(theta), r * Math.sin(theta), z_ring);
  }

  // Anillo inferior (5 vértices)
  for (let i = 0; i < 5; i++) {
    const phi = ((i + 0.5) * 2 * Math.PI) / 5;
    vertices.push(r * Math.cos(phi), r * Math.sin(phi), -z_ring);
  }

  const indices: number[] = [];

  // 5 caras superiores de cometa (cada una hecha de 2 triángulos)
  for (let i = 0; i < 5; i++) {
    const v_top = 0;
    const r_top = 2 + i;
    const r_bot = 7 + i;
    const r_top_next = 2 + ((i + 1) % 5);

    indices.push(v_top, r_top, r_bot);
    indices.push(v_top, r_bot, r_top_next);
  }

  // 5 caras inferiores de cometa (cada una hecha de 2 triángulos)
  for (let i = 0; i < 5; i++) {
    const v_bot = 1;
    const r_bot = 7 + i;
    const r_top_next = 2 + ((i + 1) % 5);
    const r_bot_next = 7 + ((i + 1) % 5);

    indices.push(v_bot, r_top_next, r_bot);
    indices.push(v_bot, r_bot_next, r_top_next);
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  return geom;
}

// ---------------------------------------------------------------------
// 3. Agrupación y Mapeo UV Dinámico Basado en Normales de Cara
// ---------------------------------------------------------------------
interface GeometryNormalsResult {
  geometry: THREE.BufferGeometry;
  normals: THREE.Vector3[];
}

function groupGeometryByFaceNormal(geometry: THREE.BufferGeometry): GeometryNormalsResult {
  const nonIndexed = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  const posAttr = nonIndexed.getAttribute('position');
  const count = posAttr.count;

  interface FaceGroup {
    normal: THREE.Vector3;
    indices: number[];
  }

  const groupsList: FaceGroup[] = [];
  const epsilon = 0.05; // ~2.8 grados de tolerancia

  for (let i = 0; i < count; i += 3) {
    const vA = new THREE.Vector3().fromBufferAttribute(posAttr, i);
    const vB = new THREE.Vector3().fromBufferAttribute(posAttr, i + 1);
    const vC = new THREE.Vector3().fromBufferAttribute(posAttr, i + 2);

    const edge1 = new THREE.Vector3().subVectors(vB, vA);
    const edge2 = new THREE.Vector3().subVectors(vC, vA);
    const normal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();

    let found = groupsList.find(g => g.normal.angleTo(normal) < epsilon);
    if (!found) {
      found = { normal: normal.clone(), indices: [] };
      groupsList.push(found);
    }
    found.indices.push(i, i + 1, i + 2);
  }

  // Ordenar grupos de forma predecible por coordenadas espaciales
  groupsList.sort((a, b) => {
    if (Math.abs(a.normal.y - b.normal.y) > 0.001) return b.normal.y - a.normal.y;
    if (Math.abs(a.normal.x - b.normal.x) > 0.001) return b.normal.x - a.normal.x;
    return b.normal.z - a.normal.z;
  });

  const newGeometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const normals: number[] = [];

  let currentVertexIndex = 0;
  groupsList.forEach((group, groupIdx) => {
    const start = currentVertexIndex;
    const vertexCount = group.indices.length;

    group.indices.forEach(idx => {
      positions.push(
        posAttr.getX(idx),
        posAttr.getY(idx),
        posAttr.getZ(idx)
      );
      normals.push(
        group.normal.x,
        group.normal.y,
        group.normal.z
      );
    });

    newGeometry.addGroup(start, vertexCount, groupIdx);
    currentVertexIndex += vertexCount;
  });

  newGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  newGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

  // Generar UVs proyectadas en 2D para cada cara de forma modular
  const finalUvs: number[] = [];
  const posAttrNew = newGeometry.getAttribute('position');

  groupsList.forEach((group, groupIdx) => {
    const normal = group.normal;
    let tangent1 = new THREE.Vector3(1, 0, 0);
    if (Math.abs(normal.x) > 0.99) {
      tangent1.set(0, 1, 0);
    }
    const tangent2 = new THREE.Vector3().crossVectors(normal, tangent1).normalize();
    tangent1.crossVectors(tangent2, normal).normalize();

    const start = newGeometry.groups[groupIdx].start;
    const vertexCount = newGeometry.groups[groupIdx].count;

    const local2DPoints: { u: number; v: number }[] = [];
    let minU = Infinity, maxU = -Infinity;
    let minV = Infinity, maxV = -Infinity;

    for (let i = 0; i < vertexCount; i++) {
      const idx = start + i;
      const v = new THREE.Vector3(
        posAttrNew.getX(idx),
        posAttrNew.getY(idx),
        posAttrNew.getZ(idx)
      );
      const u2d = v.dot(tangent1);
      const v2d = v.dot(tangent2);
      local2DPoints.push({ u: u2d, v: v2d });
      if (u2d < minU) minU = u2d;
      if (u2d > maxU) maxU = u2d;
      if (v2d < minV) minV = v2d;
      if (v2d > maxV) maxV = v2d;
    }

    const rangeU = maxU - minU || 1;
    const rangeV = maxV - minV || 1;

    for (let i = 0; i < vertexCount; i++) {
      const p = local2DPoints[i];
      let uNorm = (p.u - minU) / rangeU;
      let vNorm = (p.v - minV) / rangeV;

      // Centrar y dejar un margen decorativo exterior
      uNorm = 0.12 + uNorm * 0.76;
      vNorm = 0.12 + vNorm * 0.76;

      finalUvs.push(uNorm, vNorm);
    }
  });

  newGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(finalUvs, 2));

  return {
    geometry: newGeometry,
    normals: groupsList.map(g => g.normal)
  };
}

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