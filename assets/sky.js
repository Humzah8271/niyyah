/* Stable star positions: browser toolbar resizing never regenerates the sky. */
(() => {
  const canvas = document.getElementById('sky');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const stars = Array.from({length:150}, () => ({
    x:Math.random(), y:Math.random(), z:.1 + Math.random() * .9,
    phase:Math.random() * Math.PI * 2, speed:1100 * (.6 + Math.random() * 1.4)
  }));
  let width = 0, height = 0, glow, frame, last = -Infinity;
  function paint(time) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
    const count = Math.round(Math.min(120, Math.round(width * height / 14000)) * 1.25);
    for (let i = 0; i < count; i++) {
      const star = stars[i];
      const twinkle = motion.matches ? .7 : .35 + .65 * Math.pow(Math.abs(Math.sin(time / star.speed + star.phase)), 3);
      ctx.fillStyle = `rgba(243,223,176,${.14 + .58 * star.z * twinkle})`;
      ctx.fillRect(star.x * width, star.y * height, star.z * 2, star.z * 2);
    }
  }
  function size() {
    const bounds = canvas.getBoundingClientRect();
    const nextWidth = Math.round(bounds.width), nextHeight = Math.round(bounds.height);
    if (nextWidth === width && nextHeight === height) return;
    width = nextWidth; height = nextHeight;
    canvas.width = width; canvas.height = height;
    glow = ctx.createRadialGradient(width * .75, height * .2, 0, width * .75, height * .2, Math.max(width,height) * .8);
    glow.addColorStop(0, 'rgba(24,52,43,.55)'); glow.addColorStop(1, 'rgba(6,11,9,0)');
    paint(performance.now());
  }
  function draw(time) {
    if (motion.matches || document.hidden) return;
    if (time - last >= 66) { paint(time); last = time; }
    frame = requestAnimationFrame(draw);
  }
  function restart() {
    cancelAnimationFrame(frame);
    size(); paint(performance.now());
    if (!motion.matches && !document.hidden) frame = requestAnimationFrame(draw);
  }
  addEventListener('resize', size, {passive:true});
  document.addEventListener('visibilitychange', restart);
  motion.addEventListener('change', restart);
  restart();
})();

/* Shooting stars across the whole site. Each star repeats every 60 seconds, and each
   has its own fixed start offset so they never all appear together. The clock is shared
   across pages in this tab, so moving between pages doesn't reset the rhythm. */
(() => {
  if (typeof document === 'undefined' || !document.body) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const PERIOD = 60000, COUNT = 5;
  let started = Date.now();
  try {
    const stored = Number(sessionStorage.getItem('niyyah-sky-start'));
    if (stored > 0 && stored <= started) started = stored;
    else sessionStorage.setItem('niyyah-sky-start', String(started));
  } catch (_) { /* Without storage, each page keeps its own clock. */ }
  // Offsets spread through the minute (about 12 s apart) with a little variation, fixed for the visit.
  let seed = started % 2147483647 || 1;
  const rand = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const offsets = Array.from({length:COUNT}, (_, i) => i * (PERIOD / COUNT) + rand() * 7000 + 2000);
  const layer = document.createElement('div');
  layer.className = 'star-layer'; layer.setAttribute('aria-hidden', 'true');
  document.body.prepend(layer);
  const cycle = i => Math.floor((Date.now() - started - offsets[i]) / PERIOD);
  const seen = offsets.map((_, i) => cycle(i));
  // Each star takes its own direction, at least 60 degrees away from the one before.
  let lastAngle = null;
  function pickAngle() {
    let angle = Math.random() * 360;
    if (lastAngle !== null) angle = (lastAngle + 60 + Math.random() * 240) % 360;
    return lastAngle = angle;
  }
  function fly() {
    const star = document.createElement('i');
    star.className = 'shooting-star';
    star.style.left = `${5 + Math.random() * 75}%`;
    star.style.top = `${6 + Math.random() * 70}%`;
    layer.appendChild(star);
    const angle = pickAngle(), rad = angle * Math.PI / 180;
    const at = distance => `translate(${(Math.cos(rad) * distance).toFixed(1)}px, ${(Math.sin(rad) * distance).toFixed(1)}px) rotate(${angle.toFixed(1)}deg)`;
    const flight = star.animate([
      {opacity:0, transform:at(-47)},
      {opacity:.28, offset:.3},
      {opacity:0, transform:at(150)}
    ], {duration:2300, easing:'ease-out'});
    flight.onfinish = () => star.remove();
  }
  setInterval(() => {
    offsets.forEach((_, i) => {
      const c = cycle(i);
      if (c <= seen[i]) return;
      seen[i] = c;
      if (!motion.matches && !document.hidden) fly();
    });
  }, 250);
})();
