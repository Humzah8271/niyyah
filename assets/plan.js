/* ---------- plan page: countdown with stage-aware advice, and the example-journeys slideshow ---------- */
(() => {
  const P = window.NIYYAH_PRODUCTS || {};
  const fmt = d => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

  // ----- countdown -----
  const inp = document.getElementById('tDate');
  if (inp) {
    const big = document.getElementById('daysLeft'), unit = document.getElementById('daysUnit');
    const when = document.getElementById('todoWhen'), title = document.getElementById('todoTitle'), list = document.getElementById('todoList'), reco = document.getElementById('reco');
    const plan = [
      { min: 90, when: '3 months or more before', title: 'Save, choose and learn', reco: ['budget', 'bundle'],
        items: ['Set a budget and start saving', 'Check your passport has 6+ months left on your return date', 'Choose a licensed, well-reviewed travel agent', 'Start learning the steps of Umrah and their duas', 'Walk more to build stamina'] },
      { min: 35, when: '1 to 3 months before', title: 'Get the paperwork moving', reco: ['itinerary', 'journal'],
        items: ['Apply for your visa', 'Check vaccinations with your GP or a travel clinic', 'Book flights and hotels', 'Buy travel insurance', 'Plan your days in Makkah and Madinah'] },
      { min: 8, when: '1 to 5 weeks before', title: 'Gather what you need', reco: ['checklist', 'tote'],
        items: ['Buy ihram, a belt and sandals', 'Download the Nusuk app and check your permits', 'Order personalised gifts now: they take about a week to arrive', 'Ask family and friends what to pray for', 'Print documents and save copies on your phone'] },
      { min: 0, when: 'The final week', title: 'Pack and prepare', reco: ['checklist', 'wallpapers'],
        items: ['Pack using the checklist (it downloads instantly)', 'Cut nails, trim and wash before ihram', 'Charge your phone and power bank', 'Put your ihram in your hand luggage', 'Check your flight time and your miqat point'] }];
    const d0 = new Date(); d0.setDate(d0.getDate() + 56); inp.value = d0.toISOString().slice(0, 10);
    inp.min = new Date().toISOString().slice(0, 10);
    let shown = 0;
    const card = k => { const p = P[k]; if (!p) return ''; return `<a class="mini" href="${p.url}" target="_blank" rel="noopener"><img src="${p.img}" alt="" width="160" height="120" loading="lazy"><span><b>${p.name}</b><em>${p.price}</em></span></a>`; };
    function upd() {
      const t = new Date(inp.value + 'T12:00:00'); if (isNaN(t)) return;
      const today = new Date(); today.setHours(12, 0, 0, 0); const days = Math.max(0, Math.round((t - today) / 864e5));
      const from = shown, to = days, st = performance.now();
      (function anim(now) { const k = Math.min(1, (now - st) / 700); big.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1 && !reduce) requestAnimationFrame(anim); else big.textContent = to; })(st);
      shown = days; unit.textContent = days === 1 ? 'day to go' : 'days to go';
      const p = plan.find(x => days >= x.min) || plan[plan.length - 1];
      when.textContent = p.when; title.textContent = p.title; list.innerHTML = '';
      p.items.forEach(s => { const li = document.createElement('li'); li.textContent = s; list.appendChild(li); });
      reco.innerHTML = p.reco.map(card).join('');
    }
    inp.addEventListener('input', upd); upd();
  }

  // ----- example dates on the slides -----
  document.querySelectorAll('[data-offset]').forEach(el => { const d = new Date(); d.setDate(d.getDate() + +el.dataset.offset); el.textContent = fmt(d); });

  // ----- slideshow: moves on by itself; a thin bar along the bottom fills up, then the next slide comes in -----
  const deck = document.getElementById('deck');
  if (deck) {
    const track = deck.querySelector('.track'), slides = [...deck.querySelectorAll('.slide')], dots = [...deck.querySelectorAll('.dot')];
    const bar = deck.querySelector('.timer i');
    const prev = deck.querySelector('[data-prev]'), next = deck.querySelector('[data-next]');
    const DUR = 10000;
    let i = 0, elapsed = 0, last = 0, hover = false, onScreen = false;
    function go(n) {
      i = (n + slides.length) % slides.length; elapsed = 0;
      track.style.transform = `translateX(${-100 * i}%)`;
      slides.forEach((s, k) => { s.setAttribute('aria-hidden', k !== i); s.inert = k !== i; });
      dots.forEach((d, k) => d.setAttribute('aria-current', k === i));
      bar.style.transform = 'scaleX(0)';
    }
    function tick(now) {
      const dt = last ? now - last : 0; last = now;
      if (onScreen && !hover && !document.hidden) {
        elapsed += Math.min(dt, 100);
        bar.style.transform = `scaleX(${Math.min(1, elapsed / DUR)})`;
        if (elapsed >= DUR) go(i + 1);
      }
      requestAnimationFrame(tick);
    }
    prev.addEventListener('click', () => go(i - 1)); next.addEventListener('click', () => go(i + 1));
    dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
    deck.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') go(i - 1); if (e.key === 'ArrowRight') go(i + 1); });
    let sx = null; track.addEventListener('pointerdown', e => { sx = e.clientX; });
    track.addEventListener('pointerup', e => { if (sx !== null && Math.abs(e.clientX - sx) > 40) go(i + (e.clientX < sx ? 1 : -1)); sx = null; });
    if (fine) { deck.addEventListener('pointerenter', () => { hover = true; }); deck.addEventListener('pointerleave', () => { hover = false; }); }
    new IntersectionObserver(es => { onScreen = es[0].isIntersecting; }, { threshold: .35 }).observe(deck);
    go(0); requestAnimationFrame(tick);
  }
})();
