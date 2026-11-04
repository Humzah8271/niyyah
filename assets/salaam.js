/* Salaam greeting: shows once each time someone arrives at the site from outside
   (a link, search result, bookmark or typed address), on whichever page they land on.
   Moving between pages, reloading or going back does not show it again.
   Nothing is stored on the visitor's device: it only checks where the visit came from. */
(function(){
  try{
    var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    var type = nav ? nav.type : (performance.navigation && performance.navigation.type === 1 ? 'reload' : performance.navigation && performance.navigation.type === 2 ? 'back_forward' : 'navigate');
    if (type === 'reload' || type === 'back_forward') return;
    if (document.referrer && new URL(document.referrer).origin === location.origin) return;
  }catch(e){ return; }
  function show(){
    var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    var el=document.createElement('div');
    el.className='salaam'; el.setAttribute('aria-hidden','true');
    el.innerHTML='<div class="salaam-card"><p class="ar-text" lang="ar" dir="rtl">السلام عليكم ورحمة الله وبركاته</p><p>Assalaamu alaykum wa rahmatullaahi wa barakaatuh</p><p class="salaam-en">Peace be upon you, and the mercy of Allah and His blessings.</p></div>';
    document.body.appendChild(el);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.classList.add('on'); }); });
    setTimeout(function(){
      el.classList.remove('on');
      setTimeout(function(){ el.remove(); }, reduce?0:700);
    }, 3000);
  }
  if(document.readyState==='complete') setTimeout(show,150);
  else window.addEventListener('load',function(){ setTimeout(show,150); });
})();
