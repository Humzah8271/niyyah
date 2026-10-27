/* ---------- starfield: 30fps, gentle twinkle, an occasional star that glints ---------- */
(() => {
  const c = document.getElementById('sky'); if (!c) return;
  const x = c.getContext('2d');
  let w, h, stars = [], mx = .5, glow, last = 0, glints = [], nextGlint = 0;
  function size() {
    const d = Math.min(devicePixelRatio || 1, 1.5);
    w = innerWidth; h = innerHeight; c.width = w * d; c.height = h * d; x.setTransform(d, 0, 0, d, 0, 0);
    stars = Array.from({ length: Math.min(170, Math.round(w * h / 11000)) }, () => ({ x: Math.random() * w, y: Math.random() * h, z: Math.random() * .9 + .1, p: Math.random() * 6.28, s: .6 + Math.random() * 1.4 }));
    glow = x.createRadialGradient(w * .75, h * .2, 0, w * .75, h * .2, Math.max(w, h) * .8);
    glow.addColorStop(0, 'rgba(24,52,43,.55)'); glow.addColorStop(1, 'rgba(6,11,9,0)');
  }
  function glint(px, py, k, r) {
    const a = Math.sin(Math.PI * k);
    x.save(); x.translate(px, py); x.globalCompositeOperation = 'lighter';
    const g = x.createRadialGradient(0, 0, 0, 0, 0, r * 1.2);
    g.addColorStop(0, `rgba(255,240,205,${.55 * a})`); g.addColorStop(1, 'rgba(255,240,205,0)');
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, r * 1.2, 0, 6.283); x.fill();
    x.strokeStyle = `rgba(255,236,196,${.8 * a})`; x.lineWidth = 1;
    x.beginPath(); x.moveTo(-r * a * 2, 0); x.lineTo(r * a * 2, 0); x.moveTo(0, -r * a * 2); x.lineTo(0, r * a * 2); x.stroke();
    x.restore();
  }
  function draw(t) {
    if (!reduce) requestAnimationFrame(draw);
    if (t - last < 33) return; last = t;
    x.clearRect(0, 0, w, h); x.fillStyle = glow; x.fillRect(0, 0, w, h);
    const sy = scrollY * .05;
    const pos = s => [((s.x + (mx - .5) * 30 * s.z) % w + w) % w, ((s.y - sy * s.z) % h + h) % h];
    for (const s of stars) {
      const tw = .35 + .65 * Math.pow(Math.abs(Math.sin(t / (1100 * s.s) + s.p)), 3);
      const [px, py] = pos(s);
      x.fillStyle = `rgba(243,223,176,${.1 + .55 * s.z * tw})`;
      x.fillRect(px, py, s.z * 2, s.z * 2);
    }
    if (!reduce && t > nextGlint && stars.length) {
      glints.push({ s: stars[Math.floor(Math.random() * stars.length)], t0: t, d: 900 + Math.random() * 700, r: 6 + Math.random() * 6 });
      nextGlint = t + 700 + Math.random() * 1800;
    }
    glints = glints.filter(g => t - g.t0 < g.d);
    for (const g of glints) { const [px, py] = pos(g.s); glint(px + g.s.z, py + g.s.z, (t - g.t0) / g.d, g.r); }
  }
  size(); addEventListener('resize', size);
  if (fine) addEventListener('pointermove', e => { mx = e.clientX / innerWidth; }, { passive: true });
  requestAnimationFrame(draw);
})();
