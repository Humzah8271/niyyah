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

})();
