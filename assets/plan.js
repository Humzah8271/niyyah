/* Recommendations use current individual planning products, never overlapping bundles. */
(() => {
  const products = {
    budget: {name:'Umrah Budget Planner', image:'budget.jpg', url:'4603861064', why:'Plan your costs, keep track of savings and record spending during your trip.'},
    itinerary: {name:'Umrah Itinerary Planner', image:'itinerary.jpg', url:'4603839913', why:'Keep your flights, hotels, contacts and daily plans together.'},
    checklist: {name:'Umrah Packing Checklist', image:'checklist.jpg', url:'4603511710', why:'Work through your packing list so you can see what is ready and what is still needed.'},
    journal: {name:'Umrah Journal', image:'journal.jpg', url:'4603560523', why:'Keep a list of duas for loved ones and write down your experiences and reflections.'}
  };
  const questions = [
    {title:'Roughly when are you hoping to leave?', choices:[['later','More than 30 days from now'],['month','In 15–30 days'],['soon','Within the next 14 days']]},
    {title:'What would help you most?', choices:[['budget','Managing my costs'],['itinerary','Organising my trip'],['checklist','Knowing what to pack']]},
    {title:'What else matters to you?', choices:[['details','Keeping important details together'],['reflection','Making time for duas and reflection'],['prepared','Feeling prepared before I leave']]}
  ];
  function recommend(answers) {
    if (answers.length !== 3 || answers.some((a,i) => !questions[i].choices.some(c => c[0] === a))) return [];
    const scores = {budget:0,itinerary:1,checklist:0,journal:0};
    scores[{later:'budget',month:'itinerary',soon:'checklist'}[answers[0]]] += 2;
    scores[answers[1]] += 10;
    scores[{details:'itinerary',reflection:'journal',prepared:'checklist'}[answers[2]]] += 6;
    return Object.keys(products).sort((a,b) => scores[b]-scores[a]).slice(0,3);
  }
  function daysUntil(value, today = new Date()) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [y,m,d] = value.split('-').map(Number);
    const day = new Date(Date.UTC(y,m-1,d));
    if (day.getUTCFullYear() !== y || day.getUTCMonth() !== m-1 || day.getUTCDate() !== d) return null;
    return Math.round((day.getTime()-Date.UTC(today.getFullYear(),today.getMonth(),today.getDate()))/86400000);
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {recommend,daysUntil,questions,products};
  if (typeof document === 'undefined') return;
  const form = document.getElementById('planning-form'); if (!form) return;
  const byId = id => document.getElementById(id);
  let step = 0, answers = [null,null,null], tipIndex = 0, advanceTimer;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let tipsPaused=motion.matches, tipsVisible=false, tipElapsed=0, tipLast=performance.now();
  const tips = [
    ['Start with your budget','Write down the main costs first: travel, accommodation and everyday spending. A rough plan is enough to get started.','budget'],
    ['Keep your plans together','Put your flight details, hotel bookings and important contacts in one place, so they’re easy to find when you need them.','itinerary'],
    ['Pack a little at a time','Make a list, gather what you already have, and tick things off as you pack. You don’t need to do it all in one day.','checklist']
  ];
  function showTip() {
    const [title,body,key] = tips[tipIndex], product = products[key];
    byId('planning-tip').innerHTML = `<h3>${title}</h3><p>${body}</p><a href="https://www.etsy.com/uk/listing/${product.url}" target="_blank" rel="noopener">View the ${product.name} on Etsy ↗</a>`;
    byId('tip-count').textContent = `Tip ${tipIndex+1} of 3`;
    byId('planning-tip').getAnimations().forEach(a=>a.cancel());
    if(!motion.matches) byId('planning-tip').animate([{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:600,easing:'ease-out'});tipElapsed=0;
  }
  byId('tip-prev').addEventListener('click',()=>{tipIndex=(tipIndex+2)%3;showTip();});
  byId('tip-next').addEventListener('click',()=>{tipIndex=(tipIndex+1)%3;showTip();});
  const tipCard=document.querySelector('.tip-card');
  function syncTips(){byId('tip-toggle').textContent=tipsPaused?'▶':'Ⅱ';byId('tip-toggle').setAttribute('aria-label',tipsPaused?'Play tips':'Pause tips');}
  byId('tip-toggle').addEventListener('click',()=>{tipsPaused=!tipsPaused;syncTips();});
  motion.addEventListener('change',()=>{tipsPaused=motion.matches;syncTips();});
  new IntersectionObserver(entries=>{tipsVisible=entries[0].isIntersecting;}).observe(tipCard);
  function tickTips(now){const elapsed=Math.min(now-tipLast,100);tipLast=now;
    if(!tipsPaused&&tipsVisible&&!document.hidden&&!tipCard.matches(':hover')&&!tipCard.contains(document.activeElement))tipElapsed+=elapsed;
    if(tipElapsed>=8500){tipIndex=(tipIndex+1)%tips.length;showTip();}requestAnimationFrame(tickTips);
  }
  syncTips();requestAnimationFrame(tickTips);
  byId('question-fields').innerHTML = questions.map((q,i)=>`<fieldset data-question="${i}" ${i?'hidden':''}><legend tabindex="-1">${q.title}</legend><p class="choice-hint">Choose one to move to the next question.</p><div class="planning-choices">${q.choices.map(([value,label])=>`<label><input type="radio" name="q${i}" value="${value}"><span>${label}</span></label>`).join('')}</div></fieldset>`).join('');
  function showQuestion(focus = true) {
    form.hidden=false; byId('planning-results').hidden=true;
    document.querySelectorAll('[data-question]').forEach((el,i)=>{el.hidden=i!==step;});
    byId('question-progress').textContent=`Question ${step+1} of 3`;
    document.querySelectorAll('.question-bars i').forEach((el,i)=>el.classList.toggle('complete',i<=step));
    byId('question-back').hidden=step===0;
    byId('question-error').textContent='';
    if(focus) {const title=document.querySelector(`[data-question="${step}"] legend`);title.focus({preventScroll:true});title.scrollIntoView({block:'nearest',behavior:'auto'});}
  }
  function updateSummary() {
    byId('trip-stage').textContent = answers[0] ? 'Your timing, based on your answer.' : 'A rough idea is enough. You can adjust it later.';
    byId('trip-focus').textContent = answers[1] ? `Your main focus: ${{budget:'managing costs',itinerary:'organising your trip',checklist:'packing with confidence'}[answers[1]]}.` : '';
  }
  function choose(event){
    const input=event.target;if(!input.matches('input[type="radio"]'))return;
    const index=Number(input.name.slice(1));if(index!==step)return;
    answers[index]=input.value;
    if(index===0){byId('trip-date').value='';updateCountdown();}
    updateSummary();clearTimeout(advanceTimer);
    advanceTimer=setTimeout(()=>{if(step<2){step++;showQuestion();}else showResults();},220);
  }
  form.addEventListener('click',choose);
  form.addEventListener('change',choose);
  form.addEventListener('submit',event=>event.preventDefault());
  function showResults(focus=true){
    const selection = recommend(answers);
    byId('recommendations').innerHTML=selection.map((key,i)=>{
      const p=products[key];
      const match = key===answers[1] ? 'For your main focus' : key==={details:'itinerary',reflection:'journal',prepared:'checklist'}[answers[2]] ? 'For what matters to you' : 'To help you prepare';
      return `<article class="planning-product"><img src="img/${p.image}" alt="${p.name}" width="160" height="120"><div><span class="match-label">${match}</span><h3>${p.name}</h3><p>${p.why}</p><a href="https://www.etsy.com/uk/listing/${p.url}" target="_blank" rel="noopener">View on Etsy ↗</a></div></article>`;
    }).join('');
    form.hidden=true;byId('planning-results').hidden=false;if(focus){byId('results-title').focus({preventScroll:true});byId('results-title').scrollIntoView({block:'start',behavior:'auto'});}
  }
  byId('question-back').addEventListener('click',()=>{clearTimeout(advanceTimer);step=Math.max(0,step-1);showQuestion();});
  const dateInput=byId('trip-date');
  const now=new Date();dateInput.min=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  function updateCountdown(){
    const days=daysUntil(dateInput.value),error=byId('date-error');
    error.textContent='';dateInput.removeAttribute('aria-invalid');
    if(days===null||days<0){
      byId('trip-days').textContent=({later:'30+',month:'15–30',soon:'0–14'}[answers[0]]||'Your timing');byId('trip-days-label').textContent=answers[0]?'days · your estimate':'Choose a rough time to get started.';
      if(dateInput.value||dateInput.validity.badInput){error.textContent='Choose today or a future departure date.';dateInput.setAttribute('aria-invalid','true');}
    }else{
      byId('trip-days').textContent=days===0?'Today':String(days);
      byId('trip-days-label').textContent=days===0?'Your journey starts today.':days===1?'day until you leave':'days until you leave';
    }
  }
  dateInput.addEventListener('input',()=>{updateCountdown();const days=daysUntil(dateInput.value);if(days!==null&&days>=0){answers[0]=days>30?'later':days>14?'month':'soon';const radio=document.querySelector(`[name="q0"][value="${answers[0]}"]`);if(radio)radio.checked=true;updateSummary();byId('trip-stage').textContent='Countdown to your chosen date.';if(!byId('planning-results').hidden)showResults(false);}});
  byId('start-again').addEventListener('click',()=>{clearTimeout(advanceTimer);answers=[null,null,null];step=0;form.reset();dateInput.value='';document.querySelector('.date-adjust').open=false;updateSummary();updateCountdown();showQuestion();});
  showTip();showQuestion(false);byId('planner').hidden=false;document.querySelector('.tip-controls').hidden=false;
})();
