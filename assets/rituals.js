/* Practice animations with a gentle completion pause after all seven rounds/laps. */
(() => {
  const get=id=>document.getElementById(id);
  if(!get('tawafTicks'))return;
  const NS='http://www.w3.org/2000/svg';
  function dots(id,count,coords){const host=get(id);for(let i=0;i<count;i++){const dot=document.createElementNS(NS,'circle');const [x,y,r]=coords(i);dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.setAttribute('r',r);host.appendChild(dot);}return [...host.children];}
  const tawafDots=dots('tawafTicks',7,i=>{const a=-Math.PI/2-i*2*Math.PI/7;return [150+132*Math.cos(a),150+132*Math.sin(a),3];});
  const saiDots=dots('saiDots',7,i=>[110+i*20,40,4]);
  let tp=0,lap=0,wx=40,tDone=false,sDone=false,tWait=0,sWait=0,tPlay=!reduce,sPlay=!reduce,last=performance.now(),visible=true;
  const HOLD=8,TAWAF=5.5;
  const tOverlay=get('tawafSvg-complete'),sOverlay=get('saiSvg-complete');
  function completion(overlay,done){overlay.classList.toggle('is-visible',done);overlay.setAttribute('aria-hidden',String(!done));overlay.inert=!done;overlay.parentElement.classList.toggle('completed',done);}
  function render(){
    const completeRounds=tDone?7:Math.floor(tp),frac=tDone?0:tp-Math.floor(tp),a=-Math.PI/2-frac*2*Math.PI;
    const x=150+118*Math.cos(a),y=150+118*Math.sin(a);
    for(const id of ['pilgrim','pilgrimGlow']){get(id).setAttribute('cx',x);get(id).setAttribute('cy',y);}
    get('tawafArc').setAttribute('d',frac<.002?'':`M150 32 A118 118 0 ${frac>.5?1:0} 0 ${x.toFixed(2)} ${y.toFixed(2)}`);
    get('tawafN').textContent=tDone?7:Math.floor(tp)+1;
    tawafDots.forEach((d,i)=>d.setAttribute('fill',i<completeRounds?'#D6B472':'rgba(214,186,128,.25)'));
    get('walker').setAttribute('cx',wx);get('walkerGlow').setAttribute('cx',wx);
    get('saiN').textContent=sDone?7:lap+1;
    get('saiDir').textContent=sDone?'Complete':lap%2===0?'Safa → Marwah':'Marwah → Safa';
    const fast=wx>128&&wx<212;
    get('saiPace').textContent=sDone?'':fast?'moving faster':'walking';
    get('walkerGlow').setAttribute('fill',fast?'rgba(140,220,180,.25)':'rgba(243,223,176,.18)');
    saiDots.forEach((d,i)=>d.setAttribute('fill',i<(sDone?7:lap)?'#D6B472':'rgba(214,186,128,.2)'));
    completion(tOverlay,tDone);completion(sOverlay,sDone);
    get('tawafStep').textContent=tDone?'Replay':'Next round';get('saiStep').textContent=sDone?'Replay':'Next lap';
    for(const [id,playing] of [['tawafPlay',tPlay],['saiPlay',sPlay]]){get(id).textContent=playing?'Pause':'Play';get(id).setAttribute('aria-pressed',String(playing));}
  }
  function resetT(){tp=0;tDone=false;tWait=0;}
  function resetS(){lap=0;wx=40;sDone=false;sWait=0;}
  function finishT(){tp=7;tDone=true;tWait=0;}
  function finishS(){lap=7;wx=300;sDone=true;sWait=0;}
  function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;
    if(visible&&!document.hidden){
      if(tPlay){if(tDone){tWait+=dt;if(tWait>=HOLD)resetT();}else{tp+=dt/TAWAF;if(tp>=7)finishT();}}
      if(sPlay){if(sDone){sWait+=dt;if(sWait>=HOLD)resetS();}else{
        const forward=lap%2===0,fast=wx>128&&wx<212;
        wx+=(forward?1:-1)*(fast?95:34)*dt;
        if((forward&&wx>=300)||(!forward&&wx<=40)){wx=forward?300:40;lap++;if(lap>=7)finishS();}
      }}
      render();
    }requestAnimationFrame(loop);
  }
  get('tawafPlay').addEventListener('click',()=>{tPlay=!tPlay;render();});
  get('saiPlay').addEventListener('click',()=>{sPlay=!sPlay;render();});
  get('tawafStep').addEventListener('click',()=>{if(tDone)resetT();else if(Math.floor(tp)>=6)finishT();else tp=Math.floor(tp)+1;render();});
  get('saiStep').addEventListener('click',()=>{if(sDone)resetS();else if(lap>=6)finishS();else{lap++;wx=lap%2===0?40:300;}render();});
  if('IntersectionObserver' in window)new IntersectionObserver(es=>{visible=es[0].isIntersecting;}).observe(get('journey'));
  render();requestAnimationFrame(loop);
})();
