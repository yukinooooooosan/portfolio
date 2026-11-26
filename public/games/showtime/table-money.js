const columns = [0, -1, 1, -2, 2];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = value => Math.max(0, Math.min(1, value));

export function rackLayout(rack) {
  const rect = rack.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2, y: rect.top + rect.height / 2,
    diameter: Math.min(34, rect.width * .185), spacing: Math.min(29, rect.width * .165)
  };
}
export function stackPoint(layout, i, count) {
  const shift = count === 2 || count === 4 ? .5 : 0;
  const middleLevel = Math.floor((count - 1) / columns.length) / 2;
  return {
    x: layout.x + (columns[i % columns.length] + shift) * layout.spacing,
    y: layout.y - (Math.floor(i / columns.length) - middleLevel) * 2.8
  };
}
function midpoint(node) {
  const rect = node.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

export function createTableView() {
  const layer = document.querySelector('#coin-flight-layer');
  const ports = Object.fromEntries(Array.from(document.querySelectorAll('[data-wallet]'), node => [node.dataset.wallet, node]));
  const hud = document.querySelector('#match-hud');
  const potLabel = document.querySelector('#gauge-pot');
  let table, renderer, active, previousRound, previousFaces = [];

  // The CSS table is immediately playable while the GPU renderer initializes.
  import('./table-scene.js').then(({ createTableRenderer }) => {
    renderer = createTableRenderer(layer, () => { renderer = null; });
    if (table && !active) renderer?.mount(table);
  }).catch(() => { /* The same mint and concealment artwork is available in CSS. */ });

  function mount(element) {
    if (active && element !== table) active.finish();
    table = element;
    const nodes = table ? Array.from(table.querySelectorAll('[data-table-die]')) : [];
    const faces = nodes.map(node => Number(node.dataset.tableDie));
    if (table && previousRound === table.dataset.round && !reduced.matches) {
      nodes.forEach((node, i) => {
        if (previousFaces[i] !== 0 || !faces[i] || !node.animate) return;
        const seal = document.createElement('i');
        seal.className = 'die-back lifted-seal';
        seal.setAttribute('aria-hidden', 'true');
        node.append(seal);
        seal.animate([
          { transform: 'scale(1)', opacity: 1 },
          { transform: 'translateY(-12%) rotateX(36deg)', opacity: .85, offset: .48 },
          { transform: 'translateY(-34%) rotateX(77deg)', opacity: 0 }
        ], { duration: 270, easing: 'ease-out', fill: 'forwards' }).finished.then(() => seal.remove(), () => seal.remove());
      });
    }
    previousRound = table?.dataset.round;
    previousFaces = faces;
    renderer?.mount(table);
  }

  function moveCoins(moves, before, present, onLand) {
    if (!table) return;
    active?.finish();
    const board = table;
    const rack = board.querySelector('[data-table-anchor="pot"]');
    const paths = [];
    let nextOut = before.pot - 1;
    let nextIn = before.pot;
    for (const { from, to, amount } of moves) {
      for (let i = 0; i < amount; i++) {
        paths.push({ from, to, slot: from === 'pot' ? nextOut-- : to === 'pot' ? nextIn++ : 0 });
      }
    }
    if (!paths.length) return;
    const duration = 490, stagger = 13;
    const until = duration + (paths.length - 1) * stagger;
    const start = performance.now();
    let frame = 0, lastArrivals = -1, lastResting = -1, lastChime = -Infinity;
    const sprites = [];
    const arrival = { ...before };
    return new Promise(resolve => {
      function finish() {
        cancelAnimationFrame(frame);
        document.removeEventListener('visibilitychange', onVisibility);
        reduced.removeEventListener('change', onVisibility);
        sprites.forEach(sprite => sprite.remove());
        active = null;
        // Never depend on an animation frame to settle the accounting.
        const final = { ...before };
        for (const { from, to, amount } of moves) { final[from] -= amount; final[to] += amount; }
        present(final, final.pot);
        renderer?.mount(table);
        resolve();
      }
      function onVisibility() { if (document.hidden || reduced.matches) finish(); }
      function draw(now) {
        const elapsed = now - start;
        if (elapsed >= until || !board.isConnected) { finish(); return; }
        const layout = rackLayout(rack);
        const wallets = { you: midpoint(ports.you), rival: midpoint(ports.rival) };
        const useHudPot = layout.y < hud.getBoundingClientRect().bottom || layout.y > window.innerHeight;
        const hudPot = useHudPot ? midpoint(potLabel) : null;
        const visible = [];
        let resting = before.pot, arrivals = 0;
        Object.assign(arrival, before);
        paths.forEach(({ from, to, slot }, i) => {
          const raw = (elapsed - i * stagger) / duration;
          if (raw < 0) return;
          if (from === 'pot') resting--;
          if (raw >= 1) {
            if (to === 'pot') resting++;
            arrival[from]--; arrival[to]++; arrivals++;
            return;
          }
          const potPoint = hudPot || stackPoint(layout, slot, from === 'pot' ? before.pot : nextIn);
          const a = from === 'pot' ? potPoint : wallets[from];
          const b = to === 'pot' ? potPoint : wallets[to];
          const t = clamp(raw), smooth = t * t * (3 - 2 * t), arc = Math.sin(t * Math.PI);
          const height = from !== 'pot' && to !== 'pot' ? 21 : Math.min(47, Math.abs(b.y - a.y) * .16 + 10);
          visible.push({
            x: a.x + (b.x - a.x) * smooth + (i % 3 - 1) * arc * 4,
            y: a.y + (b.y - a.y) * smooth - height * arc,
            diameter: (from === 'pot' ? layout.diameter : 16) * (1 - smooth) + (to === 'pot' ? layout.diameter : 16) * smooth + 10 * arc,
            tilt: .28 + arc * .82, turn: (i % 2 ? 1 : -1) * arc * .33
          });
        });
        if (arrivals !== lastArrivals || resting !== lastResting) {
          present(arrival, resting);
          if (arrivals > Math.max(0, lastArrivals) && now - lastChime > 95) {
            onLand();
            lastChime = now;
          }
          lastArrivals = arrivals; lastResting = resting;
        }
        if (renderer?.isMounted(board)) {
          renderer.paint(resting, visible, layout);
        } else {
          visible.forEach((pose, index) => {
            if (!sprites[index]) {
              const sprite = document.createElement('i');
              sprite.className = 'flying-coin';
              layer.append(sprite);
              sprites[index] = sprite;
            }
            const sprite = sprites[index];
            sprite.hidden = false;
            sprite.style.transform = `translate3d(${pose.x}px,${pose.y}px,0) translate(-50%,-50%) rotateZ(${pose.turn}rad) rotateX(${pose.tilt}rad) scale(${pose.diameter / 32})`;
          });
          for (let i = visible.length; i < sprites.length; i++) sprites[i].hidden = true;
        }
        frame = requestAnimationFrame(draw);
      }
      if (reduced.matches || document.hidden) { finish(); return; }
      active = { finish };
      document.addEventListener('visibilitychange', onVisibility);
      reduced.addEventListener('change', onVisibility);
      draw(start);
    });
  }
  return { mount, moveCoins };
}
