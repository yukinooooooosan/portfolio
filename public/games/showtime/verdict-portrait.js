// Coordinates are percentages of the original artwork. Each row covers the three outfits.
// Each pose records the crop's bottom edge and the two motion anchors (x, y).
const verdictPortrait = (() => {
  const soulArt = character => `./art/soul/${character}-soul-allin-v3.webp`;
  const soulCharacter = src => ['kohaku', 'suzu'].find(character =>
    src.split(/[?#]/)[0].endsWith(soulArt(character).slice(1)));
  const poses = {
    kohaku: {
      '0': [[77, 57, 59, 88, 60], [78, 53, 60, 86, 60], [75, 45, 55, 78, 55]],
      '1': [[78, 56, 62, 85, 61], [79, 52, 62, 84, 61], [83, 47, 65, 81, 64]],
      '2': [[77, 59, 59, 89, 59], [79, 56, 60, 87, 60], [83, 50, 64, 85, 63]],
      challenge: [[86, 59, 69, 87, 68], [87, 57, 70, 86, 69], [91, 51, 73, 84, 72]],
      comeback: [[78, 59, 60, 88, 60], [79, 57, 60, 87, 60], [82, 51, 63, 84, 63]],
      despair: [[84, 59, 66, 86, 64], [85, 56, 67, 83, 65], [88, 51, 70, 84, 68]],
      embarrassed: [[77, 57, 59, 89, 59], [79, 54, 60, 86, 60], [84, 49, 64, 82, 63]],
      pale: [[77, 59, 60, 88, 60], [78, 55, 60, 86, 60], [82, 49, 63, 82, 62]],
      remember: [[78, 58, 61, 87, 60], [80, 54, 61, 85, 60], [83, 49, 64, 84, 64]],
      resolve: [[78, 59, 60, 89, 60], [79, 55, 60, 88, 60], [83, 50, 63, 85, 63]]
    },
    suzu: {
      '0': [[87, 20, 70, 54, 69], [89, 15, 71, 59, 70], [82, 33, 64, 69, 63]],
      '1': [[91, 34, 73, 62, 72], [91, 31, 74, 68, 72], [86, 34, 68, 69, 67]],
      '2': [[87, 16, 70, 50, 69], [87, 15, 69, 58, 68], [86, 26, 68, 64, 66]],
      challenge: [[97, 52, 80, 81, 79], [97, 48, 79, 87, 78], [94, 51, 76, 85, 74]],
      comeback: [[87, 19, 70, 55, 69], [88, 15, 70, 59, 69], [87, 25, 67, 67, 67]],
      despair: [[94, 31, 76, 64, 75], [95, 26, 76, 68, 75], [91, 32, 72, 66, 70]],
      embarrassed: [[89, 22, 71, 57, 70], [89, 19, 71, 60, 70], [87, 26, 67, 66, 67]],
      pale: [[89, 22, 71, 56, 69], [89, 17, 70, 63, 69], [86, 28, 67, 65, 66]],
      remember: [[92, 33, 74, 62, 72], [91, 29, 73, 70, 71], [87, 35, 69, 70, 67]],
      resolve: [[89, 23, 71, 56, 70], [89, 18, 71, 63, 70], [87, 28, 68, 69, 67]]
    }
  };

  function framing(src) {
    const soul = soulCharacter(src);
    if (soul) return { aspect: 1.5, crop: [0, 0, 100, 100], soul };
    const square = typeof portraitAssets !== 'undefined' && portraitAssets.describe(src);
    if (square) return { aspect: 1, crop: [0, 0, 100, 100], square };
    const file = src.split('/').pop().replace(/\.webp$/, '');
    const [rival, pose, variant] = file.split('-');
    if (pose === 'soul') {
      return rival === 'kohaku'
        ? { aspect: 1.5, crop: [24, 0, 96, 93], anchors: [59, 69, 79, 67], radius: [14, 15] }
        : { aspect: 1.5, crop: [19, 0, 100, 97], anchors: [55, 79, 81, 74], radius: [14, 14] };
    }
    const neutral = /^0[12]$/.test(pose);
    const outfit = neutral ? Number(pose[1]) : Number(variant?.slice(2) || 0);
    const levels = poses[rival]?.[neutral ? '0' : pose] ?? poses[rival]?.['0'] ?? poses.kohaku['0'];
    const [bottom, ...anchors] = levels[outfit] ?? levels[0];
    return { aspect: .5, crop: [0, 0, 100, bottom], anchors, radius: [22, 11] };
  }

  function shot(src, alt) {
    if (framing(src).square) return `<div class="verdict-shot square-shot">${image(src, alt)}</div>`;
    const { crop: [x, y, right, bottom], aspect } = framing(src);
    const w = right - x, h = bottom - y;
    const imageStyle = `width:${10000 / w}%;height:${10000 / h}%;left:${-100 * x / w}%;top:${-100 * y / h}%`;
    return `<div class="verdict-shot"><div class="verdict-crop" style="--crop-ratio:${aspect * w / h}">
      <img src="${src}" alt="${alt}" decoding="async" style="${imageStyle}">
      <canvas aria-hidden="true" hidden></canvas>
    </div></div>`;
  }

  // Reuse the standing artwork and its pose-specific upper-body crop everywhere.
  // Width stays intrinsic, so the figure never stretches to fill a landscape frame.
  function image(src, alt = '', className = '') {
    if (framing(src).soul) return `<img class="${className} soul-art" src="${src}" alt="${alt}" width="1536" height="1024" decoding="async" data-portrait="soul">`;
    const square = framing(src).square;
    if (square) return `<img class="${className} standing-art" src="${src}" alt="${alt}" width="1254" height="1254" decoding="async" data-portrait="square" style="${portraitAssets.imageStyle(square)}">`;
    const { crop: [, , , bottom] } = framing(src);
    return `<img class="${className} standing-art" src="${src}" alt="${alt}" decoding="async" style="--portrait-height:${10000 / bottom}%">`;
  }

  // Precompute the displacement field once. Every region follows the same wave.
  function motionPatch(canvas, img, frame, featherEdges = false) {
    if (!img.naturalWidth) return null;
    const [left, top, right, bottom] = frame.crop;
    const regions = [];
    function addPair([lx, ly, rx, ry], [width, height], gain, sideways) {
      regions.push({ x: lx, y: ly, width, height, gain, sideways });
      regions.push({ x: rx, y: ry, width, height, gain, sideways: -sideways });
    }
    addPair(frame.anchors, frame.radius, 1, .16);
    if (frame.shoulders) addPair(frame.shoulders.anchors, frame.shoulders.radius, .38, 0);
    const x0 = Math.max(left, Math.min(...regions.map(r => r.x - r.width)) - 1);
    const x1 = Math.min(right, Math.max(...regions.map(r => r.x + r.width)) + 1);
    const y0 = Math.max(top, Math.min(...regions.map(r => r.y - r.height)) - 1);
    const y1 = Math.min(bottom, Math.max(...regions.map(r => r.y + r.height)) + 1);
    const w = x1 - x0, h = y1 - y0;
    const pixelWidth = img.naturalWidth * w / 100, pixelHeight = img.naturalHeight * h / 100;
    const displayWidth = canvas.parentElement.clientWidth * w / (right - left);
    if (!displayWidth) return null;
    const sampleWidth = Math.min(pixelWidth, 360, displayWidth * Math.min(devicePixelRatio || 1, 2));
    canvas.width = Math.max(2, Math.round(sampleWidth));
    canvas.height = Math.max(2, Math.round(canvas.width * pixelHeight / pixelWidth));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    canvas.style.cssText = `left:${100 * (x0 - left)/(right - left)}%;top:${100 * (y0 - top)/(bottom - top)}%;width:${100 * w / (right - left)}%;height:${100 * h / (bottom - top)}%`;
    const width = canvas.width, height = canvas.height;
    ctx.drawImage(img, img.naturalWidth * x0 / 100, img.naturalHeight * y0 / 100, pixelWidth, pixelHeight, 0, 0, width, height);
    const source = ctx.getImageData(0, 0, width, height);
    const result = ctx.createImageData(width, height);
    result.data.set(source.data);
    const lift = new Float32Array(width * height);
    const lateral = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
      const py = y0 + (y + .5) / height * h;
      for (let x = 0; x < width; x++) {
        const px = x0 + (x + .5) / width * w;
        const i = y * width + x;
        let coverage = 0;
        for (const region of regions) {
          const dx = (px - region.x) / region.width;
          const dy = (py - region.y) / region.height;
          const weight = Math.max(0, 1 - dx * dx - dy * dy) ** 2;
          lift[i] += weight * region.gain;
          lateral[i] += weight * region.sideways;
          coverage += weight;
        }
        if (featherEdges) result.data[i * 4 + 3] = 255 * Math.min(1, 12 * coverage);
      }
    }
    const amplitude = height * (bottom - top) / h * .069;
    const input = source.data, output = result.data;
    return wave => {
      const displacement = amplitude * wave;
      for (let y = 0, i = 0; y < height; y++) {
        for (let x = 0; x < width; x++, i++) {
          if (!lift[i]) continue;
          const sy = Math.max(0, Math.min(height - 1.001, y - displacement * lift[i]));
          const sx = Math.max(0, Math.min(width - 1.001, x + displacement * lateral[i]));
          const iy = Math.floor(sy), ix = Math.floor(sx), dx = sx - ix, dy = sy - iy;
          const k = (iy * width + ix) * 4, next = k + width * 4;
          for (let ch = 0; ch < 3; ch++) {
            const upper = input[k + ch] + dx * (input[k + 4 + ch] - input[k + ch]);
            const lower = input[next + ch] + dx * (input[next + 4 + ch] - input[next + ch]);
            output[i * 4 + ch] = upper + dy * (lower - upper);
          }
        }
      }
      ctx.putImageData(result, 0, 0);
    };
  }

  // Keep the existing argument order compatible with cached stage scripts.
  // The opening expression is deliberately ignored; only the result is drawn.
  function sequence(host, _before, src, name, reduce) {
    host.innerHTML = shot(src, name + 'の決着時の表情');
    const img = host.querySelector('img');
    const canvas = img.nextElementSibling;
    const ready = Promise.allSettled([img.decode?.()]);
    let raf = 0;
    let paint;
    let stopSquare;

    function stop() {
      cancelAnimationFrame(raf);
      stopSquare?.();
      stopSquare = null;
      if (canvas) canvas.hidden = true;
    }
    function play() {
      if (reduce.matches) return;
      if (framing(src).square) {
        stopSquare?.();
        stopSquare = portraitMotion.attach(img, { reaction: true });
        return;
      }
      const reactionDuration = 720;
      const start = performance.now();
      let lastPaint = -100;

      function tick(now) {
        const elapsed = Math.max(0, now - start);
        if (elapsed >= reactionDuration || reduce.matches) {
          stop();
          return;
        }
        if (elapsed - lastPaint >= 1000 / 36) {
          if (paint === undefined) {
            try { paint = motionPatch(canvas, img, framing(src)); }
            catch { paint = null; }
          }
          if (!paint) { stop(); return; }
          const progress = elapsed / reactionDuration;
          paint(.58 * Math.sin(2 * Math.PI * progress) * (1 - progress) ** 2);
          canvas.hidden = false;
          lastPaint = elapsed;
        }
        raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
    }
    return { ready, play, stop };
  }
  function sceneStyle(src) {
    const { square, soul } = framing(src);
    if (soul) return `--scene-background:none;--soul-accent:${soul === 'kohaku' ? '#682a1d' : '#3e2861'}`;
    return square ? portraitAssets.sceneStyle(square.outfit) : '';
  }
  return { sequence, motionPatch, framing, image, sceneStyle, soulArt };
})();
