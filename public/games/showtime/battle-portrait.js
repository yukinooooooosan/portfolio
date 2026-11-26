// Anchor offsets are in percent of artwork height, measured from its horizontal centre and top.
// Entries follow the three outfits and use the original wide paintings (before mobile cropping).
const battlePortrait = (() => {
  const anchors = {
    kohaku: {
      0: [[5,62,21,60], [1,62,16,61], [2,56,15,55]],
      1: [[1,60,12,61], [-2,61,11,61], [0,58,13,57]],
      2: [[3,59,18,58], [0,60,14,59], [1,60,18,58]],
      challenge: [[3,66,15,64], [2,70,16,67], [1,69,16,66]],
      comeback: [[4,60,15,60], [2,61,16,61], [2,60,15,59]],
      despair: [[4,63,15,62], [2,66,15,62], [1,63,17,63]],
      embarrassed: [[3,60,17,59], [0,61,16,60], [1,59,16,58]],
      pale: [[4,60,20,59], [1,59,17,58], [1,59,18,58]],
      remember: [[3,57,16,57], [3,60,16,59], [1,59,15,57]],
      resolve: [[4,59,19,60], [6,59,22,60], [1,55,16,55]]
    },
    suzu: {
      0: [[-14,68,4,67], [-13,68,9,67], [-8,62,10,62]],
      1: [[-4,71,10,70], [-10,70,11,69], [-7,67,10,67]],
      2: [[-17,69,0,68], [-16,68,6,66], [-9,66,10,64]],
      challenge: [[2,77,16,75], [-4,77,17,74], [-6,72,13,71]],
      comeback: [[-13,70,3,70], [-13,70,9,68], [-15,67,6,67]],
      despair: [[-6,72,8,72], [-11,72,11,71], [-7,70,9,69]],
      embarrassed: [[-14,70,1,69], [-12,68,9,68], [-11,66,7,65]],
      pale: [[-12,69,3,68], [-13,67,9,67], [-12,65,7,65]],
      remember: [[-8,75,4,74], [-7,69,12,69], [-6,68,12,67]],
      resolve: [[-9,69,8,69], [-12,67,12,66], [-12,66,8,65]]
    }
  };
  // Shoulder positions use the same artwork coordinates and outfit order as the chest.
  const shoulders = {
    kohaku: {
      0: [[-10,46,18,47], [-12,44,17,46], [-7,38,17,39]],
      1: [[-10,41,15,42], [-12,41,15,43], [-11,41,17,41]],
      2: [[-10,42,19,48], [-12,45,17,49], [-10,43,20,49]],
      challenge: [[-12,43,21,48], [-13,45,22,51], [-10,45,22,50]],
      comeback: [[-12,48,17,48], [-12,49,18,50], [-11,45,19,47]],
      despair: [[-12,46,24,43], [-12,46,23,43], [-10,45,25,44]],
      embarrassed: [[-8,45,17,47], [-7,45,18,47], [-9,44,19,47]],
      pale: [[-10,44,19,47], [-12,44,20,47], [-12,44,20,47]],
      remember: [[-11,40,16,42], [-12,41,16,44], [-9,39,16,42]],
      resolve: [[-11,42,19,46], [-7,43,23,46], [-10,39,19,43]]
    },
    suzu: {
      0: [[-17,52,24,51], [-18,53,23,52], [-17,48,23,47]],
      1: [[-16,48,28,48], [-20,48,24,49], [-17,50,24,49]],
      2: [[-18,54,24,54], [-19,53,26,53], [-15,54,27,53]],
      challenge: [[-18,48,29,47], [-20,48,28,48], [-19,47,29,47]],
      comeback: [[-18,54,23,53], [-18,54,23,53], [-18,52,21,52]],
      despair: [[-20,51,27,51], [-23,50,25,50], [-21,50,25,50]],
      embarrassed: [[-16,50,21,52], [-15,51,23,51], [-17,50,20,49]],
      pale: [[-18,51,25,50], [-20,51,24,51], [-20,50,22,50]],
      remember: [[-19,52,25,51], [-16,51,25,50], [-18,50,25,51]],
      resolve: [[-19,53,24,53], [-20,53,24,54], [-21,52,23,53]]
    }
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const period = 3800;

  // Only the base paintings have registered half-closed and closed eye sprites.
  let nextBlink = 0;
  function blinkFrame(now) {
    if (!nextBlink) nextBlink = now + 1600;
    const elapsed = now - nextBlink;
    if (elapsed < 0) return 'open';
    if (elapsed < 45) return 'half';
    if (elapsed < 115) return 'closed';
    if (elapsed < 175) return 'half';
    nextBlink = now + 2800 + Math.random() * 2900;
    return 'open';
  }

  function attach(img, rival, soul) {
    // The wide soul cutouts have their own pose; do not apply standing-pose warps.
    if (img?.dataset.portrait === 'soul') return () => {};
    if (img?.dataset.portrait === 'square') return portraitMotion.attach(img);
    const scene = img.parentElement;
    const standing = img.classList.contains('standing-art');
    const layer = document.createElement('span');
    layer.className = 'battle-motion';
    layer.setAttribute('aria-hidden', 'true');
    const canvas = document.createElement('canvas');
    canvas.hidden = true;
    layer.append(canvas);
    let eyes;
    if (img.getAttribute('src') === `./art/${standing ? '' : 'wide/'}${rival.id}-0.webp`) {
      eyes = document.createElement('span');
      eyes.className = 'battle-blink';
      if (standing) {
        // Registered eye regions in the 484 × 968 standing artwork.
        const [x, y, width, height] = rival.id === 'kohaku' ? [120, 137, 193, 104] : [110, 179, 240, 95];
        eyes.style.cssText = `left:${x / 484 * 100}%;top:${y / 968 * 100}%;width:${width / 484 * 100}%;height:${height / 968 * 100}%`;
      }
      layer.append(eyes);
    }
    img.after(layer);

    let paint = null, raf = 0, lastPaint = -Infinity, visible = false;
    function tick(now) {
      if (eyes) {
        const frame = blinkFrame(now);
        if (eyes.dataset.frame !== frame) eyes.dataset.frame = frame;
      }
      if (now - lastPaint >= 1000 / 24) {
        const phase = now * 2 * Math.PI / period;
        // A slow lift and a slightly delayed settle, shared by both sides.
        paint(.12 * Math.sin(phase) - .018 * Math.sin(2 * phase));
        canvas.hidden = false;
        lastPaint = now;
      }
      raf = requestAnimationFrame(tick);
    }
    function playback() {
      cancelAnimationFrame(raf);
      if (paint && visible && !document.hidden && !reduce.matches) raf = requestAnimationFrame(tick);
      else {
        canvas.hidden = true;
        if (eyes) eyes.dataset.frame = 'open';
      }
    }
    function position() {
      paint = null;
      canvas.hidden = true;
      if (img.naturalWidth && img.naturalHeight && !reduce.matches) {
        const box = img.getBoundingClientRect(), bounds = scene.getBoundingClientRect();
        const style = getComputedStyle(img);
        const fit = style.objectFit === 'cover' ? Math.max : Math.min;
        const scale = fit(box.width / img.naturalWidth, box.height / img.naturalHeight);
        const width = img.naturalWidth * scale, height = img.naturalHeight * scale;
        const [px, py] = style.objectPosition.split(' ').map(value => parseFloat(value) / 100);
        layer.style.left = (box.left - bounds.left + (box.width - width) * px) + 'px';
        layer.style.top = (box.top - bounds.top + (box.height - height) * py) + 'px';
        layer.style.width = width + 'px';
        layer.style.height = height + 'px';
        if (width && height) {
          const ratio = img.naturalHeight / img.naturalWidth;
          function posePoints(table) {
            const poses = table[rival.id];
            return (poses[rival.mood] ?? poses[0])[rival.outfit ?? 0]
              .map((value, i) => i % 2 ? value : 50 + value * ratio);
          }
          const centres = soul ? verdictPortrait.framing(img.src).anchors : posePoints(anchors);
          const shoulderCentres = soul
            ? (rival.id === 'kohaku' ? [38, 35, 89, 51] : [25, 54, 91, 20])
            : posePoints(shoulders);
          const radius = soul ? [12, 11] : [11 * ratio, 10];
          const shoulderRadius = soul ? [6, 8] : [7 * ratio, 7];
          try {
            const frame = standing ? { ...verdictPortrait.framing(img.src), crop: [0, 0, 100, 100] } : {
              crop: [0, 0, 100, 100], anchors: centres, radius,
              shoulders: { anchors: shoulderCentres, radius: shoulderRadius }
            };
            paint = verdictPortrait.motionPatch(canvas, img, frame, true);
          } catch { /* Keep the static painting if canvas readback is unavailable. */ }
        }
      }
      playback();
    }
    const resize = new ResizeObserver(position);
    resize.observe(img);
    resize.observe(scene);
    const inView = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; playback(); });
    inView.observe(scene);
    img.addEventListener('load', position);
    reduce.addEventListener('change', position);
    document.addEventListener('visibilitychange', playback);
    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      inView.disconnect();
      img.removeEventListener('load', position);
      reduce.removeEventListener('change', position);
      document.removeEventListener('visibilitychange', playback);
      layer.remove();
    };
  }
  return { attach };
})();
