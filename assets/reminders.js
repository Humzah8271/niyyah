/* Fixed-height crossfades: scrolling and hovering never pause the clock. */
(() => {
  const section = document.querySelector('.page-reminder');
  if (!section) return;
  const slides = [...section.querySelectorAll('.reminder-slide')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, paused = motion.matches, elapsed = 0, last = performance.now();
  function show(next) {
    index = next % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index);
      slide.setAttribute('aria-hidden', String(i !== index));
      slide.inert = i !== index;
    });
  }
  motion.addEventListener('change', () => {paused = motion.matches; last = performance.now();});
  setInterval(() => {
    const now = performance.now();
    if (!paused) elapsed += now - last;
    last = now;
    if (elapsed >= 8000) {show(index + Math.floor(elapsed / 8000)); elapsed %= 8000;}
  }, 100);

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
