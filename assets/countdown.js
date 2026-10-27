/* ---------- countdown ---------- */
(() => {
  const inp = document.getElementById('tDate'), big = document.getElementById('daysLeft'), unit = document.getElementById('daysUnit');
  const when = document.getElementById('todoWhen'), title = document.getElementById('todoTitle'), list = document.getElementById('todoList');
  const plan = [
    { min: 42, when: '6 to 8 weeks before', title: 'Get the paperwork moving', items: ['Check your passport has 6+ months left', 'Check vaccinations with your GP or travel clinic', 'Apply for your visa', 'Book flights and hotels', 'Buy travel insurance'] },
    { min: 14, when: '2 to 4 weeks before', title: 'Gather what you need', items: ['Download the Nusuk app and check permits', 'Buy ihram, belt and sandals', 'Walk more to build stamina', 'Learn the steps and duas of Umrah', 'Order any personalised gifts'] },
    { min: 2, when: 'The week before', title: 'Pack and prepare', items: ['Pack using the checklist', 'Print documents and save copies on your phone', 'Tell your bank you are travelling', 'Ask family what to pray for', 'Settle debts and make amends where you can'] },
    { min: -1, when: 'The day before', title: 'Final things', items: ['Cut nails, trim and wash before ihram', 'Charge phone and power bank', 'Put ihram in your hand luggage', 'Check flight time and your miqat point', 'Rest and make your intention clear'] }];
  const d0 = new Date(); d0.setDate(d0.getDate() + 56); inp.value = d0.toISOString().slice(0, 10);
  inp.min = new Date().toISOString().slice(0, 10);
  let shown = 0;
  function upd() { const t = new Date(inp.value + 'T12:00:00'); if (isNaN(t)) return;
    const days = Math.max(0, Math.ceil((t - new Date()) / 864e5));
    const from = shown, to = days, st = performance.now();
    (function anim(now) { const k = Math.min(1, (now - st) / 700); const v = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))); big.textContent = v; if (k < 1 && !reduce) requestAnimationFrame(anim); else big.textContent = to; })(st);
    shown = days; unit.textContent = days === 1 ? 'day to go' : 'days to go';
    const p = plan.find(x => days >= x.min) || plan[3];
    when.textContent = p.when; title.textContent = p.title; list.innerHTML = '';
    p.items.forEach(s => { const li = document.createElement('li'); li.textContent = s; list.appendChild(li); }); }
  inp.addEventListener('input', upd); upd();
})();
