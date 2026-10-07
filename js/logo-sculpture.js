/* Siluetas originales en un volumen de partículas. Sin paquetes ni modelos externos.
 * CONFIG: velocidad del giro, inclinación del eje, densidad y resolución.
 * Cada host tiene su propio movimiento; solo dibuja cuando está visible.
 */
(() => {
  "use strict";
  const hosts = [...document.querySelectorAll("[data-logo-sculpture]")];
  const logos = window.ESENCIA_DATA?.logos;
  if (!hosts.length || !logos) return;
  const CONFIG = { mobilePoints: 2200, desktopPoints: 4200, depth: .13, pixelRatio: 1.5,
    bombPeriod: 12, axisTilt: 23.4 * Math.PI / 180, wordmarkWaveSpeed: 1.8 };
  const base = new URL("../", document.currentScript.src);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const scenes = [];
  let playing = !reduced.matches && !navigator.connection?.saveData;
  const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  async function sample(shape) {
    const image = new Image();
    image.src = new URL(logos[shape], base).href;
    await image.decode();
    const map = document.createElement("canvas");
    map.width = shape === "wordmark" ? 720 : 300;
    map.height = Math.round(map.width * image.naturalHeight / image.naturalWidth);
    const ctx = map.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(image, 0, 0, map.width, map.height);
    const pixels = ctx.getImageData(0, 0, map.width, map.height).data;
    const candidates = [], step = shape === "wordmark" ? 2 : 3;
    for (let y = 0; y < map.height; y += step) {
      for (let x = 0; x < map.width; x += step) {
        const offset = (y * map.width + x) * 4;
        // Transparencias del PNG y fondo blanco del JPG quedan fuera del relieve.
        if (pixels[offset + 3] > 100 && pixels[offset] < 135) {
          candidates.push({ x: x / map.width - .5, y: (.5 - y / map.height) * map.height / map.width,
            seed: hash(y * map.width + x) });
        }
      }
    }
    const max = innerWidth < 600 ? CONFIG.mobilePoints : CONFIG.desktopPoints;
    const fraction = Math.min(1, max / candidates.length);
    return candidates.filter(p => p.seed < fraction);
  }


  function createScene(host) {
    const context = host.querySelector("canvas")?.getContext("2d");
    if (!context) return;
    const canvas = context.canvas;
    const wordmark = host.dataset.logoSculpture === "wordmark";
    let width = 1, height = 1, points = [], initialized = false;
    let visible = false, frame = 0, elapsed = 0, last = 0;
    let yaw = 0, pitch = 0, targetYaw = 0, targetPitch = 0;

    function draw() {
      context.clearRect(0, 0, width, height);
      if (!points.length) return;
      const time = reduced.matches ? 0 : elapsed;
      const scale = wordmark ? width * .87 : Math.min(width * .70, height * .79);
      // Bomba: giro continuo alrededor del eje Y inclinado (como un globo).
      // ESENCIA: onda longitudinal + balanceo en X/Z; no gira como la bomba.
      const angleY = wordmark ? yaw + Math.sin(time * .8) * .18 : yaw + time * Math.PI * 2 / CONFIG.bombPeriod;
      const angleX = wordmark ? pitch + Math.sin(time * .65) * .36 : pitch - .08;
      const angleZ = wordmark ? Math.sin(time * .7) * .055 : CONFIG.axisTilt;
      const sy = Math.sin(angleY), cy = Math.cos(angleY), sx = Math.sin(angleX), cx = Math.cos(angleX);
      const sz = Math.sin(angleZ), cz = Math.cos(angleZ);
      const projected = [];
      const waveTime = time * CONFIG.wordmarkWaveSpeed;
      for (const p of points) {
        for (let layer = 0; layer < 3; layer++) {
          const wave = wordmark && !reduced.matches ? Math.sin(p.x * 10 - waveTime) * .055 : 0;
          const z = (layer - 1) * CONFIG.depth * (wordmark ? .3 : 1) + wave;
          const py = p.y + (wordmark && !reduced.matches ? Math.sin(p.x * 8 - waveTime) * .015 : 0);
          const x1 = p.x * cy + z * sy, z1 = -p.x * sy + z * cy;
          const y1 = py * cx - z1 * sx, z2 = py * sx + z1 * cx;
          const x2 = x1 * cz - y1 * sz, y2 = x1 * sz + y1 * cz;
          const perspective = 2.5 / (2.5 - z2);
          projected.push({ x: width / 2 + x2 * scale * perspective,
            y: height / 2 - y2 * scale * perspective, z: z2, layer, seed: p.seed });
        }
      }
      projected.sort((a, b) => a.z - b.z);
      const frontLayer = cy >= 0 ? 2 : 0;
      for (const p of projected) {
        const face = p.layer === frontLayer;
        const glint = Math.sin(time * 1.1 + p.seed * 12);
        const bright = face ? 210 + glint * 35 : p.layer === 1 ? 110 : 66;
        context.fillStyle = "rgba(" + Math.round(bright) + "," + Math.round(bright * .99) + "," +
          Math.round(bright * .97) + "," + (face ? .96 : .65) + ")";
        const size = (wordmark ? Math.max(.7, scale / 720) : Math.max(.9, scale / 300)) * (face ? 1.5 : .8);
        if (p.seed > .78 && face) {
          context.beginPath(); context.moveTo(p.x, p.y - size);
          context.lineTo(p.x + size, p.y + size); context.lineTo(p.x - size, p.y + size);
          context.closePath(); context.fill();
        } else context.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      }
    }
    function resize() {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, rect.width); height = Math.max(1, rect.height);
      const ratio = Math.min(devicePixelRatio || 1, CONFIG.pixelRatio);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0); draw();
    }
    function tick(now) {
      frame = 0;
      if (!playing || !visible || document.hidden) { last = 0; return; }
      if (last && now - last < 1000 / 30) { schedule(); return; }
      elapsed += last ? Math.min((now - last) / 1000, .08) : 0; last = now;
      yaw += (targetYaw - yaw) * .08; pitch += (targetPitch - pitch) * .08;
      draw(); schedule();
    }
    function schedule() { if (initialized && playing && visible && !document.hidden && !frame) frame = requestAnimationFrame(tick); }
    function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; }
    const scene = { ready: () => initialized, schedule, stop, draw,
      reset: () => { elapsed = 0; yaw = pitch = targetYaw = targetPitch = 0; } };
    scenes.push(scene);
    host.addEventListener("pointermove", event => {
      if (!playing || event.pointerType !== "mouse") return;
      const rect = host.getBoundingClientRect();
      targetYaw = ((event.clientX - rect.left) / rect.width - .5) * .5;
      targetPitch = -((event.clientY - rect.top) / rect.height - .5) * .25;
    });
    host.addEventListener("pointerleave", () => { targetYaw = targetPitch = 0; });
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) schedule(); else stop();
    }, { threshold: .05 }).observe(host);
    new ResizeObserver(resize).observe(host);
    sample(wordmark ? "wordmark" : "bomb").then(cloud => {
      points = cloud; initialized = true; host.classList.add("is-ready");
      resize(); schedule();
    }).catch(() => {
      // Conserva la imagen original si el navegador bloquea lectura de píxeles.
      host.classList.add("is-fallback");
    });
  }
  hosts.forEach(createScene);
  reduced.addEventListener("change", () => {
    playing = !reduced.matches && !navigator.connection?.saveData;
    scenes.forEach(scene => { scene.stop(); scene.reset(); scene.draw(); if (playing) scene.schedule(); });
  });
  document.addEventListener("visibilitychange", () => {
    scenes.forEach(scene => { if (document.hidden) scene.stop(); else scene.schedule(); });
  });
})();
