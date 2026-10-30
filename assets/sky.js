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
