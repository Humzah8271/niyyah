/* ---------- tawaf and sa'i instruments ---------- */
(() => {
  const ticks = document.getElementById('tawafTicks'); if (!ticks) return;
  const NS = 'http://www.w3.org/2000/svg';
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 - i * 2 * Math.PI / 7; const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', 150 + 132 * Math.cos(a)); c.setAttribute('cy', 150 + 132 * Math.sin(a)); c.setAttribute('r', 3); c.setAttribute('fill', 'rgba(214,186,128,.25)'); ticks.appendChild(c); }
  const tickEls = [...ticks.children];
  const arc = document.getElementById('tawafArc'), pil = document.getElementById('pilgrim'), pg = document.getElementById('pilgrimGlow'), tn = document.getElementById('tawafN');
  const dots = document.getElementById('saiDots');
  for (let i = 0; i < 7; i++) { const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', 110 + i * 20); c.setAttribute('cy', 40); c.setAttribute('r', 4); c.setAttribute('fill', 'rgba(214,186,128,.2)'); dots.appendChild(c); }
  const dotEls = [...dots.children];
  const walker = document.getElementById('walker'), wg = document.getElementById('walkerGlow'), sn = document.getElementById('saiN'), sd = document.getElementById('saiDir'), pace = document.getElementById('saiPace');

  // Tawaf: 5.5s per circuit. Sa'i: distance-based, slow walk, brisk between the green lights.
  const TAWAF_SEC = 5.5, X0 = 40, X1 = 300, G0 = 128, G1 = 212, SLOW = 34, FAST = 95; // px per second
  let tp = 0, lap = 0, wx = X0, tPlay = !reduce, sPlay = !reduce, last = performance.now(), visible = true;

  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const speedAt = x => { const inG = smooth(G0 - 14, G0 + 6, x) * (1 - smooth(G1 - 6, G1 + 14, x)); return SLOW + (FAST - SLOW) * inG; };

  function render() {
    const l = Math.min(6, Math.floor(tp)), frac = tp - Math.floor(tp);
    const a = -Math.PI / 2 - frac * 2 * Math.PI;
    const x = 150 + 118 * Math.cos(a), y = 150 + 118 * Math.sin(a);
    pil.setAttribute('cx', x); pil.setAttribute('cy', y); pg.setAttribute('cx', x); pg.setAttribute('cy', y);
    arc.setAttribute('d', frac < .002 ? '' : `M150 32 A118 118 0 ${frac > .5 ? 1 : 0} 0 ${x.toFixed(2)} ${y.toFixed(2)}`);
    tn.textContent = l + 1;
    tickEls.forEach((c, i) => c.setAttribute('fill', i < l ? '#D6B472' : 'rgba(214,186,128,.25)'));
    walker.setAttribute('cx', wx); wg.setAttribute('cx', wx);
    const forward = lap % 2 === 0;
    sn.textContent = lap + 1; sd.textContent = forward ? 'Safa → Marwah' : 'Marwah → Safa';
    const brisk = wx > G0 && wx < G1;
    if (pace) pace.textContent = brisk ? 'brisk' : 'walking';
    wg.setAttribute('fill', brisk ? 'rgba(140,220,180,.25)' : 'rgba(243,223,176,.18)');
    dotEls.forEach((c, i) => c.setAttribute('fill', i < lap ? '#D6B472' : 'rgba(214,186,128,.2)'));
  }
  function stepSai(dt) {
    const forward = lap % 2 === 0;
    wx += (forward ? 1 : -1) * speedAt(wx) * dt;
    if (forward && wx >= X1) { wx = X1; lap++; } else if (!forward && wx <= X0) { wx = X0; lap++; }
    if (lap >= 7) { lap = 0; wx = X0; }
  }
  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (visible) {
      if (tPlay) { tp += dt / TAWAF_SEC; if (tp >= 7) tp = 0; }
      if (sPlay) stepSai(dt);
      render();
    }
    requestAnimationFrame(loop);
  }
  const tog = (btn, get, set) => btn.addEventListener('click', () => { set(!get()); btn.textContent = get() ? 'Pause' : 'Play'; btn.setAttribute('aria-pressed', get()); });
  tog(document.getElementById('tawafPlay'), () => tPlay, v => tPlay = v);
  tog(document.getElementById('saiPlay'), () => sPlay, v => sPlay = v);
  document.getElementById('tawafStep').addEventListener('click', () => { tp = (Math.floor(tp) + 1) % 7; render(); });
  document.getElementById('saiStep').addEventListener('click', () => { lap = (lap + 1) % 7; wx = lap % 2 === 0 ? X0 : X1; render(); });
  if (reduce) { document.getElementById('tawafPlay').textContent = 'Play'; document.getElementById('saiPlay').textContent = 'Play'; tp = 2; lap = 2; }
  const host = document.getElementById('journey');
  if (host && 'IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(host);
  render(); requestAnimationFrame(loop);
})();
