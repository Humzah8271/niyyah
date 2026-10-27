/* ---------- shop filters (all products are in the page; this only hides and shows) ---------- */
(() => {
  const bar = document.getElementById('filters'); if (!bar) return;
  const cards = [...document.querySelectorAll('.grid .card')];
  bar.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    bar.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    const f = b.dataset.f;
    cards.forEach(c => { c.hidden = f !== 'all' && c.dataset.kind !== f; });
  });
})();
