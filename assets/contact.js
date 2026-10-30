/* contact form: sends in the background and shows a thank-you; falls back to a normal post */
(() => {
  const f = document.getElementById('contactForm'); if (!f) return;
  const st = f.querySelector('.cf-status'), btn = f.querySelector('button');
  const topic = document.getElementById('cTopic'), message = document.getElementById('cMsg');
  const groupTemplate = 'Hello Niyyah,\n\nI’m interested in an order for a group.\n\nProducts we are interested in: [please fill in]\nNumber of people / items: [please fill in]\nDate needed: [please fill in]\nTravel date, if known: [please fill in]\nPersonalisation required: [names or other details]\nDelivery town and postcode: [please fill in]\nBudget, if known: [please fill in]\n\nOther questions: [add anything else here]';
  let previousTopic = topic.value;
  const drafts = new Map();
  function updateTopic() {
    drafts.set(previousTopic, message.value);
    message.value = drafts.get(topic.value) ?? (topic.value === 'Group order' ? groupTemplate : '');
    previousTopic = topic.value;
  }
  topic.addEventListener('change', updateTopic);
  document.querySelectorAll('[data-group-enquiry]').forEach(link => link.addEventListener('click', () => {
    if(topic.value !== 'Group order'){topic.value='Group order';updateTopic();}
    message.focus({preventScroll:true});
  }));
  if(new URLSearchParams(location.search).get('topic')==='group'){topic.value='Group order';updateTopic();}
  if (/[?&]sent=1/.test(location.search)) st.textContent = 'Thank you, your message has been sent. We\'ll reply by email.';
  f.addEventListener('submit', async e => {
    if (!window.fetch) return; e.preventDefault();
    if (f._honey && f._honey.value) return;
    btn.disabled = true; st.classList.remove('err'); st.textContent = 'Sending…';
    try {
      const r = await fetch(f.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(f) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.success === 'false' || j.success === false) throw new Error(j.message || 'failed');
      f.reset(); drafts.clear();previousTopic=topic.value; st.textContent = 'Thank you, your message has been sent. We\'ll reply by email.';
    } catch (err) { st.classList.add('err'); st.innerHTML = 'Sorry, that didn\'t send. Please email <a class="tlink" href="mailto:support@niyyahpackages.com">support@niyyahpackages.com</a>.'; }
    btn.disabled = false;
  });
})();
