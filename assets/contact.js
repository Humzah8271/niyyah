/* contact form: sends in the background and shows a thank-you; falls back to a normal post */
(() => {
  const f = document.getElementById('contactForm'); if (!f) return;
  const st = f.querySelector('.cf-status'), btn = f.querySelector('button');
  if (/[?&]sent=1/.test(location.search)) st.textContent = 'Thank you, your message has been sent. We\'ll reply by email.';
  f.addEventListener('submit', async e => {
    if (!window.fetch) return; e.preventDefault();
    if (f._honey && f._honey.value) return;
    btn.disabled = true; st.classList.remove('err'); st.textContent = 'Sending…';
    try {
      const r = await fetch(f.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(f) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.success === 'false' || j.success === false) throw new Error(j.message || 'failed');
      f.reset(); st.textContent = 'Thank you, your message has been sent. We\'ll reply by email.';
    } catch (err) { st.classList.add('err'); st.innerHTML = 'Sorry, that didn\'t send. Please email <a class="tlink" href="mailto:niyyahpackages@gmail.com">niyyahpackages@gmail.com</a>.'; }
    btn.disabled = false;
  });
})();
