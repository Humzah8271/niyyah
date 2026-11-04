/* contact and launch-list forms: send in the background, then go to the thank-you page */
(() => {
  const f = document.getElementById('contactForm'); if (!f) return;
  const st = f.querySelector('.cf-status');
  const topic = document.getElementById('cTopic'), message = document.getElementById('cMsg');
  const groupTemplate = 'السلام عليكم ورحمة الله وبركاته،\n\nI’m interested in an order for a group.\n\nProducts we are interested in: [please fill in]\nNumber of people / items: [please fill in]\nDate needed: [please fill in]\nTravel date, if known: [please fill in]\nPersonalisation required: [names or other details]\nDelivery town and postcode: [please fill in]\nBudget, if known: [please fill in]\n\nOther questions: [add anything else here]';
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
  /* both forms post to Web3Forms in the background, then go to the thank-you page */
  function wire(form) {
    const status = form.querySelector('.cf-status'), button = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', async e => {
      if (!window.fetch) return; e.preventDefault();
      if (form.botcheck && form.botcheck.checked) return;
      button.disabled = true; status.classList.remove('err'); status.textContent = 'Sending…';
      try {
        const r = await fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || j.success !== true) throw new Error(j.message || 'failed');
        location.href = form.dataset.next; return;
      } catch (err) { status.classList.add('err'); status.innerHTML = 'Sorry, that didn\'t send. Please email <a class="tlink" href="mailto:support@niyyahpackages.com">support@niyyahpackages.com</a>.'; }
      button.disabled = false;
    });
  }
  wire(f);
  const notify = document.querySelector('.notify-form'); if (notify) wire(notify);
})();
