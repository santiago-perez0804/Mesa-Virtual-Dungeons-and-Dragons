/**
 * DiceVisualizer.tsx
 * Componente React en TypeScript para visualización 3D de dados con física simulada.
 *
 * Dependencias:
 *   npm install three
 *   npm install -D @types/three
 */

// Usamos "import type" para traer FC y CSSProperties como tipos puros
import type { FC, CSSProperties } from "react"; 
import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

export type DiceType = "d4" | "d6" | "d8" | "d10" | "d12" | "d20";

export type PhysicsPhase =
  | "rolling"
  | "readyToSettle"
  | "waitingToSettle"
  | "settling"
  | "done";

export interface DiceVisualizerProps {
  /** Número que debe quedar en la cara superior al detenerse el dado. */
  resultado: number;
  /** Tipo de dado a renderizar. */
  tipoDeDado: DiceType;
  /** Callback disparado cuando la animación termina completamente. */
  onAnimationComplete?: () => void;
  /** Ancho del canvas en px (default: 400). */
  width?: number;
  /** Alto del canvas en px (default: 400). */
  height?: number;
}

interface ParticleVelocity {
  x: number;
  y: number;
  z: number;
  life: number;
}

interface RendererState {
  renderer: THREE.WebGLRenderer;
  animFrameId: number;
}

// ─────────────────────────────────────────────────────────────
// MAPA DE CARAS
// Cada entrada define el THREE.Euler que pone esa cara mirando
// hacia +Y. Es el núcleo del "truco": conocemos la orientación
// final deseada antes de que empiece la física.
// ─────────────────────────────────────────────────────────────

type FaceRotationMap = Partial<Record<number, THREE.Euler>>;
type DiceFaceRotations = Partial<Record<DiceType, FaceRotationMap>>;

const FACE_ROTATIONS: DiceFaceRotations = {
  d6: {
    1: new THREE.Euler(0, 0, 0),
    2: new THREE.Euler(Math.PI / 2, 0, 0),
    3: new THREE.Euler(0, 0, -Math.PI / 2),
    4: new THREE.Euler(0, 0, Math.PI / 2),
    5: new THREE.Euler(-Math.PI / 2, 0, 0),
    6: new THREE.Euler(Math.PI, 0, 0),
  },
  d20: {
    1:  new THREE.Euler(0, 0, 0),
    2:  new THREE.Euler(1.107, 0, 0),
    3:  new THREE.Euler(1.107, (Math.PI * 2) / 3, 0),
    4:  new THREE.Euler(1.107, (Math.PI * 4) / 3, 0),
    5:  new THREE.Euler(2.034, Math.PI / 5, 0),
    6:  new THREE.Euler(2.034, (Math.PI * 3) / 5, 0),
    7:  new THREE.Euler(2.034, Math.PI, 0),
    8:  new THREE.Euler(2.034, (Math.PI * 7) / 5, 0),
    9:  new THREE.Euler(2.034, (Math.PI * 9) / 5, 0),
    10: new THREE.Euler(Math.PI / 2, Math.PI / 5, 0),
    11: new THREE.Euler(Math.PI / 2, (Math.PI * 3) / 5, 0),
    12: new THREE.Euler(Math.PI / 2, Math.PI, 0),
    13: new THREE.Euler(Math.PI / 2, (Math.PI * 7) / 5, 0),
    14: new THREE.Euler(Math.PI / 2, (Math.PI * 9) / 5, 0),
    15: new THREE.Euler(Math.PI - 2.034, Math.PI / 5, 0),
    16: new THREE.Euler(Math.PI - 2.034, (Math.PI * 3) / 5, 0),
    17: new THREE.Euler(Math.PI - 2.034, Math.PI, 0),
    18: new THREE.Euler(Math.PI - 2.034, (Math.PI * 7) / 5, 0),
    19: new THREE.Euler(Math.PI - 2.034, (Math.PI * 9) / 5, 0),
    20: new THREE.Euler(Math.PI, 0, 0),
  },
};

const FACE_COUNT: Record<DiceType, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
};

// ─────────────────────────────────────────────────────────────
// GENERADOR DE GEOMETRÍA
// ─────────────────────────────────────────────────────────────

function createDiceGeometry(type: DiceType): THREE.BufferGeometry {
  switch (type) {
    case "d6":  return new THREE.BoxGeometry(1, 1, 1);
    case "d20": return new THREE.IcosahedronGeometry(0.7, 0);
    case "d12": return new THREE.DodecahedronGeometry(0.7, 0);
    case "d8":  return new THREE.OctahedronGeometry(0.7, 0);
    case "d4":  return new THREE.TetrahedronGeometry(0.8, 0);
    case "d10": return new THREE.IcosahedronGeometry(0.7, 0); // Se agrega el d10 aquí
    default:    return new THREE.IcosahedronGeometry(0.7, 0); // Siempre es bueno tener un fallback
  }
}

// ─────────────────────────────────────────────────────────────
// TEXTURAS DE CARAS (canvas 2D con números grabados)
// ─────────────────────────────────────────────────────────────

function createFaceTexture(
  label: number | string,
  faceCount: number
): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo obtener el contexto 2D del canvas");

  // Fondo tipo resina con gradiente radial
  const gradient = ctx.createRadialGradient(
    size * 0.4, size * 0.4, size * 0.05,
    size * 0.5, size * 0.5, size * 0.7
  );
  gradient.addColorStop(0, "#3a1f6e");
  gradient.addColorStop(0.6, "#1a0a3d");
  gradient.addColorStop(1, "#0d0620");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Brillo interno de resina
  const shine = ctx.createRadialGradient(
    size * 0.3, size * 0.3, 0,
    size * 0.3, size * 0.3, size * 0.5
  );
  shine.addColorStop(0, "rgba(180, 140, 255, 0.25)");
  shine.addColorStop(1, "rgba(180, 140, 255, 0)");
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, size, size);

  // Borde suave
  ctx.strokeStyle = "rgba(180, 140, 255, 0.4)";
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, size - 16, size - 16);

  // Número grabado
  const fontSize = faceCount > 12 ? 100 : 120;
  ctx.font = `bold ${fontSize}px 'Georgia', serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Sombra del grabado (efecto inset)
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillText(String(label), size / 2 + 3, size / 2 + 3);

  // Número principal en plateado brillante
  const numGradient = ctx.createLinearGradient(
    size / 2 - 40, size / 2 - 40,
    size / 2 + 40, size / 2 + 40
  );
  numGradient.addColorStop(0, "#ffffff");
  numGradient.addColorStop(0.4, "#c8a8ff");
  numGradient.addColorStop(1, "#8060d0");
  ctx.fillStyle = numGradient;
  ctx.fillText(String(label), size / 2, size / 2);

  return new THREE.CanvasTexture(canvas);
}

function createDiceMaterial(
  type: DiceType
): THREE.MeshPhysicalMaterial | THREE.MeshPhysicalMaterial[] {
  const faceCount = FACE_COUNT[type];
  const physicalProps: Partial<THREE.MeshPhysicalMaterialParameters> = {
    roughness: 0.15,
    metalness: 0.0,
    transmission: 0.3,
    thickness: 0.5,
    envMapIntensity: 1.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  };

  if (type === "d6") {
    // BoxGeometry usa un array de 6 materiales (uno por cara)
    return Array.from({ length: 6 }, (_, i) =>
      new THREE.MeshPhysicalMaterial({
        map: createFaceTexture(i + 1, faceCount),
        ...physicalProps,
      })
    );
  }

  return new THREE.MeshPhysicalMaterial({
    color: 0x2a0f5e,
    ...physicalProps,
    transmission: 0.25,
    envMapIntensity: 1.5,
    emissive: new THREE.Color(0x1a0040),
    emissiveIntensity: 0.2,
  });
}

// ─────────────────────────────────────────────────────────────
// FÍSICA SIMPLE
// En producción: reemplazar por cannon-es y aplicar la rotación
// compensatoria en el evento "sleep" del RigidBody.
// ─────────────────────────────────────────────────────────────

class SimpleDicePhysics {
  public pos: THREE.Vector3;
  public vel: THREE.Vector3;
  public angularVel: THREE.Vector3;
  public rotation: THREE.Quaternion;
  public settleTime: number = 0;

  private readonly gravity: number = -12;
  private readonly restitution: number = 0.45;
  private readonly friction: number = 0.78;
  private readonly angularDamping: number = 0.88;
  private readonly linearDamping: number = 0.97;
  private readonly floorY: number = 0.5;
  private readonly SETTLE_DURATION: number = 0.8;

  constructor() {
    this.pos = new THREE.Vector3(0, 4, 0);
    this.vel = new THREE.Vector3(
      (Math.random() - 0.5) * 3,
      2 + Math.random() * 2,
      (Math.random() - 0.5) * 3
    );
    this.angularVel = new THREE.Vector3(
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 15
    );
    this.rotation = new THREE.Quaternion();
  }

  /**
   * Avanza la simulación un paso.
   * @returns El siguiente estado de la fase de física.
   */
  public step(
    dt: number,
    targetQuaternion: THREE.Quaternion,
    phase: PhysicsPhase
  ): PhysicsPhase {
    if (phase === "settling") {
      this.settleTime += dt;
      const t = Math.min(this.settleTime / this.SETTLE_DURATION, 1);
      // Easing cúbico in-out: el movimiento parece desaceleración natural
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      this.rotation.slerp(targetQuaternion, ease * 0.08);
      return t >= 1 ? "done" : "settling";
    }

    // Gravedad
    this.vel.y += this.gravity * dt;

    // Posición
    this.pos.addScaledVector(this.vel, dt);

    // Rebote en el suelo
    if (this.pos.y <= this.floorY) {
      this.pos.y = this.floorY;
      if (Math.abs(this.vel.y) > 0.3) {
        this.vel.y = -this.vel.y * this.restitution;
        this.vel.x *= this.friction;
        this.vel.z *= this.friction;
        this.angularVel.x += (Math.random() - 0.5) * 3;
        this.angularVel.z += (Math.random() - 0.5) * 3;
      } else {
        this.vel.y = 0;
        this.vel.x *= 0.85;
        this.vel.z *= 0.85;
      }
    }

    // Paredes invisibles
    const wall = 3;
    if (Math.abs(this.pos.x) > wall) {
      this.vel.x *= -0.6;
      this.pos.x = Math.sign(this.pos.x) * wall;
    }
    if (Math.abs(this.pos.z) > wall) {
      this.vel.z *= -0.6;
      this.pos.z = Math.sign(this.pos.z) * wall;
    }

    // Amortiguación
    this.vel.multiplyScalar(this.linearDamping);
    this.angularVel.multiplyScalar(this.angularDamping);

    // Rotación por velocidad angular
    const angleSpeed = this.angularVel.length();
    if (angleSpeed > 0.0001) {
      const axis = this.angularVel.clone().normalize();
      const deltaRotation = new THREE.Quaternion().setFromAxisAngle(
        axis,
        angleSpeed * dt
      );
      this.rotation.premultiply(deltaRotation).normalize();
    }

    const speed = this.vel.length() + this.angularVel.length();
    const onGround = this.pos.y <= this.floorY + 0.05;
    return speed < 0.8 && onGround ? "readyToSettle" : "rolling";
  }
}

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────

const DiceVisualizer: FC<DiceVisualizerProps> = ({
  resultado,
  tipoDeDado = "d20",
  onAnimationComplete,
  width = 400,
  height = 400,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<Partial<RendererState>>({});

  const handleComplete = useCallback(() => {
    onAnimationComplete?.();
  }, [onAnimationComplete]);

  useEffect(() => {
    if (!resultado || !mountRef.current) return;

    // ── ESCENA ──────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080412);
    scene.fog = new THREE.Fog(0x080412, 8, 20);

    // ── RENDERER ────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);

    // ── CÁMARA ──────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 5, 7);
    camera.lookAt(0, 1, 0);

    // ── ILUMINACIÓN ─────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x2010a0, 0.8));

    const mainLight = new THREE.SpotLight(0xffffff, 3);
    mainLight.position.set(3, 8, 4);
    mainLight.angle = 0.4;
    mainLight.penumbra = 0.5;
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(2048, 2048);
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0x8040ff, 1.5, 12);
    fillLight.position.set(-4, 3, -2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x0060ff, 1.0, 10);
    rimLight.position.set(0, 2, -5);
    scene.add(rimLight);

    // ── SUELO ───────────────────────────────────────────────
    const floorGeo = new THREE.PlaneGeometry(12, 12);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0518,
      roughness: 0.9,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Círculo de enfoque bajo el dado
    const ringGeo = new THREE.RingGeometry(0.8, 1.2, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x6030c0,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>(
      ringGeo,
      ringMat
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);

    // ── DADO ────────────────────────────────────────────────
    const geometry = createDiceGeometry(tipoDeDado);
    const material = createDiceMaterial(tipoDeDado);
    const dice = new THREE.Mesh(
      geometry,
      material as THREE.Material | THREE.Material[]
    );
    dice.castShadow = true;
    dice.receiveShadow = true;
    scene.add(dice);

    const diceGlow = new THREE.PointLight(0x9060ff, 0.5, 3);
    scene.add(diceGlow);

    // ── PARTÍCULAS DE MAGIA ──────────────────────────────────
    const PARTICLE_COUNT = 60;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const particleVels: ParticleVelocity[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      particleVels.push({
        x: (Math.random() - 0.5) * 0.04,
        y: Math.random() * 0.03 + 0.01,
        z: (Math.random() - 0.5) * 0.04,
        life: Math.random(),
      });
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xaa80ff,
      size: 0.04,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── FÍSICA Y ROTACIÓN OBJETIVO ───────────────────────────
    const physics = new SimpleDicePhysics();

    const faceMap: FaceRotationMap =
      FACE_ROTATIONS[tipoDeDado] ?? FACE_ROTATIONS["d20"] ?? {};
    const baseEuler: THREE.Euler = faceMap[resultado]?.clone() ?? new THREE.Euler(0, 0, 0);
    // Variación Y aleatoria: misma cara, orientación siempre distinta
    baseEuler.y += Math.random() * Math.PI * 2;
    const targetQuaternion = new THREE.Quaternion().setFromEuler(baseEuler);

    // ── LOOP DE ANIMACIÓN ────────────────────────────────────
    let phase: PhysicsPhase = "rolling";
    let lastTime: number | null = null;
    let animFrameId: number;
    let completed = false;
    let settleStartTime = 0;
    const SETTLE_DELAY = 0.3; // segundos de pausa antes de corregir rotación

    function animate(timestamp: number): void {
      animFrameId = requestAnimationFrame(animate);

      const dt = lastTime
        ? Math.min((timestamp - lastTime) / 1000, 0.05)
        : 0.016;
      lastTime = timestamp;

      if (phase === "rolling") {
        const next = physics.step(dt, targetQuaternion, "rolling");
        if (next === "readyToSettle") {
          phase = "waitingToSettle";
          settleStartTime = timestamp;
        }
      } else if (phase === "waitingToSettle") {
        // Desaceleración orgánica + micro-corrección imperceptible
        physics.vel.multiplyScalar(0.9);
        physics.angularVel.multiplyScalar(0.85);
        physics.rotation.slerp(targetQuaternion, 0.02);

        if ((timestamp - settleStartTime) / 1000 > SETTLE_DELAY) {
          phase = "settling";
        }
      } else if (phase === "settling") {
        const next = physics.step(dt, targetQuaternion, "settling");
        if (next === "done" && !completed) {
          completed = true;
          setTimeout(() => {
            cancelAnimationFrame(animFrameId);
            handleComplete();
          }, 400);
        }
      }

      // Sincronizar mesh con física
      dice.position.copy(physics.pos);
      dice.quaternion.copy(physics.rotation);
      diceGlow.position.copy(physics.pos);

      // Pulso del anillo
      const ringScale =
        phase === "done"
          ? 1
          : 1 + Math.sin(timestamp * 0.005) * (phase === "rolling" ? 0.05 : 0.02);
      ring.scale.setScalar(ringScale);
      ring.material.opacity = phase === "rolling" ? 0.2 : 0.5;

      // Actualizar partículas
      const posAttr = particleGeo.attributes["position"] as THREE.BufferAttribute;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const v = particleVels[i];
        posAttr.array[i * 3]     += v.x;
        posAttr.array[i * 3 + 1] += v.y;
        posAttr.array[i * 3 + 2] += v.z;
        v.life -= 0.008;

        if (v.life <= 0) {
          posAttr.array[i * 3]     = dice.position.x + (Math.random() - 0.5) * 0.3;
          posAttr.array[i * 3 + 1] = dice.position.y + (Math.random() - 0.5) * 0.3;
          posAttr.array[i * 3 + 2] = dice.position.z + (Math.random() - 0.5) * 0.3;
          v.x    = (Math.random() - 0.5) * 0.04;
          v.y    = Math.random() * 0.03;
          v.z    = (Math.random() - 0.5) * 0.04;
          v.life = 0.6 + Math.random() * 0.4;
        }
      }

      particles.position.copy(dice.position);
      posAttr.needsUpdate = true;
      particleMat.opacity = phase === "done" ? 0 : 0.7;

      // Pulso de luz de relleno
      fillLight.intensity = 1.2 + Math.sin(timestamp * 0.003) * 0.3;

      renderer.render(scene, camera);
    }

    animFrameId = requestAnimationFrame(animate);
    stateRef.current = { renderer, animFrameId };

    // ── CLEANUP ──────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animFrameId);
      renderer.dispose();

      const mount = mountRef.current;
      if (mount && renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }

      geometry.dispose();
      if (Array.isArray(material)) {
        material.forEach((m) => m.dispose());
      } else {
        material.dispose();
      }
      floorGeo.dispose();
      floorMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [resultado, tipoDeDado, width, height, handleComplete]);

  const containerStyle: CSSProperties = {
    width,
    height,
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow:
      "0 0 40px rgba(96, 48, 192, 0.4), 0 0 80px rgba(32, 8, 80, 0.6)",
    border: "1px solid rgba(180, 140, 255, 0.2)",
    background: "#080412",
  };

  return <div ref={mountRef} style={containerStyle} />;
};

export default DiceVisualizer;