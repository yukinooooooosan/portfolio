import * as THREE from './vendor/three.module.js';
import { rackLayout, stackPoint } from './table-money.js';

const pipPositions = [[.22,.22],[.5,.22],[.78,.22],[.22,.5],[.5,.5],[.78,.5],[.22,.78],[.5,.78],[.78,.78]];
const pips = [[], [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];
const faceOrder = [3, 4, 2, 5, 1, 6];

function texture(width, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = width;
  paint(canvas.getContext('2d'), width);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}

function diceTexture(face) {
  return texture(128, (ctx, size) => {
    const enamel = ctx.createLinearGradient(0, 0, size, size);
    enamel.addColorStop(0, '#fff8e9');
    enamel.addColorStop(1, '#dfc6ba');
    ctx.fillStyle = enamel;
    ctx.fillRect(0, 0, size, size);
    pips[face].forEach(index => {
      const [x, y] = pipPositions[index].map(point => point * size);
      ctx.beginPath();
      ctx.arc(x, y + 1.5, 9.7, 0, Math.PI * 2);
      ctx.fillStyle = '#fffaf1';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, face === 1 ? 12 : 9, 0, Math.PI * 2);
      ctx.fillStyle = face === 1 ? '#8d294e' : '#372335';
      ctx.fill();
    });
  });
}

function roundedCube() {
  const geometry = new THREE.BoxGeometry(1, 1, 1, 10, 10, 10);
  const { position, normal } = geometry.attributes;
  const point = new THREE.Vector3();
  const center = new THREE.Vector3();
  const edge = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    point.fromBufferAttribute(position, i);
    center.copy(point).clampScalar(-.375, .375);
    edge.subVectors(point, center).normalize();
    point.copy(center).addScaledVector(edge, .125);
    position.setXYZ(i, point.x, point.y, point.z);
    normal.setXYZ(i, edge.x, edge.y, edge.z);
  }
  return geometry;
}

// A milled edge, beveled shoulders and separate struck faces share one mesh.
function mintedGeometry() {
  const position = [], uv = [], indices = [];
  const segments = 192;
  const profiles = [[.958,-.09],[.995,-.068],[1,-.047],[1,.047],[.995,.068],[.958,.09]];
  profiles.forEach(([radius, z], ring) => {
    for (let i = 0; i <= segments; i++) {
      const angle = 2 * Math.PI * i / segments;
      const reeding = (ring === 2 || ring === 3) && i % 3 === 1 ? .026 : 0;
      position.push((radius - reeding) * Math.cos(angle), (radius - reeding) * Math.sin(angle), z);
      uv.push(i / segments, ring / (profiles.length - 1));
      if (i === segments || ring === profiles.length - 1) continue;
      const a = ring * (segments + 1) + i, b = a + segments + 1;
      indices.push(a, a+1, b, a+1, b+1, b);
    }
  });
  const edgeCount = indices.length;
  for (const sign of [1, -1]) {
    const center = position.length / 3;
    position.push(0, 0, .09 * sign); uv.push(.5, .5);
    for (let i = 0; i <= segments; i++) {
      const angle = sign * 2 * Math.PI * i / segments;
      const x = Math.cos(angle), y = Math.sin(angle);
      position.push(.958 * x,.958 * y, .09 * sign);
      // The disc samples just inside the texture edge to avoid its alpha fringe.
      uv.push(.5 + .494 * x * sign, .5 + .494 * y);
      if (i) indices.push(center, center + i, center + i + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.addGroup(0, edgeCount, 0);
  geometry.addGroup(edgeCount, indices.length - edgeCount, 1);
  geometry.computeVertexNormals();
  return geometry;
}

function sceneWithLight() {
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight('#fff3df', '#988177', 1.7));
  const key = new THREE.DirectionalLight('#fff2da', 2.25);
  key.position.set(-150, 200, 340);
  scene.add(key);
  return scene;
}

export function createTableRenderer(layer, onLoss) {
  const canvas = document.createElement('canvas');
  const settings = { antialias: true, alpha: true };
  const context = canvas.getContext('webgl2', settings);
  if (!context) return null;
  const renderer = new THREE.WebGLRenderer({ canvas, context, ...settings });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.autoClear = false;
  renderer.setClearColor(0x000000, 0);
  canvas.className = 'table-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const boardScene = sceneWithLight(), flightScene = sceneWithLight();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 900);
  camera.position.z = 420;
  const shape = roundedCube();
  const sides = faceOrder.map(face => new THREE.MeshStandardMaterial({ map: diceTexture(face), roughness: .47 }));
  const dice = Array.from({ length: 6 }, () => {
    const mesh = new THREE.Mesh(shape, sides);
    boardScene.add(mesh);
    return mesh;
  });
  const normals = [null,[0,0,1],[0,1,0],[1,0,0],[-1,0,0],[0,-1,0],[0,0,-1]];
  const facing = new THREE.Vector3(0,0,1);
  const orientations = normals.map(n => n && new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(...n), facing));
  const loader = new THREE.TextureLoader();
  const albedo = loader.load('./art/duel-coin.webp', repaint);
  albedo.colorSpace = THREE.SRGBColorSpace;
  const relief = loader.load('./art/duel-coin-relief.png', repaint);
  const metal = [
    new THREE.MeshStandardMaterial({ color: '#ba8949', roughness: .34, metalness: .52 }),
    new THREE.MeshStandardMaterial({ map: albedo, bumpMap: relief, bumpScale: .036, roughness: .44, metalness: .34 })
  ];
  const mint = mintedGeometry();
  function batch(scene) {
    const mesh = new THREE.InstancedMesh(mint, metal, 40);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.count = 0;
    mesh.frustumCulled = false;
    scene.add(mesh);
    return mesh;
  }
  const stack = batch(boardScene), flying = batch(flightScene);
  const pose = new THREE.Object3D();
  const hud = document.querySelector('#match-hud');
  let board, rack, width, height, lastCount = 0, airborne = false;
  const resize = new ResizeObserver(repaint);

  function repaint() {
    if (!board || airborne) return;
    locateDice();
    paint(lastCount);
  }
  function mount(element) {
    if (board !== element) {
      if (board) delete board.dataset.webgl;
      resize.disconnect();
      board = element;
      if (board) resize.observe(board);
    }
    if (!board) { canvas.remove(); airborne = false; return; }
    rack = board.querySelector('[data-table-anchor="pot"]');
    board.dataset.webgl = 'true';
    locateDice();
    paint(Number(board.dataset.pot));
  }
  function locateDice() {
    const box = board.getBoundingClientRect();
    board.querySelectorAll('[data-table-die]').forEach((node, i) => {
      const die = dice[i], face = Number(node.dataset.tableDie);
      die.visible = face > 0;
      if (!die.visible) return;
      const rect = node.getBoundingClientRect();
      die.scale.setScalar(rect.width * .85);
      die.position.set(rect.left + rect.width / 2 - box.left - board.clientLeft,
        box.top + board.clientTop - rect.top - rect.height / 2, 0);
      die.quaternion.copy(orientations[face]);
    });
  }
  function put(mesh, index, x, y, z, diameter, tilt, turn) {
    pose.position.set(x, -y, z);
    pose.rotation.set(tilt, 0, turn, 'ZXY');
    pose.scale.setScalar(diameter / 2);
    pose.updateMatrix();
    mesh.setMatrixAt(index, pose.matrix);
  }
  function projection(w, h) {
    camera.left = 0; camera.right = w; camera.top = 0; camera.bottom = -h;
    camera.updateProjectionMatrix();
  }
  function paint(count, flights = null, layout = rackLayout(rack)) {
    if (!board) return;
    const float = flights !== null;
    if (airborne !== float || !canvas.isConnected) {
      (float ? layer : board).prepend(canvas);
    } else if (!float && canvas.parentElement !== board) board.prepend(canvas);
    airborne = float;
    const box = board.getBoundingClientRect();
    const bw = board.clientWidth, bh = board.clientHeight;
    const left = box.left + board.clientLeft, top = box.top + board.clientTop;
    const w = float ? layer.clientWidth : bw, h = float ? layer.clientHeight : bh;
    if (!w || !h || !bw || !bh) return;
    if (width !== w || height !== h) { renderer.setSize(w,h,false); width = w; height = h; }
    renderer.setScissorTest(false);
    renderer.clear();
    projection(bw,bh);
    renderer.setViewport(float ? left : 0,float ? h - top - bh : 0,bw,bh);
    if (float) {
      const clipTop = Math.max(top, hud.getBoundingClientRect().bottom);
      renderer.setScissor(left, h - top - bh, bw, Math.max(0, top + bh - clipTop));
      renderer.setScissorTest(true);
    }
    lastCount = count;
    for (let i = 0; i < count; i++) {
      const point = stackPoint(layout, i, count);
      put(stack, i, point.x - left, point.y - top, Math.floor(i / 5) * 3.8, layout.diameter, .35, 0);
    }
    stack.count = count;
    stack.instanceMatrix.needsUpdate = true;
    renderer.render(boardScene, camera);
    if (float) {
      renderer.setScissorTest(false);
      renderer.setViewport(0,0,w,h);
      renderer.clearDepth();
      projection(w,h);
      flights.forEach((p,i) => put(flying,i,p.x,p.y,80+i*.4,p.diameter,p.tilt,p.turn));
      flying.count = flights.length;
      flying.instanceMatrix.needsUpdate = true;
      renderer.render(flightScene, camera);
    }
  }
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    mount(null);
    onLoss();
  });
  return { mount, paint, isMounted: element => board === element };
}
