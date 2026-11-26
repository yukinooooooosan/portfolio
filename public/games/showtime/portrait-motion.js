// Chest-local deformation preserves RGBA transparency. Suzu uses one joined
// region so both sides translate together, without opposing lateral movement.
const portraitMotion = (() => {
  function blinkAmount(elapsed) {
    if (elapsed < 0 || elapsed >= 180) return 0;
    if (elapsed < 45) return elapsed / 45;
    if (elapsed < 105) return 1;
    return (180 - elapsed) / 75;
  }

  const vertexSource = `
    attribute vec2 position;
    varying vec2 uv;
    void main() {
      uv = vec2((position.x + 1.0) * .5, (1.0 - position.y) * .5);
      gl_Position = vec4(position, 0.0, 1.0);
    }`;
  const fragmentSource = `
    precision mediump float;
    varying vec2 uv;
    uniform sampler2D portrait;
    uniform sampler2D closedEyes;
    uniform vec4 chestA;
    uniform vec4 chestB;
    uniform float linkedChest;
    uniform float displacement;
    uniform float blink;
    uniform vec4 crop;
    uniform vec4 eyeA;
    uniform vec4 eyeB;
    uniform vec2 angles;
    float chestWeight(vec2 point, vec4 region) {
      vec2 p = (point - region.xy) / region.zw;
      float weight = max(0.0, 1.0 - dot(p, p));
      return weight * weight;
    }
    float linkedChestWeight(vec2 point) {
      // A capsule follows the line between the two registered centres. Using
      // the smaller radii retains clearance from crossed arms. Its flat core
      // gives both sides exactly the same displacement, including the seam.
      vec2 radius = min(chestA.zw, chestB.zw);
      vec2 p = (point - chestA.xy) / radius;
      vec2 axis = (chestB.xy - chestA.xy) / radius;
      float along = clamp(dot(p, axis) / max(dot(axis, axis), .0001), 0.0, 1.0);
      float distance = length(p - along * axis);
      return 1.0 - smoothstep(.45, 1.0, distance);
    }
    float eyeMask(vec2 point, vec4 eye, float angle) {
      vec2 p = point - eye.xy;
      p = vec2(cos(angle)*p.x + sin(angle)*p.y, -sin(angle)*p.x + cos(angle)*p.y);
      return 1.0 - smoothstep(.74, 1.0, max(abs(p.x)/eye.z, abs(p.y)/eye.w));
    }
    void main() {
      float a = chestWeight(uv, chestA), b = chestWeight(uv, chestB);
      // Match the original standing-art motionPatch: shared vertical motion
      // with a small, mirrored lateral component (16%) on each side.
      vec2 offset = vec2(.16 * (a-b), -(a+b));
      if (linkedChest > .5) offset = vec2(0.0, -linkedChestWeight(uv));
      vec2 sampleUV = uv + displacement * offset;
      vec4 color = texture2D(portrait, sampleUV);
      if (blink > 0.0) {
        float mask = max(eyeMask(sampleUV, eyeA, angles.x), eyeMask(sampleUV, eyeB, angles.y));
        vec2 eyeUV = (sampleUV - crop.xy) / crop.zw;
        if (eyeUV.x >= 0.0 && eyeUV.x <= 1.0 && eyeUV.y >= 0.0 && eyeUV.y <= 1.0)
          color = mix(color, texture2D(closedEyes, eyeUV), mask * blink);
      }
      gl_FragColor = color;
    }`;

  function attach(img, options = {}) {
    const entry = typeof portraitAssets !== 'undefined' && portraitAssets.describe(img?.getAttribute('src'));
    if (!entry?.motion) return () => {};
    const scene = img.parentElement;
    const params = new URLSearchParams(location.search);
    const mode = params.get('debug') === '1' ? params.get('motion') : null;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches || mode === 'still') return () => {};
    const canvas = document.createElement('canvas');
    canvas.className = 'square-motion';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.hidden = true;
    canvas.dataset.motion = 'loading';
    canvas.dataset.motionKind = 'chest';
    canvas.dataset.motionSync = entry.character === 'suzu' ? 'linked' : 'paired';
    img.after(canvas);
    const oldOpacity = img.style.opacity;
    let gl, program, buffer, baseTexture, blinkTexture, eyeImage;
    let resize, inView, uniforms;
    let dead = false, ready = false, visible = false, eyesReady = false;
    let raf = 0, lastPaint = -Infinity, start = 0, nextBlink = 0;

    function restore() {
      canvas.hidden = true;
      img.style.opacity = oldOpacity;
    }
    function stop() {
      if (dead) return;
      dead = true;
      cancelAnimationFrame(raf);
      resize?.disconnect();
      inView?.disconnect();
      reduce.removeEventListener('change', playback);
      document.removeEventListener('visibilitychange', playback);
      canvas.removeEventListener('webglcontextlost', contextLost);
      if (eyeImage) eyeImage.onload = eyeImage.onerror = null;
      restore();
      // Release GPU allocations immediately when a game render replaces its scene.
      if (gl) {
        if (baseTexture) gl.deleteTexture(baseTexture);
        if (blinkTexture) gl.deleteTexture(blinkTexture);
        if (buffer) gl.deleteBuffer(buffer);
        if (program) gl.deleteProgram(program);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
      canvas.remove();
    }
    function contextLost(event) { event.preventDefault(); stop(); }
    function shader(type, source) {
      const result = gl.createShader(type);
      gl.shaderSource(result, source);
      gl.compileShader(result);
      if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(result);
        gl.deleteShader(result);
        throw new Error(message);
      }
      return result;
    }
    function texture(image, unit) {
      const result = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, result);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      if (image) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
      return result;
    }
    function position() {
      if (!ready || dead) return;
      const box = img.getBoundingClientRect(), parent = scene.getBoundingClientRect();
      const size = Math.min(1254, Math.max(1, Math.round(box.width * Math.min(devicePixelRatio || 1, 1.5))));
      if (canvas.width !== size || canvas.height !== size) {
        canvas.width = canvas.height = size;
        gl.viewport(0, 0, size, size);
      }
      canvas.style.left = (box.left - parent.left - scene.clientLeft) + 'px';
      canvas.style.top = (box.top - parent.top - scene.clientTop) + 'px';
      canvas.style.width = box.width + 'px';
      canvas.style.height = box.height + 'px';
      lastPaint = -Infinity;
      playback();
    }
    function tick(now) {
      raf = 0;
      if (dead || !ready || !visible || document.hidden || reduce.matches) return;
      if (!start) start = now;
      if (options.reaction && now - start >= 720) { stop(); return; }
      if (now - lastPaint >= 1000/30) {
        const phase = now * Math.PI * 2 / 3800;
        let wave = .12 * Math.sin(phase) - .018 * Math.sin(2 * phase);
        if (options.reaction) {
          const progress = (now-start)/720;
          wave = .58 * Math.sin(progress * Math.PI * 2) * (1-progress)**2;
        }
        if (mode === 'sway') wave = -.125;
        if (mode === 'sway-down') wave = .125;
        if (mode === 'blink') wave = 0;
        if (!nextBlink) nextBlink = now + 1400 + Math.random()*1000;
        let amount = blinkAmount(now-nextBlink);
        if (now-nextBlink >= 180) nextBlink = now + 2800 + Math.random()*2700;
        if (mode === 'blink') amount = 1;
        if (!eyesReady || options.reaction) amount = 0;
        gl.uniform1f(uniforms.displacement, .069 * wave);
        gl.uniform1f(uniforms.blink, amount);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        img.style.opacity = '0';
        canvas.hidden = false;
        canvas.dataset.motion = options.reaction ? 'reaction' : 'active';
        canvas.dataset.blink = amount === 1 ? 'closed' : amount ? 'closing' : 'open';
        lastPaint = now;
      }
      raf = requestAnimationFrame(tick);
    }
    function playback() {
      cancelAnimationFrame(raf);
      raf = 0;
      if (dead) return;
      if (ready && visible && !document.hidden && !reduce.matches) raf = requestAnimationFrame(tick);
      else { restore(); canvas.dataset.motion = 'paused'; }
    }
    async function initialize() {
      try {
        await img.decode();
        if (dead) return;
        gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
        if (!gl) { stop(); return; }
        const vertex = shader(gl.VERTEX_SHADER, vertexSource), fragment = shader(gl.FRAGMENT_SHADER, fragmentSource);
        program = gl.createProgram();
        gl.attachShader(program, vertex); gl.attachShader(program, fragment);
        gl.linkProgram(program);
        gl.deleteShader(vertex); gl.deleteShader(fragment);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
        gl.useProgram(program);
        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,-1,-1,1,1,1,-1]), gl.STATIC_DRAW);
        const attribute = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(attribute);
        gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
        uniforms = Object.fromEntries(['portrait','closedEyes','chestA','chestB','linkedChest','displacement','blink','crop','eyeA','eyeB','angles'].map(name => [name,gl.getUniformLocation(program,name)]));
        baseTexture = texture(img, 0);
        blinkTexture = texture(null, 1);
        gl.uniform1i(uniforms.portrait, 0); gl.uniform1i(uniforms.closedEyes, 1);
        gl.uniform4fv(uniforms.chestA, entry.motion.chest[0]);
        gl.uniform4fv(uniforms.chestB, entry.motion.chest[1]);
        gl.uniform1f(uniforms.linkedChest, entry.character === 'suzu' ? 1 : 0);
        const blink = entry.motion.blink;
        if (blink && !options.reaction) {
          gl.uniform4fv(uniforms.crop, blink.crop);
          gl.uniform4fv(uniforms.eyeA, blink.eyes[0].slice(0,4));
          gl.uniform4fv(uniforms.eyeB, blink.eyes[1].slice(0,4));
          gl.uniform2f(uniforms.angles, blink.eyes[0][4], blink.eyes[1][4]);
          eyeImage = new Image();
          eyeImage.onload = () => {
            if (dead) return;
            try {
              gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, blinkTexture);
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, eyeImage);
              eyesReady = true;
            } catch { /* Chest motion can continue if an eye texture is unavailable. */ }
          };
          eyeImage.src = blink.src;
        }
        ready = true;
        resize = new ResizeObserver(position); resize.observe(img); resize.observe(scene);
        inView = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; playback(); });
        inView.observe(scene);
        reduce.addEventListener('change', playback);
        document.addEventListener('visibilitychange', playback);
        canvas.addEventListener('webglcontextlost', contextLost);
        position();
      } catch { stop(); }
    }
    initialize();
    return stop;
  }
  return { attach, blinkAmount };
})();
