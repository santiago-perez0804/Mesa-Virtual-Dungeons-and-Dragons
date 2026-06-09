import * as THREE from 'three';

// ---------------------------------------------------------------------
// 1. Textura Dinámica Generada por Canvas 2D en Memoria
// ---------------------------------------------------------------------
export function createDiceFaceTexture(
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
export function createD10Geometry(): THREE.BufferGeometry {
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
export interface GeometryNormalsResult {
  geometry: THREE.BufferGeometry;
  normals: THREE.Vector3[];
}

export function groupGeometryByFaceNormal(geometry: THREE.BufferGeometry): GeometryNormalsResult {
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
