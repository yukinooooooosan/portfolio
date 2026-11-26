// Procedural fire for the invitation scene; the character artwork stays intact.
const palettes = {
  kohaku: { outer: [204, 38, 16], flame: [255, 114, 31], core: [255, 222, 143] },
  suzu: { outer: [86, 30, 173], flame: [173, 85, 255], core: [235, 199, 255] }
};
const color = (rgb, alpha) => `rgba(${rgb.join(',')},${alpha})`;
const seed = index => {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

export function attachSoulFlames(scene, character) {
  const canvas = document.createElement('canvas');
  canvas.className = 'soul-flames';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  const field = document.createElement('canvas');
  const fire = field.getContext('2d');
  if (!ctx || !fire) return () => {};
  scene.append(canvas);
  const palette = palettes[character] ?? palettes.kohaku;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const tongues = Array.from({ length: 18 }, (_, index) => ({
    x: .15 + index / 17 * .7,
    width: .026 + seed(index + 8) * .032,
    height: .65 + seed(index + 19) * .44,
    phase: seed(index + 43) * Math.PI * 2,
    speed: .65 + seed(index + 68) * .55
  }));
  const embers = Array.from({ length: 24 }, (_, index) => ({
    x: .17 + seed(index + 90) * .66,
    phase: seed(index + 120),
    speed: .085 + seed(index + 150) * .1,
    radius: .7 + seed(index + 180) * 1.1
  }));
  let width = 0, height = 0, frame = 0, lastPaint = -Infinity;
  let visible = false, disposed = false;

  function flamePath(tongue, time, narrow = 1) {
    const wave = time * tongue.speed;
    const baseX = tongue.x * width;
    const baseY = height * 1.06;
    const reach = height * tongue.height * (.94 + .065 * Math.sin(wave * 1.7 + tongue.phase));
    const half = width * tongue.width * narrow;
    const bend = width * (.04 * Math.sin(wave * 2.1 + tongue.phase)
      + .016 * Math.sin(wave * 3.2 + tongue.phase * 2));
    const waistX = baseX + width * .035 * Math.sin(wave * 1.9 + tongue.phase + 1);
    const shoulderX = baseX + width * .04 * Math.sin(wave * 2.4 + tongue.phase + 2);
    const tipX = baseX + bend * 2.8;
    const tipY = baseY - reach;
    const path = new Path2D();
    path.moveTo(baseX - half, baseY);
    path.bezierCurveTo(baseX - half * 1.4, baseY - reach * .12,
      waistX - half * .9, baseY - reach * .3, waistX - half * .65, baseY - reach * .48);
    path.bezierCurveTo(waistX - half * .3, baseY - reach * .67,
      shoulderX + half * .2, tipY + reach * .19, tipX, tipY);
    path.bezierCurveTo(tipX + half * .3, tipY + reach * .2,
      shoulderX + half * 1.4, baseY - reach * .5, waistX + half * .6, baseY - reach * .35);
    path.bezierCurveTo(waistX + half * 1.15, baseY - reach * .2,
      baseX + half * 1.7, baseY - reach * .1, baseX + half, baseY);
    path.closePath();
    return { path, tipY, baseY };
  }

  function paint(time) {
    if (!width || !height || disposed) return;
    fire.clearRect(0, 0, width, height);
    fire.globalCompositeOperation = 'lighter';
    for (const tongue of tongues) {
      const { path, tipY, baseY } = flamePath(tongue, time);
      const gradient = fire.createLinearGradient(0, tipY, 0, baseY);
      gradient.addColorStop(0, color(palette.outer, 0));
      gradient.addColorStop(.1, color(palette.flame, .12));
      gradient.addColorStop(.42, color(palette.flame, .35));
      gradient.addColorStop(.76, color(palette.core, .46));
      gradient.addColorStop(1, color(palette.outer, .12));
      fire.fillStyle = gradient;
      fire.fill(path);
      const inner = flamePath(tongue, time + .16, .32);
      const core = fire.createLinearGradient(0, inner.tipY, 0, baseY);
      core.addColorStop(0, color(palette.core, 0));
      core.addColorStop(.48, color(palette.core, .04));
      core.addColorStop(.86, color(palette.core, .28));
      core.addColorStop(1, color(palette.flame, 0));
      fire.fillStyle = core;
      fire.fill(inner.path);
    }
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = .65;
    ctx.filter = 'blur(13px)';
    ctx.drawImage(field, 0, 0, width, height);
    ctx.globalAlpha = .9;
    ctx.filter = 'blur(.7px)';
    ctx.drawImage(field, 0, 0, width, height);
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'lighter';
    for (const ember of embers) {
      const life = (time * ember.speed + ember.phase) % 1;
      const x = width * ember.x + Math.sin(time * .8 + ember.phase * 20 + life * 6) * width * .025;
      const y = height * (1.04 - life * 1.1);
      const alpha = Math.sin(life * Math.PI) * .65;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color(palette.core, 1);
      ctx.beginPath();
      ctx.ellipse(x, y, ember.radius * .7, ember.radius * 1.7, .2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function resize() {
    const box = scene.getBoundingClientRect();
    width = box.width;
    height = box.height;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    // The soft flame field needs fewer pixels than the artwork and text.
    const scale = Math.min(1, 320 / Math.max(1, width));
    field.width = Math.max(1, Math.round(width * scale));
    field.height = Math.max(1, Math.round(height * scale));
    fire.setTransform(scale, 0, 0, scale, 0, 0);
    paint(reduce.matches ? 2 : performance.now() / 1000);
  }

  function tick(now) {
    if (disposed) return;
    if (now - lastPaint >= 1000 / 24) {
      paint(now / 1000);
      lastPaint = now;
    }
    frame = requestAnimationFrame(tick);
  }

  function playback() {
    cancelAnimationFrame(frame);
    if (disposed) return;
    if (!reduce.matches && visible && !document.hidden) frame = requestAnimationFrame(tick);
    else if (reduce.matches) paint(2);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(scene);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    playback();
  });
  visibilityObserver.observe(scene);
  reduce.addEventListener('change', playback);
  document.addEventListener('visibilitychange', playback);
  resize();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    reduce.removeEventListener('change', playback);
    document.removeEventListener('visibilitychange', playback);
    canvas.remove();
  };
}
