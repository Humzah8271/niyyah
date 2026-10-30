/* ---------- shared: flags, progress bar, nav state, card tilt, reveal ---------- */
document.documentElement.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;
/* every page opens at the top, unless the link points at a section (#faq) */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const toTop = () => { if (!location.hash) { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, 0); document.documentElement.style.scrollBehavior = ''; } };
toTop();
/* the moment a link to another page is pressed, stop every animation so the browser can switch pages straight away */
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href]'); if (!a || a.target === '_blank' || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
  const u = new URL(a.href, location.href); if (u.origin === location.origin && u.pathname !== location.pathname) window.NIYYAH_LEAVING = true;
}, true);
addEventListener('pageshow', () => { window.NIYYAH_LEAVING = false; });
/* pages load ahead of time: on hover or touch of a link, and the main pages once this one is idle, so clicks feel instant */
(() => {
  const done = new Set([location.pathname]);
  const fetchPage = href => { try { const u = new URL(href, location.href); if (u.origin !== location.origin || done.has(u.pathname)) return; done.add(u.pathname);
    const l = document.createElement('link'); l.rel = 'prefetch'; l.href = u.pathname; document.head.appendChild(l); } catch (e) {} };
  const near = e => { const a = e.target.closest && e.target.closest('a[href]'); if (a && !a.target) fetchPage(a.href); };
  document.addEventListener('pointerover', near, { passive: true }); document.addEventListener('touchstart', near, { passive: true });
  const idle = window.requestIdleCallback || (f => setTimeout(f, 1500));
  addEventListener('load', () => idle(() => document.querySelectorAll('.nav a, .next-page a').forEach(a => fetchPage(a.href))));
})();
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
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('pre'); io.unobserve(e.target); } }), { rootMargin: '0px 0px 100px 0px' });
    els.forEach(el => { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('pre'); io.observe(el); } });
  }
})();
/* Close the mobile navigation with Escape or an outside click. */
(() => {
  const menu=document.querySelector('.mobile-menu');if(!menu)return;
  const summary=menu.querySelector('summary');
  menu.addEventListener('toggle',()=>summary.setAttribute('aria-label',menu.open?'Close navigation':'Open navigation'));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){menu.open=false;summary.focus();}});
  document.addEventListener('click',e=>{if(menu.open&&!menu.contains(e.target))menu.open=false;});
})();
