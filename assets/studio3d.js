/* ---------- personalisation studio: 3D mug and tote you can turn; they spring back to face you ---------- */
function niyyahStudio() {
  const host = document.getElementById('viewer');
  if (!host) return;
  const nameIn = document.getElementById('pName'), yearIn = document.getElementById('pYear');
  const bm = document.getElementById('pickMug'), bt = document.getElementById('pickTote'), buy = document.getElementById('studioBuy');
  const yearRow = document.getElementById('yearRow');
  const URLS = { mug: host.dataset.mug, tote: host.dataset.tote };
  let current = 'mug';

  function setPicked(which) {
    current = which;
    bm.setAttribute('aria-pressed', which === 'mug'); bt.setAttribute('aria-pressed', which === 'tote');
    buy.href = URLS[which]; buy.querySelector('span').textContent = which === 'mug' ? 'Order the mug on Etsy' : 'Order the tote on Etsy';
    yearRow.hidden = which === 'mug';
  }

  if (!window.THREE) { host.classList.add('no3d'); bm.onclick = () => setPicked('mug'); bt.onclick = () => setPicked('tote'); setPicked('mug'); return; }
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
  catch (e) { host.classList.add('no3d'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.25));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.physicallyCorrectLights = false;
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, .1, 100);
  camera.position.set(0, .55, 9.2); camera.lookAt(0, -.05, 0);
  scene.add(new THREE.HemisphereLight(0xfffaf0, 0x2a4a40, 1.15));
  const key = new THREE.DirectionalLight(0xfff1dc, 1.2); key.position.set(5, 6, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xcfe6da, .55); rim.position.set(-6, 2, -4); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, .25); fill.position.set(-3, -2, 5); scene.add(fill);

  // soft contact shadow
  const sh = document.createElement('canvas'); sh.width = sh.height = 256;
  const sg = sh.getContext('2d'); const grd = sg.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, 'rgba(0,0,0,.55)'); grd.addColorStop(1, 'rgba(0,0,0,0)'); sg.fillStyle = grd; sg.fillRect(0, 0, 256, 256);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sh), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.42; scene.add(shadow);

  const GREEN = '#1C4A3D', GOLD = '#C4A062';
  function star(g, cx, cy, r, lw) {
    g.strokeStyle = GOLD; g.lineWidth = lw;
    for (const a of [0, Math.PI / 4]) {
      g.beginPath();
      for (let k = 0; k < 4; k++) { const t = a + Math.PI / 4 + k * Math.PI / 2; const x = cx + r * Math.cos(t), y = cy + r * Math.sin(t); k ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.closePath(); g.stroke();
    }
  }
  function fitText(g, text, font, max, size) { let s = size; g.font = font.replace('{s}', s); while (g.measureText(text).width > max && s > 20) { s -= 4; g.font = font.replace('{s}', s); } }
  function goldFill(g, x0, x1) { const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, '#8E6C34'); gr.addColorStop(.5, '#C29A55'); gr.addColorStop(1, '#94723A'); return gr; }

  // ---------- mug ----------
  const mugCv = document.createElement('canvas'); mugCv.width = 2048; mugCv.height = 1024;
  const mugTex = new THREE.CanvasTexture(mugCv); mugTex.encoding = THREE.sRGBEncoding; mugTex.anisotropy = 4;
  function drawMug(name) {
    const g = mugCv.getContext('2d'), W = mugCv.width, H = mugCv.height;
    g.fillStyle = '#FBFBF8'; g.fillRect(0, 0, W, H);
    const design = cx => {
      g.save(); g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      star(g, cx, 300, 38, 4);
      g.fillStyle = GREEN; g.font = '500 70px Lora, Georgia, serif'; g.fillText('Umrah Mubarak', cx, 455);
      g.strokeStyle = GOLD; g.lineWidth = 3; g.beginPath(); g.moveTo(cx - 150, 490); g.lineTo(cx + 150, 490); g.stroke();
      fitText(g, name, 'italic 400 {s}px Lora, Georgia, serif', 330, 92); g.fillStyle = goldFill(g, cx - 170, cx + 170); g.fillText(name, cx, 598);
      g.fillStyle = GREEN; g.font = '500 23px Poppins, Manrope, sans-serif'; g.letterSpacing = '3px';
      g.fillText('MAY ALLAH ACCEPT IT FROM YOU', cx, 668); g.restore();
    };
    // the wrap's seam (u = 0) sits under the handle; front faces the viewer at u = 0.75, back at u = 0.25
    design(W * .75); design(W * .25);
    mugTex.needsUpdate = true;
  }
  const mug = new THREE.Group();
  const ceramic = new THREE.MeshPhysicalMaterial({ map: mugTex, roughness: .5, metalness: 0, clearcoat: .45, clearcoatRoughness: .4 });
  const white = new THREE.MeshPhysicalMaterial({ color: 0xf7f6f1, roughness: .3, clearcoat: 1, clearcoatRoughness: .15 });
  const inCv = document.createElement('canvas'); inCv.width = 4; inCv.height = 256;
  { const g = inCv.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#f1efe9'); gr.addColorStop(.35, '#cfccc3'); gr.addColorStop(1, '#8f8c84'); g.fillStyle = gr; g.fillRect(0, 0, 4, 256); }
  const inTex = new THREE.CanvasTexture(inCv); inTex.encoding = THREE.sRGBEncoding;
  const inside = new THREE.MeshStandardMaterial({ map: inTex, roughness: .55, side: THREE.BackSide });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 2.3, 128, 1, true, Math.PI / 2, Math.PI * 2), ceramic); mug.add(body);
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(.93, .93, 2.26, 96, 1, true), inside); mug.add(inner);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(.965, .036, 16, 128), white); lip.rotation.x = Math.PI / 2; lip.position.y = 1.15; mug.add(lip);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(.93, 64), new THREE.MeshStandardMaterial({ color: 0x8a877f, roughness: .6 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -1.1; mug.add(floor);
  const base = new THREE.Mesh(new THREE.CircleGeometry(1, 64), white); base.rotation.x = Math.PI / 2; base.position.y = -1.15; mug.add(base);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(.5, .12, 24, 64, Math.PI * 1.1), white);
  handle.rotation.z = -Math.PI / 2 - Math.PI * .05; handle.position.set(1.0, .02, 0); handle.scale.set(1, 1.15, 1); mug.add(handle);
  mug.position.y = -.2; scene.add(mug);

  // ---------- tote (simpler) ----------
  const toteCv = document.createElement('canvas'); toteCv.width = 1024; toteCv.height = 1176;
  const toteTex = new THREE.CanvasTexture(toteCv); toteTex.encoding = THREE.sRGBEncoding; toteTex.anisotropy = 4;
  const weave = document.createElement('canvas'); weave.width = weave.height = 64;
  { const g = weave.getContext('2d'); const d = g.createImageData(64, 64); for (let i = 0; i < d.data.length; i += 4) { const v = 244 + Math.random() * 10 - ((i / 4) % 2 ? 3 : 0); d.data[i] = v; d.data[i + 1] = v - 1; d.data[i + 2] = v - 6; d.data[i + 3] = 255; } g.putImageData(d, 0, 0); }
  function drawTote(name, year) {
    const g = toteCv.getContext('2d'), W = toteCv.width, H = toteCv.height;
    g.fillStyle = g.createPattern(weave, 'repeat'); g.fillRect(0, 0, W, H);
    g.textAlign = 'center'; const cx = W / 2;
    star(g, cx, 300, 92, 7);
    fitText(g, name + "'s", 'italic 400 {s}px Lora, Georgia, serif', 760, 104); g.fillStyle = goldFill(g, cx - 300, cx + 300); g.fillText(name + "'s", cx, 520);
    g.fillStyle = GREEN; g.font = '500 190px Lora, Georgia, serif'; g.fillText('Umrah', cx, 700);
    g.strokeStyle = GOLD; g.lineWidth = 6; g.beginPath(); g.moveTo(cx - 300, 760); g.lineTo(cx + 300, 760); g.stroke();
    g.fillStyle = GREEN; g.font = '500 40px Poppins, Manrope, sans-serif'; g.letterSpacing = '4px'; g.fillText('LABBAYK ALLAHUMMA LABBAYK', cx, 840);
    g.fillStyle = GOLD; g.font = '300 46px Poppins, Manrope, sans-serif'; g.fillText(year, cx, 920);
    toteTex.needsUpdate = true;
  }
  const tote = new THREE.Group();
  const fabric = new THREE.MeshStandardMaterial({ color: 0xf2efe7, roughness: 1 });
  const printed = new THREE.MeshStandardMaterial({ map: toteTex, roughness: 1 });
  const bag = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.64, .07), [fabric, fabric, fabric, fabric, printed, printed]); tote.add(bag);
  for (const z of [.05, -.05]) { // one handle on each face
    const strap = new THREE.Mesh(new THREE.TorusGeometry(.42, .045, 10, 40, Math.PI), fabric);
    strap.position.set(0, 1.32, z); strap.scale.set(1, 1.35, 1); tote.add(strap);
  }
  tote.position.y = -.35; tote.visible = false; scene.add(tote);

  // ---------- interaction: drag to look, spring back on release ----------
  const REST = { mug: { yaw: -.2, pitch: .14 }, tote: { yaw: -.22, pitch: .06 } };
  let yaw = REST.mug.yaw, pitch = REST.mug.pitch, vy = 0, vp = 0, drag = false, lx = 0, ly = 0, t = 0, last = performance.now(), visible = true, raf = 0, settled = 0;
  const K = 46, DAMP = 7.2; // stiffness and damping, slightly under-damped for a small overshoot
  function size() { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  let lastDraw = 0;
  function frame(now) {
    raf = 0; if (window.NIYYAH_LEAVING) return;
    if (now - lastDraw < 32 && !drag) { if (visible && !document.hidden) raf = requestAnimationFrame(frame); return; }
    lastDraw = now; const dt = Math.min(.033, (now - last) / 1000); last = now; t += dt;
    const rest = REST[current], obj = current === 'mug' ? mug : tote;
    if (!drag) {
      const ty = rest.yaw + (reduce ? 0 : Math.sin(t * .6) * .05), tp = rest.pitch;
      vy += (K * (ty - yaw) - DAMP * vy) * dt; vp += (K * (tp - pitch) - DAMP * vp) * dt;
      yaw += vy * dt; pitch += vp * dt;
    }
    obj.rotation.set(pitch, yaw, 0, 'XYZ');
    obj.position.y = (current === 'mug' ? -.2 : -.35) + (reduce ? 0 : Math.sin(t * 1.4) * .035);
    shadow.scale.x = current === 'mug' ? .8 : 1; shadow.position.y = current === 'mug' ? -1.42 : -1.8;
    renderer.render(scene, camera);
    const moving = drag || Math.abs(vy) + Math.abs(vp) > .002 || !reduce;
    if (visible && !document.hidden && moving) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  host.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; ly = e.clientY; host.setPointerCapture(e.pointerId); host.classList.add('grabbing'); kick(); });
  host.addEventListener('pointermove', e => {
    if (!drag) return; const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
    yaw += dx * .012; pitch = Math.max(-.35, Math.min(.5, pitch + dy * .006)); vy = dx * .6; vp = dy * .5; kick();
  });
  const end = () => { drag = false; host.classList.remove('grabbing'); kick(); };
  host.addEventListener('pointerup', end); host.addEventListener('pointercancel', end);
  host.addEventListener('keydown', e => { const k = { ArrowLeft: [-.5, 0], ArrowRight: [.5, 0], ArrowUp: [0, -.2], ArrowDown: [0, .2] }[e.key]; if (k) { yaw += k[0]; pitch = Math.max(-.35, Math.min(.5, pitch + k[1])); e.preventDefault(); kick(); } });
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }).observe(host);
  document.addEventListener('visibilitychange', kick);
  addEventListener('resize', () => { size(); kick(); });

  function redraw() {
    const name = (nameIn.value.trim() || 'Raheema').slice(0, 12);
    const year = (yearIn.value.replace(/\D/g, '').slice(0, 4) || '2026');
    drawMug(name); drawTote(name, year); kick();
  }
  function pick(which) {
    setPicked(which); mug.visible = which === 'mug'; tote.visible = which === 'tote';
    yaw = REST[which].yaw + (which === 'mug' ? 1.4 : -1.2); vy = 0; vp = 0; kick(); // swings in and settles
  }
  nameIn.addEventListener('input', redraw); yearIn.addEventListener('input', redraw);
  bm.addEventListener('click', () => pick('mug')); bt.addEventListener('click', () => pick('tote'));
  size(); setPicked('mug'); redraw();
  (document.fonts && document.fonts.load ? Promise.all(['500 70px Lora', 'italic 92px Lora', '500 23px Poppins', '300 46px Poppins'].map(f => document.fonts.load(f))) : Promise.resolve()).then(redraw, redraw);
  host.dataset.ready = '1';
}
/* three.js (about 600 KB) only loads when the studio is about to come into view, so the shop opens quickly */
(() => {
  const host = document.getElementById('viewer'); if (!host) return;
  let started = false;
  const go = () => {
    if (started) return; started = true;
    if (window.THREE) return niyyahStudio();
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    s.onload = s.onerror = niyyahStudio; document.head.appendChild(s);
  };
  if (!('IntersectionObserver' in window)) return go();
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); go(); } }, { rootMargin: '700px 0px' });
  io.observe(host);
})();
