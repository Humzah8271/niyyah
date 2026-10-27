/* ---------- 3D gold emblem: crescent & star → Niyyah star → rosette → tawaf ring, morphing on its own ---------- */
(() => {
  const stage = document.getElementById('stage'), cv = document.getElementById('gem');
  if (!stage || !cv) return;
  const caption = document.getElementById('shapeName');
  const NAMES = ['Crescent and star', 'Niyyah star', 'Rosette', 'Seven circuits'];
  let gl; try { gl = cv.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' }); } catch (e) {}
  const fail = () => { cv.hidden = true; stage.querySelector('.fallback').hidden = false; };
  if (!gl) return fail();
  const vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const fs = `precision highp float;
uniform vec2 res;uniform mat3 rot;uniform float morph;uniform float time;uniform float energy;
float box(vec2 p,float b){vec2 d=abs(p)-vec2(b);return length(max(d,0.))+min(max(d.x,d.y),0.);}
mat2 r2(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float star8(vec2 p){return min(box(p,.74),box(r2(.7853982)*p,.74));}
float star5(vec2 p,float r,float rf){const vec2 k1=vec2(.809016994,-.587785252);const vec2 k2=vec2(-k1.x,k1.y);
  p.x=abs(p.x);p-=2.*max(dot(k1,p),0.)*k1;p-=2.*max(dot(k2,p),0.)*k2;p.x=abs(p.x);p.y-=r;
  vec2 ba=rf*vec2(-k1.y,k1.x)-vec2(0,1);float h=clamp(dot(p,ba)/dot(ba,ba),0.,r);return length(p-ba*h)*sign(p.y*ba.x-p.x*ba.y);}
float ext(vec3 p,float d2,float h){vec2 w=vec2(d2,abs(p.z)-h);return min(max(w.x,w.y),0.)+length(max(w,0.));}
float fCrescent(vec3 p){vec2 q=p.xy+vec2(.12,0.);
  float c=max(length(q)-.82,-(length(q-vec2(.30,.06))-.70));
  float s=star5(r2(-.25)*(q-vec2(.50,.04)),.30,.42);
  return ext(p,min(c,s),.11)-.035;}
float seg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}
float fStar(vec3 p){vec2 q=p.xy;float sq=min(abs(box(q,.70))-.055,abs(box(r2(.7853982)*q,.70))-.055);
  float n=min(min(seg(q,vec2(-.17,-.24),vec2(-.17,.24)),seg(q,vec2(-.17,.24),vec2(.17,-.24))),seg(q,vec2(.17,-.24),vec2(.17,.24)))-.05;
  return min(ext(p,sq,.09)-.03,ext(p,n,.11)-.025);}
float fRosette(vec3 p){float s=star8(p.xy);float d=ext(p,abs(s+.12)-.075,.10)-.03;
  float s2=star8(r2(.3926991)*p.xy*2.2)/2.2;return min(d,ext(p,s2,.17)-.025);}
float fRing(vec3 p){float d=length(vec2(length(p.xy)-.86,p.z))-.07;
  for(int i=0;i<7;i++){float a=6.2831853*float(i)/7.;vec2 c=.86*vec2(cos(a),sin(a));d=min(d,length(vec3(p.xy-c,p.z))-.11);}return d;}
float form(vec3 p,float k){if(k<.5)return fCrescent(p);if(k<1.5)return fStar(p);if(k<2.5)return fRosette(p);return fRing(p);}
float scene(vec3 p){float k=floor(morph);float t=fract(morph);t=t*t*(3.-2.*t);return mix(form(p,mod(k,4.)),form(p,mod(k+1.,4.)),t);}
void main(){vec2 uv=(gl_FragCoord.xy-.5*res)/res.y;vec3 ro=rot*vec3(0.,0.,4.4);vec3 rd=rot*normalize(vec3(uv*2.7,-4.4));
float bb=dot(ro,rd);float cc=dot(ro,ro)-1.44;float hh=bb*bb-cc;if(hh<0.){gl_FragColor=vec4(0.);return;}
float t=max(0.,-bb-sqrt(hh));float tEnd=-bb+sqrt(hh);bool hit=false;float d;for(int i=0;i<56;i++){vec3 p=ro+rd*t;d=scene(p);if(d<.002){hit=true;break;}t+=d*.9;if(t>tEnd)break;}
if(!hit){gl_FragColor=vec4(0.);return;}
vec3 p=ro+rd*t;vec2 e=vec2(.002,0.);vec3 n=normalize(vec3(scene(p+e.xyy)-scene(p-e.xyy),scene(p+e.yxy)-scene(p-e.yxy),scene(p+e.yyx)-scene(p-e.yyx)));
vec3 v=-rd;vec3 l1=rot*normalize(vec3(-2.,3.,4.));vec3 l2=rot*normalize(vec3(3.,-1.,2.));
float dif=max(dot(n,l1),0.);float spec=pow(max(dot(n,normalize(l1+v)),0.),80.);float spec2=pow(max(dot(n,normalize(l2+v)),0.),30.);
float fres=pow(1.-max(dot(n,v),0.),4.);vec3 r=reflect(-v,n);float env=.5+.5*r.y;
vec3 base=mix(vec3(.55,.39,.16),vec3(1.,.86,.55),env*.9);
vec3 col=base*(.35+.75*dif)+vec3(1.,.95,.82)*spec*1.4+vec3(.95,.8,.5)*spec2*.35+vec3(.25,.55,.45)*fres*.55;
col+=smoothstep(0.,.02,sin(r.y*14.+time*.6))*.06*vec3(1.,.86,.55)+energy*vec3(.12,.09,.04);
gl_FragColor=vec4(pow(col,vec3(.92)),1.);}`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  let prog;
  try { prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw 0; }
  catch (e) { console.warn(e); return fail(); }
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(prog, n);
  const uRes = U('res'), uRot = U('rot'), uMorph = U('morph'), uTime = U('time'), uEnergy = U('energy');

  const HOLD = 6500, MORPH = 2600; // ms on each shape, ms per morph
  let yaw = 0, pitch = -.25, vy = reduce ? 0 : .005, vp = 0, drag = false, lx = 0, ly = 0, energy = 0;
  let shape = 0, morph = 0, morphFrom = 0, morphStart = -1, nextAt = performance.now() + HOLD, t0 = performance.now(), visible = true, raf = 0;
  let scale = .85, lastDraw = 0;
  function size() { const d = Math.min(1.25, devicePixelRatio || 1) * scale; cv.width = Math.round(cv.clientWidth * d); cv.height = Math.round(cv.clientHeight * d); gl.viewport(0, 0, cv.width, cv.height); }
  function mat(y, x) { const cy = Math.cos(y), sy = Math.sin(y), cx = Math.cos(x), sx = Math.sin(x);
    return new Float32Array([cy, 0, -sy, sy * sx, cx, cy * sx, sy * cx, -sx, cy * cx]); }
  function setCaption() { if (caption) { caption.style.opacity = 0; setTimeout(() => { caption.textContent = NAMES[shape % 4]; caption.style.opacity = 1; }, 300); } }
  function frame(now) {
    raf = 0;
    if (window.NIYYAH_LEAVING) return;
    // draw at most ~30 times a second so the page stays responsive on laptop graphics chips
    if (now - lastDraw < 32 && !drag) { if (visible && !document.hidden) raf = requestAnimationFrame(frame); return; }
    lastDraw = now;
    if (!reduce && now >= nextAt && morphStart < 0) { morphFrom = morph; morphStart = now; shape += 1; setCaption(); }
    if (morphStart >= 0) { const k = Math.min(1, (now - morphStart) / MORPH); morph = morphFrom + k; if (k >= 1) { morph = shape; morphStart = -1; nextAt = now + HOLD; } }
    if (!drag) { yaw += vy; pitch += vp; vy += ((reduce ? 0 : .004) - vy) * .02; vp *= .94; pitch += (-.25 - pitch) * .01; }
    energy *= .94;
    gl.uniform2f(uRes, cv.width, cv.height); gl.uniformMatrix3fv(uRot, false, mat(yaw, pitch));
    gl.uniform1f(uMorph, morph); gl.uniform1f(uTime, (now - t0) / 1000); gl.uniform1f(uEnergy, energy);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (visible && !document.hidden && (!reduce || drag)) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  size(); addEventListener('resize', () => { size(); kick(); });
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }).observe(stage);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { nextAt = performance.now() + HOLD; kick(); } });
  stage.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; ly = e.clientY; stage.setPointerCapture(e.pointerId); kick(); });
  stage.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
    vy = dx * .006; vp = dy * .006; yaw += vy; pitch = Math.max(-1.3, Math.min(1.3, pitch + vp)); energy = Math.min(1, energy + Math.hypot(dx, dy) * .01); kick(); });
  const end = () => { drag = false; kick(); };
  stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
  if (caption) caption.textContent = NAMES[0];
  kick();
})();
