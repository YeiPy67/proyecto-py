"use strict";
/* Proyecto Py — bienvenida tipo "primer encendido", niveles de usuario y lecciones estilo historias. */
const SYMBOLS=["∑","π","∞","√","∫","Δ","φ","λ","≈","±","∂","θ"];
const LEVELS=[["new","x","lvl.new","lvl.newSub"],["mid","x²","lvl.mid","lvl.midSub"],["pro","xⁿ","lvl.pro","lvl.proSub"]];
const level=()=>store.get("nivel","mid");
const L=(arr)=>arr[LCODES.indexOf(LANG)]||arr[1]||arr[0];
const lessonsDone=()=>store.get("lecciones",{});

/* ---------- Bienvenida ---------- */
function welcome(done,startAt=0){
  document.querySelector(".wel")?.remove();
  const w=el("div",{class:"wel",role:"dialog","aria-modal":"true"});w.append(el("div",{class:"aurora a1"}),el("div",{class:"aurora a2"}),el("div",{class:"aurora a3"}));
  const stage=el("div",{class:"wel-stage"}),foot=el("div",{class:"wel-foot"}),back=el("button",{class:"wel-back",type:"button","aria-label":t("onb.back")},"←");
  w.append(back,stage,foot);document.body.append(w);
  const prof=store.get("profile",{name:"",avatar:"∑"});if(!SYMBOLS.includes(prof.avatar))prof.avatar="∑";
  let lv=store.get("nivel",null),i=0;if(!store.get("cur"))CUR=guessCur();
  const steps=["hello","lang","name","level","cur","next","ready"];
  const dots=()=>{foot.innerHTML="";steps.slice(1,-1).forEach((_,k)=>foot.append(el("i",{class:k+1===i?"on":k+1<i?"past":""})))};
  function go(n){const old=stage.querySelector(".wel-step");if(old){old.classList.add(n>i?"out-l":"out-r");setTimeout(()=>old.remove(),420)}
    const dir=n>=i?"in-r":"in-l";i=n;const s=el("div",{class:"wel-step "+dir});build(steps[i],s);stage.append(s);requestAnimationFrame(()=>requestAnimationFrame(()=>s.classList.remove(dir)));
    back.hidden=i<=1||i===steps.length-1;foot.hidden=i===0||i===steps.length-1;dots();applyI18n()}
  const next=()=>go(i+1);back.onclick=()=>go(i-1);
  const btn=(txt,cls="wel-btn")=>{const b=el("button",{class:cls,type:"button"},txt);return b};
  function build(k,s){
    if(k==="hello"){const hi=el("h1",{class:"wel-hi"},t("wel.hello"));s.append(el("span",{class:"logo xl"},"Py"),hi,el("p",{class:"wel-tap"},t("wel.tap")));
      const words=TXT["wel.hello"];let j=0;const iv=setInterval(()=>{if(!s.isConnected)return clearInterval(iv);hi.classList.add("swap");setTimeout(()=>{j=(j+1)%words.length;hi.textContent=words[j];hi.classList.remove("swap")},380)},1900);
      s.onclick=()=>{clearInterval(iv);next()};s.classList.add("tappable")}
    if(k==="lang"){{const g=el("span",{class:"wel-glyph"});g.innerHTML='<svg viewBox="0 0 24 24" class="ico"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></svg>';s.append(g,el("p",{class:"wel-sub"},t("onb.lang")))}const box=el("div",{class:"wel-list"});
      LANGS.forEach(([c,n])=>{const b=btn(n,"wel-opt"+(c===LANG?" on":""));b.onclick=()=>{LANG=c;store.set("lang",c);applyI18n();next()};box.append(b)});s.append(box)}
    if(k==="name"){const inp=el("input",{type:"text",class:"wel-input",maxlength:"24",autocomplete:"given-name","aria-label":t("wel.name")});inp.value=prof.name||"";
      const grid=el("div",{class:"wel-syms"});SYMBOLS.forEach(sy=>{const b=btn(sy,"sym-tile"+(sy===prof.avatar?" on":""));b.onclick=()=>{prof.avatar=sy;grid.querySelectorAll(".sym-tile").forEach(x=>x.classList.toggle("on",x===b))};grid.append(b)});
      const ok=btn(t("onb.next"));ok.onclick=()=>{prof.name=inp.value.trim();store.set("profile",prof);next()};inp.onkeydown=e=>{if(e.key==="Enter")ok.click()};
      s.append(el("h2",{},t("wel.name")),el("p",{class:"wel-sub"},t("wel.nameSub")),inp,el("p",{class:"wel-sub sm"},t("wel.sym")),grid,ok);setTimeout(()=>inp.focus(),450)}
    if(k==="level"){s.append(el("h2",{},t("wel.level")),el("p",{class:"wel-sub"},t("wel.levelSub")));const box=el("div",{class:"wel-list"});
      LEVELS.forEach(([id,ic,a,b])=>{const c=el("button",{class:"wel-card"+(lv===id?" on":""),type:"button"});c.append(el("span",{class:"ic"},ic),el("b",{},t(a)),el("small",{},t(b)));c.onclick=()=>{lv=id;store.set("nivel",id);next()};box.append(c)});
      s.append(box,el("p",{class:"wel-legal"},t("onb.legal")))}
    if(k==="cur"){const sel=el("select",{class:"wel-select","aria-label":t("wel.cur")});CURS.forEach(([c,sy])=>sel.append(el("option",{value:c},`${c} · ${sy}`)));sel.value=CUR;
      const prev=el("div",{class:"wel-preview"}),upd=()=>{CUR=sel.value;prev.textContent=money(1000*fxNow())};sel.onchange=upd;upd();
      const ok=btn(t("onb.next"));ok.onclick=()=>{store.set("cur",CUR);next()};s.append(el("h2",{},t("wel.cur")),el("p",{class:"wel-sub"},t("wel.curSub")),sel,prev,ok)}
    if(k==="next"){if((lv||"mid")==="new"){s.append(el("span",{class:"logo xl sym"},"∞"),el("h2",{},t("wel.learn")),el("p",{class:"wel-sub"},t("wel.learnSub")));
        const a=btn(t("wel.startLearn")),b=btn(t("wel.later"),"wel-link");a.onclick=()=>{finish("learn")};b.onclick=next;s.append(a,b)}
      else{s.append(el("h2",{},t("onb.how")));const box=el("div",{class:"wel-grid"});
        [["photo","camera","imp.photo"],["voice","mic","imp.voice"],["text","keys","imp.text"]].forEach(([m,ic,l])=>{const c=el("button",{class:"wel-card sm",type:"button"});const ie=el("span",{class:"ic"});ie.innerHTML=ICON[ic];c.append(ie,el("b",{},t(l)));c.onclick=()=>finish("imp:"+m);box.append(c)});
        const sk=btn(t("imp.skip"),"wel-link");sk.onclick=next;s.append(box,sk)}}
    if(k==="ready"){const ck=sv("svg",{viewBox:"0 0 80 80",class:"wel-check"});ck.append(sv("circle",{cx:40,cy:40,r:36,fill:"none",stroke:"rgba(255,255,255,.25)","stroke-width":"4"}),sv("path",{d:"M24 41l11 11 22-24",fill:"none",stroke:"#fff","stroke-width":"6","stroke-linecap":"round","stroke-linejoin":"round",class:"ck"}));
      s.append(ck,el("h2",{class:"wel-dot"},prof.name?t("wel.readyName",{n:prof.name}):t("wel.ready")));const b=btn(t("wel.enter"));b.onclick=()=>finish("");s.append(b)}}
  function finish(action){store.set("onboarded",true);if(!store.get("nivel"))store.set("nivel","mid");w.classList.add("bye");setTimeout(()=>w.remove(),700);
    done(action)}
  go(startAt)}

/* ---------- Lecciones estilo historias ---------- */
function openLesson(id,k0=0){const les=LECCIONES.find(x=>x.id===id);if(!les)return;let k=Math.max(0,Math.min(+k0||0,les.slides.length-1));
  const o=el("div",{class:"story",role:"dialog","aria-modal":"true"}),bars=el("div",{class:"story-bars"}),x=el("button",{class:"story-x",type:"button","aria-label":t("les.close")},"✕"),body=el("div",{class:"story-body"}),nav=el("div",{class:"story-nav"});
  les.slides.forEach(()=>bars.append(el("i")));o.append(bars,x,body,nav);document.body.append(o);requestAnimationFrame(()=>o.classList.add("open"));
  const close=()=>{o.classList.remove("open");setTimeout(()=>o.remove(),400);removeEventListener("keydown",kb);if(VIEW==="learn"||VIEW==="home")render()};
  const kb=e=>{if(e.key==="Escape")close();if(e.key==="ArrowRight")step(1);if(e.key==="ArrowLeft")step(-1)};addEventListener("keydown",kb);x.onclick=close;
  let locked=false;
  function step(d){if(d>0&&locked)return;const n=k+d;if(n<0)return;if(n>=les.slides.length)return complete();k=n;draw()}
  function draw(){[...bars.children].forEach((b,j)=>b.className=j<k?"done":j===k?"now":"");const sl=les.slides[k];locked=sl.type==="quiz";
    const c=el("div",{class:"slide"});c.append(el("span",{class:"story-sym"},les.sym),el("span",{class:"story-t"},L(les.title)),el("h2",{},L(sl.h)));if(sl.p)c.append(el("p",{},L(sl.p)));
    if(sl.type==="compound")c.append(compound());if(sl.type==="compare")c.append(compare());if(sl.type==="quiz")c.append(quiz(sl));
    body.innerHTML="";body.append(c);nav.innerHTML="";const pv=el("button",{class:"story-btn ghost",type:"button","aria-label":"←"},"←"),nx=el("button",{class:"story-btn",type:"button"},k===les.slides.length-1?"✓":t("onb.next")+" →");
    pv.disabled=k===0;pv.onclick=()=>step(-1);nx.onclick=()=>step(1);nx.disabled=locked;nav.append(pv,nx);nav.dataset.next="1"}
  body.addEventListener("click",e=>{if(e.target.closest("button,input,label,select"))return;const r=body.getBoundingClientRect();step(e.clientX>r.left+r.width*.35?1:-1)});
  function compound(){const f=fxNow(),nice=v=>{const p=Math.pow(10,Math.max(0,Math.floor(Math.log10(v))-1));return Math.round(v/p)*p};
    const box=el("div",{class:"cmp-box"}),lab0=el("div",{class:"cmp-m"}),rng=el("input",{type:"range",min:"1",max:"10",step:"1",value:"2","aria-label":"monto"});
    const row=(lbl,cls)=>{const r=el("div",{class:"cmp-row"}),b=el("div",{class:"cmp-bar "+cls}),v=el("b",{class:"num"});r.append(el("span",{},lbl),el("div",{class:"cmp-track"},""),v);r.children[1].append(b);return{r,b,v}};
    const a=row(t("les.keep"),"keep"),i=row(t("les.invest"),"inv");box.append(lab0,rng,a.r,i.r);
    const upd=()=>{const m=nice(50*f*rng.value),keep=m*12*30;let v=0;const mr=Math.pow(1.07,1/12)-1;for(let q=0;q<360;q++)v=v*(1+mr)+m;
      lab0.textContent=t("les.perMonth",{x:money(m)})+" · "+t("u.y",{n:30});a.v.textContent=short(keep);i.v.textContent=short(v);a.b.style.width=(keep/v*100)+"%";i.b.style.width="100%"};
    rng.oninput=upd;upd();return box}
  function compare(){const box=el("div",{class:"cmp-box"}),pts=s=>{const sr=serie(s),cut=END-182*864e5,o=sr.filter(p=>T(p[0])>=cut);return(sr.at(-1)[1]-o[0][1])/o[0][1]*100};
    const items=[["NVDA",pts("NVDA")],["VOO",pts("VOO")]],mx=Math.max(...items.map(x=>Math.abs(x[1])))||1;
    items.forEach(([s,v])=>{const r=el("div",{class:"cmp-row"}),tr=el("div",{class:"cmp-track"}),b=el("div",{class:"cmp-bar "+(v>=0?"inv":"neg")});b.style.width=(Math.abs(v)/mx*100)+"%";tr.append(b);
      r.append(el("span",{},s==="NVDA"?"Nvidia (1)":"VOO (500)"),tr,el("b",{class:"num"},pctf(v)));box.append(r)});return box}
  function quiz(sl){const box=el("div",{class:"quiz"}),msg=el("p",{class:"quiz-msg"});
    sl.o.forEach((op,j)=>{const b=el("button",{class:"quiz-op",type:"button"},L(op));b.onclick=()=>{if(j===sl.c){b.classList.add("ok");box.querySelectorAll(".quiz-op").forEach(x=>x.disabled=true);msg.textContent=L(sl.x);msg.className="quiz-msg ok";locked=false;nav.querySelector(".story-btn:last-child").disabled=false}
      else{b.classList.add("bad");setTimeout(()=>b.classList.remove("bad"),500);msg.textContent=t("les.wrong");msg.className="quiz-msg"}};box.append(b)});
    box.append(msg);const q=el("p",{class:"quiz-q"},L(sl.q));const w=el("div");w.append(q,box);return w}
  function complete(){const d=lessonsDone();d[id]=true;store.set("lecciones",d);[...bars.children].forEach(b=>b.className="done");
    const nxt=LECCIONES.find(x=>!d[x.id]);const c=el("div",{class:"slide center"}),ck=sv("svg",{viewBox:"0 0 80 80",class:"wel-check"});
    ck.append(sv("circle",{cx:40,cy:40,r:36,fill:"none",stroke:"rgba(255,255,255,.25)","stroke-width":"4"}),sv("path",{d:"M24 41l11 11 22-24",fill:"none",stroke:"#fff","stroke-width":"6","stroke-linecap":"round","stroke-linejoin":"round",class:"ck"}));
    c.append(ck,el("h2",{},t("les.done")),el("p",{},L(les.title)));body.innerHTML="";body.append(c);nav.innerHTML="";
    const b1=el("button",{class:"story-btn ghost",type:"button"},t("les.close"));b1.onclick=close;nav.append(b1);
    if(nxt){const b2=el("button",{class:"story-btn",type:"button"},t("les.next")+" →");b2.onclick=()=>{o.remove();removeEventListener("keydown",kb);openLesson(nxt.id)};nav.append(b2)}}
  o.style.setProperty("--hue",(LECCIONES.indexOf(les)*47+250)%360);draw()}

/* ---------- Vista Aprende ---------- */
function rLearn(){const box=$("learnList");box.innerHTML="";const d=lessonsDone();
  const path=el("div",{class:"path"});path.append(el("h2",{},t("les.path")));const n=LECCIONES.filter(x=>d[x.id]).length;
  const pg=el("div",{class:"prog"}),bar=el("div",{class:"bar"}),fill=el("i");fill.style.width=(n/LECCIONES.length*100)+"%";bar.append(fill);pg.append(bar,el("span",{class:"num small muted"},t("home.pathDone",{a:n,b:LECCIONES.length})));path.append(pg);
  const grid=el("div",{class:"lessons"});LECCIONES.forEach((x,i)=>{const c=el("button",{class:"lesson card"+(d[x.id]?" done":""),type:"button"});c.style.setProperty("--hue",(i*47+250)%360);
    c.append(el("span",{class:"sym-tile big"},x.sym),el("b",{},L(x.title)),el("span",{class:"note"},d[x.id]?"✓ "+t("les.done"):t("les.min",{n:x.min})));c.onclick=()=>openLesson(x.id);grid.append(c)});
  path.append(grid);box.append(path);
  const g=el("div",{class:"stack"});g.append(el("h2",{},t("les.glossary")));const gl=el("div",{class:"learn"});
  LEARN.forEach(x=>{const dd=el("details",{class:"card learn-i"}),s=el("summary");s.append(el("b",{},L(x.t)));dd.append(s,el("p",{},L(x.d)));gl.append(dd)});g.append(gl);box.append(g)}

/* ---------- Inicio según el nivel ---------- */
function dayIdx(n){return Math.floor(Date.now()/864e5)%n}
function homeCard(cls,title,extra){const c=el("section",{class:"card hc "+(cls||"")});if(title){const h=el("div",{class:"sh"});h.append(el("h3",{},title));if(extra)h.append(extra);c.append(h)}return c}
function pathCard(compact){const d=lessonsDone(),n=LECCIONES.filter(x=>d[x.id]).length,nx=LECCIONES.find(x=>!d[x.id]);
  const c=homeCard("path-card",t("home.path"),el("span",{class:"num small muted"},t("home.pathDone",{a:n,b:LECCIONES.length})));
  const bar=el("div",{class:"bar"}),fill=el("i");fill.style.width=(n/LECCIONES.length*100)+"%";bar.append(fill);c.append(bar);
  if(nx){const r=el("button",{class:"next-les",type:"button"});const st=el("span",{class:"stack0"});st.append(el("b",{},L(nx.title)),el("span",{class:"note"},t("les.min",{n:nx.min})));r.append(el("span",{class:"sym-tile"},nx.sym),st,el("span",{class:"btn pri sm"},t(n?"home.continue":"wel.startLearn")));r.onclick=()=>openLesson(nx.id);c.append(r)}
  else c.append(el("p",{class:"small muted"},t("home.pathAll")));
  if(compact&&!nx)return null;return c}
function marketSentence(){const v=D.precios.VOO.cambio,x=fix(Math.abs(v),1)+" %";return t(v>1?"mk.up":v<-1?"mk.down":"mk.flat",{x})}
function tipCard(){const c=homeCard("tip-card");c.append(el("span",{class:"lbl"},t("home.tip")),el("p",{},L(TIPS[dayIdx(TIPS.length)])));return c}
function factCard(){const f=LEARN[dayIdx(LEARN.length)],c=homeCard("fact-card");c.append(el("span",{class:"lbl"},t("home.fact")),el("b",{},L(f.t)),el("p",{class:"small muted"},L(f.d)));return c}
