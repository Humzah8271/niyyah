/* ---------- shared: flags, progress bar, nav state, card tilt, reveal ---------- */
document.documentElement.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;
/* every page opens at the top, unless the link points at a section (#faq) */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const toTop = () => { if (!location.hash) { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, 0); document.documentElement.style.scrollBehavior = ''; } };
toTop(); addEventListener('DOMContentLoaded', toTop); addEventListener('load', () => setTimeout(toTop, 0)); addEventListener('pageshow', toTop);
(() => {
  const bar = document.querySelector('.progress');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const m = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.transform = `scaleX(${m > 0 ? scrollY / m : 0})`;
      document.documentElement.classList.toggle('scrolled', scrollY > 30);
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  if (fine && !reduce) {
    document.querySelectorAll('[data-tilt]').forEach(c => {
      let r;
      c.addEventListener('pointerenter', () => { r = c.getBoundingClientRect(); });
      c.addEventListener('pointermove', e => {
        if (!r) r = c.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        c.style.transform = `rotateY(${(px - .5) * 8}deg) rotateX(${(.5 - py) * 8}deg)`;
        c.style.setProperty('--gx', px * 100 + '%'); c.style.setProperty('--gy', py * 100 + '%');
      });
      c.addEventListener('pointerleave', () => { c.style.transform = ''; r = null; });
    });
  }

  const els = [...document.querySelectorAll('.reveal')];
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('pre'); io.observe(el); } });
  }
})();
