/* ---------- starfield: 30fps, gentle twinkle, an occasional faint glint ---------- */
(() => {
  const c = document.getElementById('sky'); if (!c) return;
  const x = c.getContext('2d');
  let w, h, stars = [], mx = .5, glow, last = 0, glints = [], nextGlint = 0;
  function size() {
    const d = 1; // one canvas pixel per CSS pixel keeps this cheap; stars are tiny anyway
    w = innerWidth; h = innerHeight; c.width = w * d; c.height = h * d; x.setTransform(d, 0, 0, d, 0, 0);
    stars = Array.from({ length: Math.min(120, Math.round(w * h / 14000)) }, () => ({ x: Math.random() * w, y: Math.random() * h, z: Math.random() * .9 + .1, p: Math.random() * 6.28, s: .6 + Math.random() * 1.4 }));
    glow = x.createRadialGradient(w * .75, h * .2, 0, w * .75, h * .2, Math.max(w, h) * .8);
    glow.addColorStop(0, 'rgba(24,52,43,.55)'); glow.addColorStop(1, 'rgba(6,11,9,0)');
  }
  // a faint, slow brightening of one star now and then: only noticeable if you happen to be looking at it
  function glint(px, py, k, r) {
    const a = Math.pow(Math.sin(Math.PI * k), 2);
    const g = x.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, `rgba(255,240,205,${.22 * a})`); g.addColorStop(1, 'rgba(255,240,205,0)');
    x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 6.283); x.fill();
  }
  function draw(t) {
    if (window.NIYYAH_LEAVING) return;
    if (!reduce) requestAnimationFrame(draw);
    if (t - last < 66) return; last = t; // ~15 frames a second is plenty for a slow twinkle
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
      glints.push({ s: stars[Math.floor(Math.random() * stars.length)], t0: t, d: 1800 + Math.random() * 1200, r: 2.5 + Math.random() * 1.5 });
      nextGlint = t + 4000 + Math.random() * 5000;
    }
    glints = glints.filter(g => t - g.t0 < g.d);
    for (const g of glints) { const [px, py] = pos(g.s); glint(px + g.s.z, py + g.s.z, (t - g.t0) / g.d, g.r); }
  }
  size(); addEventListener('resize', size);
  if (fine) addEventListener('pointermove', e => { mx = e.clientX / innerWidth; }, { passive: true });
  requestAnimationFrame(draw);
})();
