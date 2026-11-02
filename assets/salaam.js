/* Salaam greeting: once per device, home page only, injected after load, fades on its own. */
(function(){
  var KEY='niyyah-salaam-seen';
  try{ if(localStorage.getItem(KEY)) return; }catch(e){ return; }
  function show(){
    var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    var el=document.createElement('div');
    el.className='salaam'; el.setAttribute('aria-hidden','true');
    el.innerHTML='<div class="salaam-card"><p class="ar-text" lang="ar" dir="rtl">السلام عليكم ورحمة الله وبركاته</p><p>Assalaamu alaykum wa rahmatullaahi wa barakaatuh</p><p class="salaam-en">Peace be upon you, and the mercy of Allah and His blessings.</p></div>';
    document.body.appendChild(el);
    try{ localStorage.setItem(KEY,'1'); }catch(e){}
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.classList.add('on'); }); });
    setTimeout(function(){
      el.classList.remove('on');
      setTimeout(function(){ el.remove(); }, reduce?0:700);
    }, 3000);
  }
  if(document.readyState==='complete') setTimeout(show,150);
  else window.addEventListener('load',function(){ setTimeout(show,150); });
})();
