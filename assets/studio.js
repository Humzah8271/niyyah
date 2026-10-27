/* ---------- personalisation studio ---------- */
(() => {
  const n = document.getElementById('pName'), y = document.getElementById('pYear'), mug = document.getElementById('mugG'), tote = document.getElementById('toteG');
  const bm = document.getElementById('pickMug'), bt = document.getElementById('pickTote'), buy = document.getElementById('studioBuy');
  const urls = { mug: 'https://www.etsy.com/uk/listing/4603538553', tote: 'https://www.etsy.com/uk/listing/4603538707' };
  function fit(el, max, base) { el.setAttribute('font-size', base); try { const w = el.getComputedTextLength(); if (w > max) el.setAttribute('font-size', base * max / w); } catch (e) {} }
  function upd() { const name = (n.value.trim() || 'Raheema');
    const mn = document.getElementById('mugName'); mn.textContent = name; fit(mn, 190, 40);
    const tn = document.getElementById('toteName'); tn.textContent = name + "'s"; fit(tn, 190, 30);
    document.getElementById('toteYear').textContent = (y.value.replace(/\D/g, '') || '2026'); }
  function pick(which) { const isMug = which === 'mug'; mug.setAttribute('visibility', isMug ? 'visible' : 'hidden'); tote.setAttribute('visibility', isMug ? 'hidden' : 'visible');
    bm.setAttribute('aria-pressed', isMug); bt.setAttribute('aria-pressed', !isMug); buy.href = urls[which];
    buy.firstChild.textContent = isMug ? 'Order the mug on Etsy ' : 'Order the tote on Etsy '; y.style.visibility = isMug ? 'hidden' : 'visible'; }
  n.addEventListener('input', upd); y.addEventListener('input', upd);
  bm.addEventListener('click', () => pick('mug')); bt.addEventListener('click', () => pick('tote'));
  upd(); pick('mug');
})();

