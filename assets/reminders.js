/* One timeline for every handover, including the third verse back to the first. */
function reminderFrame(elapsed, count) {
  if (elapsed < 8000) return {index:0, opacity:1};
  const time = elapsed - 8000, cycle = Math.floor(time / 8000), phase = time % 8000;
  const ease = t => (1 - Math.cos(Math.PI * t)) / 2;
  if (phase < 1500) return {index:cycle % count, opacity:1 - ease(phase / 1500)};
  if (phase < 3000) return {index:(cycle + 1) % count, opacity:ease((phase - 1500) / 1500)};
  return {index:(cycle + 1) % count, opacity:1};
}
if (typeof module !== 'undefined' && module.exports) module.exports = {reminderFrame};
/* Fixed-height sequential fades: scrolling and hovering never pause the clock. */
(() => {
  if (typeof document === 'undefined') return;
  const section = document.querySelector('.page-reminder');
  if (!section) return;
  const slides = [...section.querySelectorAll('.reminder-slide')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const stage = section.querySelector('.reminder-slides');
  let index = -1, elapsed = 0, last = performance.now(), previousOpacity = '';
  function draw(now) {
    if (!motion.matches) elapsed += now - last;
    last = now;
    const frame = reminderFrame(elapsed, slides.length);
    if (frame.index !== index) {
      index = frame.index;
      slides.forEach((slide, i) => {
        slide.classList.toggle('is-active', i === index);
        slide.setAttribute('aria-hidden', String(i !== index));
        slide.inert = i !== index;
      });
    }
    const opacity = motion.matches ? '1' : String(frame.opacity);
    if (opacity !== previousOpacity) {stage.style.opacity = opacity;previousOpacity = opacity;}
    requestAnimationFrame(draw);
  }
  motion.addEventListener('change', () => {last = performance.now();});
  requestAnimationFrame(draw);

  // One shared minute clock across page navigation in this browser tab.
  let started = Date.now();
  try {
    const stored = Number(sessionStorage.getItem('niyyah-sky-start'));
    if (stored > 0 && stored <= started) started = stored;
    else sessionStorage.setItem('niyyah-sky-start', String(started));
  } catch (_) { /* A per-page clock still works if storage is unavailable. */ }
  let minute = Math.floor((Date.now() - started) / 60000);
  setInterval(() => {
    const current = Math.floor((Date.now() - started) / 60000);
    if (current <= minute) return;
    minute = current;
    if (motion.matches || document.hidden) return;
    const star = document.createElement('i');
    star.className = 'shooting-star'; star.setAttribute('aria-hidden', 'true');
    star.style.left = `${10 + Math.random() * 45}%`;
    star.style.top = `${58 + Math.random() * 15}%`;
    section.appendChild(star);
    const flight = star.animate([
      {opacity:0, transform:'translate(-40px, 25px) rotate(-24deg)'},
      {opacity:.28, offset:.3},
      {opacity:0, transform:'translate(140px, -55px) rotate(-24deg)'}
    ], {duration:2300,easing:'ease-out'});
    flight.onfinish = () => star.remove();
  }, 250);
})();
