"use strict";
if(/[?&]shot=/.test(location.search)){addEventListener("error",e=>{const d=document.createElement("pre");d.style.cssText="position:fixed;bottom:0;left:0;right:0;z-index:99;background:#b00;color:#fff;font:12px monospace;padding:8px;white-space:pre-wrap";d.textContent="ERROR: "+e.message+" @"+e.lineno+":"+e.colno;document.body.append(d)});addEventListener("unhandledrejection",e=>{const d=document.createElement("pre");d.style.cssText="position:fixed;bottom:0;left:0;right:0;z-index:99;background:#b00;color:#fff;font:12px monospace;padding:8px;white-space:pre-wrap";d.textContent="ERROR: "+(e.reason&&e.reason.stack||e.reason);document.body.append(d)})}
/* Proyecto Py — app web instalable. Todo lo del usuario se guarda en este aparato (localStorage). */
const $=id=>document.getElementById(id);
const el=(t,a={},txt)=>{const e=document.createElement(t);for(const k in a)e.setAttribute(k,a[k]);if(txt!=null)e.textContent=txt;return e};
const NS="http://www.w3.org/2000/svg";
const sv=(t,a={})=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e};
const svt=(a,txt)=>{const e=sv("text",a);e.textContent=txt;return e};
const store={get(k,d=null){try{const v=localStorage.getItem("py."+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem("py."+k,JSON.stringify(v));if(k!=="lastSync")window.PyCuenta?.changed()}catch(e){}},del(k){try{localStorage.removeItem("py."+k)}catch(e){}}};

/* ---------- Idioma ---------- */
const LCODES=LANGS.map(l=>l[0]);
const LOCALE={es:"es",en:"en",pt:"pt-BR",fr:"fr",de:"de"};
const GDELT_LANG={es:"Spanish",en:"English",pt:"Portuguese",fr:"French",de:"German"};
let LANG=store.get("lang")||(LCODES.includes(navigator.language.slice(0,2))?navigator.language.slice(0,2):"en");
const t=(k,v={})=>{const row=TXT[k];let s=row?row[LCODES.indexOf(LANG)]||row[1]:k;for(const x in v)s=s.replace("{"+x+"}",v[x]);return s};
function applyI18n(){document.documentElement.lang=LANG;
  document.querySelectorAll("[data-t]").forEach(e=>e.textContent=t(e.dataset.t));
  document.querySelectorAll("[data-tp]").forEach(e=>e.placeholder=t(e.dataset.tp))}

/* ---------- Formatos ---------- */
const loc=()=>LOCALE[LANG];
const fix=(v,d=2)=>v.toLocaleString(loc(),{minimumFractionDigits:d,maximumFractionDigits:d});
const pctf=v=>(v>0?"+":v<0?"−":"")+Math.abs(v).toLocaleString(loc(),{minimumFractionDigits:1,maximumFractionDigits:1})+" %";
const T=d=>Date.parse(d+"T00:00:00Z");
const fT=(ms,o)=>new Date(ms).toLocaleDateString(loc(),Object.assign({timeZone:"UTC"},o));
const fD=(s,o={day:"numeric",month:"short"})=>fT(T(s),o);
const NODEC=["COP","CLP","JPY","ARS"];
let CUR=store.get("cur")||"USD";
const money=(v,c=CUR)=>new Intl.NumberFormat(loc(),{style:"currency",currency:c,maximumFractionDigits:NODEC.includes(c)?0:2,minimumFractionDigits:NODEC.includes(c)?0:2}).format(v);
const usd=v=>money(v,"USD");
const short=v=>{const a=Math.abs(v);return a>=1e9?fix(v/1e9,1)+" B":a>=1e6?fix(v/1e6,1)+" M":a>=1e3?fix(v/1e3,a>=1e4?0:1)+" k":fix(v,0)};
const chg=v=>el("span",{class:"chg "+(v>=0?"up":"dn")},pctf(v));
const toast=m=>{const e=$("toast");e.textContent=m;e.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>e.hidden=true,2400)};
const confirmBtn=(b,fn)=>{if(b.dataset.sure!=="1"){b.dataset.sure="1";const old=b.textContent;b.textContent=t("mkt.sure");setTimeout(()=>{b.dataset.sure="";b.textContent=old},3000);return}b.dataset.sure="";applyI18n();fn()};
const PAL=["--p0","--p1","--p2","--p3","--p4","--p5","--p6","--p7"];

/* ---------- Activos ---------- */
const INFO={VOO:["Vanguard S&P 500","funds"],QQQ:["Invesco QQQ (Nasdaq 100)","funds"],VT:["Vanguard Total World","funds"],SCHD:["Schwab US Dividend","funds"],GLD:["SPDR Gold","funds"],"^VIX":["VIX","funds"],"BZ=F":["Brent","funds"],
  ANT:["Anthropic","ai"],NVDA:["Nvidia","ai"],AMD:["AMD","ai"],AVGO:["Broadcom","ai"],TSM:["TSMC","ai"],ASML:["ASML","ai"],PLTR:["Palantir","ai"],
  GOOGL:["Alphabet","tech"],META:["Meta Platforms","tech"],AAPL:["Apple","tech"],MSFT:["Microsoft","tech"],AMZN:["Amazon","tech"],TSLA:["Tesla","tech"],NFLX:["Netflix","tech"],
  JPM:["JPMorgan","fin"],V:["Visa","fin"],KO:["Coca-Cola","fin"],MELI:["MercadoLibre","latam"],NU:["Nu Holdings","latam"],EC:["Ecopetrol","latam"],CIB:["Bancolombia","latam"],
  "BTC-USD":["Bitcoin","crypto"],"ETH-USD":["Ethereum","crypto"],"SOL-USD":["Solana","crypto"]};
const LAB={"^VIX":"VIX","BZ=F":"Brent","BTC-USD":"BTC","ETH-USD":"ETH","SOL-USD":"SOL"};
let D,NEWS,AN,BR,EV,ALL=[],END=0;
const lab=s=>LAB[s]||s;
const nm=s=>(INFO[s]||[D?.precios[s]?.nombre||s])[0];
const unitOf=s=>s==="^VIX"?"pts":"USD";
const fmtPx=(s,v)=>v>=10000?Math.round(v).toLocaleString(loc()):fix(v,v<1?4:2);
const serie=s=>D.precios[s].serie;
const fxNow=()=>CUR==="USD"?1:(D.fx[CUR]?.precio||1);
function valAt(sr,date){const tt=typeof date==="number"?date:T(date);if(tt<=T(sr[0][0]))return sr[0][1];let lo=0,hi=sr.length-1;
  while(lo<hi){const m=(lo+hi+1)>>1;if(T(sr[m][0])<=tt)lo=m;else hi=m-1}return sr[lo][1]}
const fxAt=d=>CUR==="USD"||!D.fx[CUR]?1:valAt(D.fx[CUR].serie,d);

/* ---------- Estado del usuario ---------- */
let premium=store.get("premium",false);
let targets=store.get("targets",{}),alerts=store.get("alerts",{});
/* Lo que tienes: {id, s, q (unidades), px (precio promedio USD o null), d, acct, fx}. Ahorro: {id, name, amt, cur, rate, acct} */
let holdings=store.get("holdings");
if(!holdings){holdings=(store.get("buys",[])||[]).map(b=>({id:Math.random().toString(36).slice(2,9),s:b.s,q:b.u/b.px,px:b.px,d:b.d,acct:"",fx:b.fx||1}));store.set("holdings",holdings)}
let cash=store.get("cash",[]);
const saveHoldings=()=>{store.set("holdings",holdings);store.set("cash",cash)};
const hasAny=()=>holdings.length||cash.length;
let custom=store.get("profiles",[]),follows=store.get("follows",["mine","thermo"]);
const PRESETS=[
  {id:"mine",k:"pf.mine",syms:()=>{const s=[...new Set(holdings.map(b=>b.s))];return s.length?s:["VOO","NVDA","GOOGL","ANT"]}},
  {id:"thermo",k:"pf.thermo",syms:()=>["VOO","QQQ","^VIX","GLD","BZ=F","BTC-USD"]},
  {id:"bigtech",k:"pf.bigtech",syms:()=>["AAPL","MSFT","GOOGL","AMZN","META","NVDA","TSLA","NFLX"]},
  {id:"ai",k:"pf.ai",syms:()=>["NVDA","AMD","AVGO","TSM","ASML","ANT","PLTR"]},
  {id:"funds",k:"pf.funds",syms:()=>["VOO","QQQ","VT","SCHD","GLD"]},
  {id:"latam",k:"pf.latam",syms:()=>["MELI","NU","EC","CIB"]},
  {id:"crypto",k:"pf.crypto",syms:()=>["BTC-USD","ETH-USD","SOL-USD"]}
];
let profId=store.get("prof","mine");
const profiles=()=>[...PRESETS.map(p=>({id:p.id,name:t(p.k),syms:p.syms()})),...custom.map(c=>({id:c.id,name:c.name,syms:c.syms,mine:true}))];
const prof=()=>profiles().find(p=>p.id===profId)||profiles()[0];
const psyms=()=>prof().syms.filter(s=>D.precios[s]);
const colorOf=s=>`var(${PAL[Math.max(0,psyms().indexOf(s))%PAL.length]})`;
const mySyms=()=>{const set=new Set(holdings.map(b=>b.s));follows.forEach(id=>{const p=profiles().find(x=>x.id===id);if(p)p.syms.forEach(s=>set.add(s))});return[...set].filter(s=>D.precios[s])};

/* ---------- Tema ---------- */
function applyTheme(){const th=store.get("theme","system");if(th==="system")document.documentElement.removeAttribute("data-theme");else document.documentElement.setAttribute("data-theme",th)}
applyTheme();
$("themeBtn").addEventListener("click",()=>{const cur=document.documentElement.getAttribute("data-theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");store.set("theme",cur==="dark"?"light":"dark");applyTheme();render()});

/* ---------- Gráfico genérico ---------- */
function chart(svgId,boxId,tipId,cfg){
  const svg=$(svgId),box=$(boxId),tip=$(tipId);const W=Math.max(280,box.clientWidth),H=cfg.h||(W<520?220:290),m={l:8,r:72,t:14,b:26};
  svg.setAttribute("viewBox",`0 0 ${W} ${H}`);svg.innerHTML="";tip.hidden=true;
  const lines=cfg.lines.filter(l=>l.pts.length);
  if(!lines.length){svg.append(svt({x:W/2,y:H/2,"text-anchor":"middle",fill:"var(--muted)","font-size":"13"},t("mkt.nodata")));svg.onpointermove=null;return}
  const xs=lines.flatMap(l=>[l.pts[0][0],l.pts.at(-1)[0]]),x0=Math.min(...xs),x1=Math.max(...xs);
  const ys=lines.flatMap(l=>l.pts.map(p=>p[1]));(cfg.refs||[]).forEach(r=>ys.push(r.v));if(cfg.zero)ys.push(0);
  let y0=Math.min(...ys),y1=Math.max(...ys);const pd=(y1-y0||Math.abs(y1)*.05||1)*.08;y0-=pd;y1+=pd;if(cfg.floor0&&y0<0)y0=0;
  const X=v=>m.l+(W-m.l-m.r)*(x1===x0?.5:(v-x0)/(x1-x0)),Y=v=>m.t+(H-m.t-m.b)*(1-(v-y0)/(y1-y0));
  for(let k=0;k<=4;k++){const v=y0+(y1-y0)*k/4,y=Y(v);svg.append(sv("line",{x1:m.l,x2:W-m.r,y1:y,y2:y,stroke:"var(--line)","stroke-dasharray":k?"2 4":"none"}));
    svg.append(svt({x:W-m.r+6,y:y+4,"font-size":"11",fill:"var(--faint)","font-family":"IBM Plex Mono, monospace"},cfg.yfmt(v)))}
  const nt=W<520?3:5,seen=new Set();
  for(let k=0;k<nt;k++){const v=x1===x0?x0:x0+(x1-x0)*k/(nt-1),s=cfg.xfmt(v,x1-x0);if(seen.has(s))continue;seen.add(s);
    svg.append(svt({x:X(v),y:H-6,"text-anchor":k===0?"start":k===nt-1?"end":"middle","font-size":"11",fill:"var(--faint)"},s))}
  if(cfg.zero)svg.append(sv("line",{x1:m.l,x2:W-m.r,y1:Y(0),y2:Y(0),stroke:"var(--muted)"}));
  (cfg.refs||[]).forEach(r=>{const y=Y(r.v);svg.append(sv("line",{x1:m.l,x2:W-m.r,y1:y,y2:y,stroke:r.c,"stroke-dasharray":"5 4","stroke-width":"1.2"}),svt({x:m.l+4,y:y-5,"font-size":"11","font-weight":"600",fill:r.c},r.label))});
  const defs=sv("defs");svg.append(defs);
  lines.forEach((l,li)=>{const P=l.pts.map(p=>[X(p[0]),Y(p[1])]),d="M"+P.map(p=>p[0].toFixed(1)+","+p[1].toFixed(1)).join("L");
    if(l.area){const id="g"+svgId+li,g=sv("linearGradient",{id,x1:"0",x2:"0",y1:"0",y2:"1"});g.append(sv("stop",{offset:"0","stop-color":l.c,"stop-opacity":".22"}),sv("stop",{offset:"1","stop-color":l.c,"stop-opacity":"0"}));defs.append(g);
      svg.append(sv("path",{d:d+`L${P.at(-1)[0]},${H-m.b}L${P[0][0]},${H-m.b}Z`,fill:`url(#${id})`,class:cfg.anim?"area-in":""}))}
    const ln=sv("path",{d,fill:"none",stroke:l.c,"stroke-width":l.w||2,"stroke-dasharray":l.dash||"none","stroke-linejoin":"round"});svg.append(ln);if(cfg.anim&&!l.dash&&!RM.matches){try{ln.style.setProperty("--len",ln.getTotalLength());ln.classList.add("draw")}catch(e){}}
    if(l.end){const e=P.at(-1);if(l.end==="pill"){svg.append(sv("circle",{cx:e[0],cy:e[1],r:4,fill:l.c}),sv("rect",{x:W-m.r+2,y:e[1]-9,width:m.r-4,height:18,rx:4,fill:l.c}),svt({x:W-m.r+6,y:e[1]+4,"font-size":"11","font-weight":"600",fill:"#fff","font-family":"IBM Plex Mono, monospace"},cfg.yfmt(l.pts.at(-1)[1])))}
      else svg.append(svt({x:W-m.r+6,y:e[1]+4,"font-size":"11","font-weight":"700",fill:l.c,"font-family":"IBM Plex Mono, monospace"},l.end))}});
  const g=sv("g",{opacity:"0"}),vl=sv("line",{y1:m.t,y2:H-m.b,stroke:"var(--faint)","stroke-dasharray":"3 3"});g.append(vl);svg.append(g);
  const near=(pts,x)=>{let lo=0,hi=pts.length-1;while(hi-lo>1){const md=(lo+hi)>>1;if(pts[md][0]<x)lo=md;else hi=md}return Math.abs(pts[lo][0]-x)<=Math.abs(pts[hi][0]-x)?pts[lo]:pts[hi]};
  const move=e=>{const r=svg.getBoundingClientRect(),px=(e.clientX-r.left)*W/r.width,xv=x0+(px-m.l)/(W-m.l-m.r)*(x1-x0),main=near(lines[0].pts,xv),xx=X(main[0]);
    g.setAttribute("opacity","1");vl.setAttribute("x1",xx);vl.setAttribute("x2",xx);g.querySelectorAll("circle").forEach(c=>c.remove());tip.hidden=false;tip.innerHTML="";
    const hd=el("div",{class:"r"});hd.append(el("span",{style:"opacity:.7"},cfg.tipx(main[0])));tip.append(hd);
    lines.map(l=>{const p=near(l.pts,main[0]);return cfg.strict&&Math.abs(p[0]-main[0])>8*864e5?null:{l,p}}).filter(Boolean).sort((a,b)=>b.p[1]-a.p[1]).forEach(({l,p})=>{
      g.append(sv("circle",{cx:X(p[0]),cy:Y(p[1]),r:4,fill:l.c,stroke:"var(--surface)","stroke-width":"2"}));
      const d=el("div",{class:"r"}),a=el("span");if(lines.length>1)a.append(el("i",{style:`background:${l.c}`}));a.append(document.createTextNode(l.name||""));d.append(a,el("span",{},cfg.tipy(l,p)));tip.append(d)});
    const sx=xx*r.width/W,tw=tip.offsetWidth;tip.style.left=Math.min(r.width-tw-4,Math.max(4,sx-tw/2))+"px"};
  svg.onpointermove=move;svg.onpointerdown=move;svg.onpointerleave=()=>{g.setAttribute("opacity","0");tip.hidden=true};
}
const timeFmt=(v,span)=>fT(v,span>400*864e5?{month:"short",year:"2-digit"}:{day:"numeric",month:"short"});
const timeTip=v=>fT(v,{day:"numeric",month:"short",year:"numeric"});

/* ---------- Ventana emergente (hoja) y animaciones ---------- */
const RM=matchMedia("(prefers-reduced-motion: reduce)");
function sheet(build){const w=el("div",{class:"sheet-wrap"}),s=el("div",{class:"sheet",role:"dialog","aria-modal":"true"});
  const x=el("button",{class:"ob x",type:"button","aria-label":t("ad.close")},"✕");s.append(el("div",{class:"grab"}),x);
  let closed=false;const close=()=>{if(closed)return;closed=true;w.classList.remove("open");removeEventListener("keydown",esc);setTimeout(()=>w.remove(),RM.matches?0:480)};
  const esc=e=>{if(e.key==="Escape")close()};addEventListener("keydown",esc);w.onclick=e=>{if(e.target===w)close()};x.onclick=close;
  build(s,close);w.append(s);document.body.append(w);requestAnimationFrame(()=>requestAnimationFrame(()=>w.classList.add("open")));
  let y0=null;s.addEventListener("touchstart",e=>{y0=s.scrollTop<=0?e.touches[0].clientY:null},{passive:true});
  s.addEventListener("touchmove",e=>{if(y0==null)return;const dy=e.touches[0].clientY-y0;if(dy>0){s.style.transition="none";s.style.transform=`translateY(${dy}px)`}},{passive:true});
  s.addEventListener("touchend",e=>{if(y0==null)return;const dy=e.changedTouches[0].clientY-y0;s.style.transition="";s.style.transform="";y0=null;if(dy>110)close()});
  setTimeout(()=>x.focus(),60);return close}
function countUp(node,to,fmt,key){countUp.p=countUp.p||{};if(RM.matches||document.documentElement.classList.contains("noanim")){node.textContent=fmt(to);countUp.p[key]=to;return}const from=key&&countUp.p[key]!=null?countUp.p[key]:0;countUp.p[key]=to;const t0=performance.now(),d=750;node.dataset.v=to;
  const step=now=>{const k=Math.min(1,(now-t0)/d),e=1-Math.pow(1-k,3);node.textContent=fmt(from+(to-from)*e);if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)}
const miniSpark=(s,w=300,h=70)=>{const sr=serie(s).slice(-66),ys=sr.map(q=>q[1]),mn=Math.min(...ys),mx=Math.max(...ys),r=mx-mn||1,up=sr.at(-1)[1]>=sr[0][1];
  const pts=sr.map((q,i)=>[4+(w-8)*i/(sr.length-1),4+(h-8)*(1-(q[1]-mn)/r)]),g=sv("svg",{viewBox:`0 0 ${w} ${h}`,style:"width:100%;height:auto"});
  const c=up?"var(--up)":"var(--down)",d="M"+pts.map(p=>p.map(v=>v.toFixed(1)).join(",")).join("L");
  g.append(sv("path",{d:d+`L${w-4},${h}L4,${h}Z`,fill:c,opacity:".12",class:"area-in"}));const ln=sv("path",{d,fill:"none",stroke:c,"stroke-width":"2.2","stroke-linejoin":"round"});g.append(ln);
  requestAnimationFrame(()=>{try{ln.style.setProperty("--len",ln.getTotalLength());ln.classList.add("draw")}catch(e){}});return g};
function newsSheet(n){sheet((s,close)=>{const k=n.k==="MERCADO"?"VOO":n.k;
  const tag=el("span",{class:"tags"});tag.append(el("span",{class:"tag"},n.k==="MERCADO"?"WALL ST":n.k==="MUNDO"?"ECON":lab(n.k)),el("span",{class:"tag"},n.l||""));
  const ds=n.d?`${n.d.slice(0,4)}-${n.d.slice(4,6)}-${n.d.slice(6,8)}`:"";
  s.append(tag,el("h2",{},n.t),el("div",{class:"meta"},`${n.f} · ${ds?fD(ds,{day:"numeric",month:"long"}):""} ${n.d?n.d.slice(9,11)+":"+n.d.slice(11,13):""}`));
  const br=BR.activos[k]?.[LANG];if(br){const b=el("div",{class:"card ai-brief"});b.append(el("span",{class:"lbl"},"✦ "+t("news.ai")),el("p",{class:"small"},br));s.append(b)}
  if(/^https?:\/\//.test(n.u))s.append(el("a",{class:"btn pri big-btn",href:n.u,target:"_blank",rel:"noopener"},t("news.read",{f:n.f})+" ↗"));
  const rel=(NEWS.temas[n.k]||[]).filter(o=>o.u!==n.u).slice(0,4);if(rel.length){const r=el("div",{class:"related"});r.append(el("span",{class:"lbl"},t("news.related")));
    rel.forEach(o=>{const b=el("button",{type:"button"},o.t);b.onclick=()=>{close();setTimeout(()=>newsSheet({...o,k:n.k}),200)};r.append(b)});s.append(r)}})}
function assetSheet(sym){sheet((s,close)=>{const p=D.precios[sym];const hd=el("div",{class:"stack0"});
  const pr=el("div",{class:"pxrow"});pr.append(el("span",{class:"px"},fmtPx(sym,p.precio)+" "+unitOf(sym)),chg(p.cambio));
  hd.append(el("span",{class:"lbl"},nm(sym)),el("h2",{},lab(sym)),pr);s.append(hd,miniSpark(sym));
  const br=BR.activos[sym]?.[LANG];if(br){const b=el("div",{class:"card ai-brief"});b.append(el("span",{class:"lbl"},"✦ "+t("news.ai")),el("p",{class:"small"},br));s.append(b)}
  const hs=(NEWS.temas[sym]||[]).slice(0,4);if(hs.length){const r=el("div",{class:"related"});r.append(el("span",{class:"lbl"},t("home.headlines")));
    hs.forEach(o=>{const b=el("button",{type:"button"},o.t);b.onclick=()=>{close();setTimeout(()=>newsSheet({...o,k:sym}),200)};r.append(b)});s.append(r)}
  const go=el("button",{class:"btn pri big-btn",type:"button"},t("home.seeExplore"));go.onclick=()=>{close();sel=sym;store.set("sel",sym);if(!psyms().includes(sym)){profId=PRESETS.find(x=>x.syms().includes(sym))?.id||"mine";store.set("prof",profId)}location.hash="#market"};s.append(go)})}

/* ---------- Navegación ---------- */
const NAV=[["home","⌂","nav.home"],["portfolio","◔","nav.portfolio"],["market","✧","nav.market"],["news","☰","nav.news"],["more","⋯","nav.more"]];
const SIDE_EXTRA=[["sim","∿","nav.sim"],["analysis","✦","nav.analysis"],["learn","❖","nav.learn"],["dates","▦","nav.dates"],["steps","✓","nav.steps"],["premium","★","nav.premium"],["settings","⚙","nav.settings"]];
const MORE_OF=new Set(["sim","analysis","learn","dates","steps","premium","settings","more"]);
function buildNav(){
  const side=$("sidenav");side.innerHTML="";
  const add=(box,[id,ic,k])=>{const a=el("a",{href:"#"+id,"data-v":id});a.append(el("span",{class:"ic","aria-hidden":"true"},ic),el("span",{},t(k)));box.append(a)};
  NAV.filter(n=>n[0]!=="more").forEach(n=>add(side,n));side.append(el("hr"));SIDE_EXTRA.forEach(n=>add(side,n));
  const tabs=$("tabs");tabs.innerHTML="";tabs.append(el("span",{class:"ind","aria-hidden":"true"}));NAV.forEach(n=>add(tabs,n));
  const mg=$("moreGrid");mg.innerHTML="";SIDE_EXTRA.forEach(([id,ic,k])=>{const a=el("a",{class:"card mg",href:"#"+id});a.append(el("span",{class:"ic"},ic),el("b",{},t(k)));mg.append(a)});
}
let VIEW="home";
function route(){VIEW=(location.hash||"#home").slice(1).split("?")[0];if(!$("v-"+VIEW))VIEW="home";
  document.querySelectorAll(".view").forEach(v=>v.hidden=v.id!=="v-"+VIEW);
  document.querySelectorAll("#sidenav a").forEach(a=>a.classList.toggle("on",a.dataset.v===VIEW));
  document.querySelectorAll("#tabs a").forEach(a=>a.classList.toggle("on",a.dataset.v===VIEW||(a.dataset.v==="more"&&MORE_OF.has(VIEW))));
  render();window.scrollTo(0,0);
  const v=$("v-"+VIEW);[...v.children].forEach((c,i)=>c.style.setProperty("--i",Math.min(i,8)));v.classList.remove("enter");void v.offsetWidth;v.classList.add("enter");moveInd()}
function moveInd(){const tb=$("tabs"),a=tb.querySelector("a.on"),ind=tb.querySelector(".ind");if(!a||!ind)return;ind.style.width=(a.offsetWidth-12)+"px";ind.style.transform=`translateX(${a.offsetLeft+6}px)`}
addEventListener("resize",()=>moveInd());
addEventListener("hashchange",route);
function render(){({home:rHome,market:rMarket,portfolio:rPortfolio,news:rNews,sim:rSim,analysis:rAnalysis,learn:rLearn,dates:rDates,steps:rSteps,premium:rPremium,settings:rSettings,more:()=>{}})[VIEW]?.();fillAds()}
function rLearn(){const box=$("learnList");box.innerHTML="";const i=LCODES.indexOf(LANG);
  LEARN.forEach(x=>{const d=el("details",{class:"card learn-i"}),s=el("summary");s.append(el("b",{},x.t[i]));d.append(s,el("p",{},x.d[i]));box.append(d)})}

/* ---------- Encabezado ---------- */
function header(){
  $("upd").textContent=t("upd",{t:new Date(D.generado).toLocaleString(loc(),{day:"numeric",month:"short",hour:"numeric",minute:"2-digit"})});
  const ny=new Date(new Date().toLocaleString("en-US",{timeZone:"America/New_York"})),day=ny.getDay(),mins=ny.getHours()*60+ny.getMinutes(),open=day>=1&&day<=5&&mins>=570&&mins<960;
  const hh=m=>`${Math.floor(m/60)} h ${m%60} min`;$("mk").classList.toggle("open",open);
  if(open)$("mkTxt").textContent=t("mk.open",{t:hh(960-mins)});
  else{let add,d=day;if(d>=1&&d<=5&&mins<570)add=570-mins;else{add=1440-mins+570;d=(d+1)%7;while(d===0||d===6){add+=1440;d=(d+1)%7}}
    $("mkTxt").textContent=t("mk.closed",{t:add>=1440?Math.floor(add/1440)+" d "+hh(add%1440):hh(add)})}
  $("topPremium").style.opacity=premium?"1":".75";
}
setInterval(()=>D&&header(),60000);

/* ---------- Anuncios y marcadores 67 ---------- */
const ph67=msg=>{const d=el("div",{class:"ph67"});d.append(el("b",{},"67"),el("span",{},"tung tung tung sahur"),el("small",{},msg));return d};
function fillAds(){document.querySelectorAll("[data-ad]").forEach(s=>{s.innerHTML="";s.hidden=premium;if(!premium)s.append(ph67(t("ad.label")+" · "+t("ph.ad")))});
  const sa=$("sideAd");sa.innerHTML="";if(!premium)sa.append(ph67(t("ph.ad")))}
document.addEventListener("click",e=>{const b=e.target.closest("[data-ph]");if(!b)return;$("phMsg").textContent=t(b.dataset.ph==="pay"?"ph.pay":"ph.aff");$("phModal").hidden=false});
$("phClose").addEventListener("click",()=>$("phModal").hidden=true);
function interstitial(){if(premium)return;const o=$("inter"),b=$("interClose");o.hidden=false;let n=3;b.disabled=true;b.textContent=t("ad.closeIn",{n});
  const iv=setInterval(()=>{n--;if(n>0)b.textContent=t("ad.closeIn",{n});else{clearInterval(iv);b.disabled=false;b.textContent=t("ad.close")}},1000)}
$("interClose").addEventListener("click",()=>$("inter").hidden=true);

/* ---------- Inicio ---------- */
function rHome(){
  const h=new Date().getHours(),pf=store.get("profile",{});$("hello").textContent=t(h<12?"home.morning":h<19?"home.afternoon":"home.evening")+(pf.name?", "+pf.name:"")+(pf.avatar&&pf.name?" "+pf.avatar:"");
  $("helloDate").textContent=new Date().toLocaleDateString(loc(),{weekday:"long",day:"numeric",month:"long"});
  // Tu dinero hoy
  const mc=$("moneyCard");mc.innerHTML="";const tt=totals();
  if(!hasAny()){mc.append(el("span",{class:"lbl"},t("home.money")),el("p",{class:"muted"},t("home.moneyEmpty")));const r=el("div",{class:"row"});
    [["photo","📸","imp.photo"],["voice","🎙️","imp.voice"],["text","⌨️","imp.text"]].forEach(([k,ic,l],i)=>{const b=el("button",{class:"btn"+(i?"":" pri"),type:"button"},ic+" "+t(l));b.onclick=()=>PyImport.open(k);r.append(b)});mc.append(r)}
  else{const left=el("div",{class:"stack0"});const bn=el("div",{class:"big-n"});left.append(el("span",{class:"lbl"},t("home.money")),bn);countUp(bn,tt.totalUSD*fxNow(),v=>money(v),"home");
    const sub=el("div",{class:"small"});const dc=tt.dayUSD;sub.append(el("span",{class:dc>=0?"up":"dn"},t("home.todayMove",{x:(dc>=0?"+":"−")+money(Math.abs(dc)*fxNow())+" ("+pctf(tt.investUSD?dc/(tt.investUSD-dc)*100:0)+")"})),document.createTextNode(" · "+t("home.in",{n:tt.places})));left.append(sub);
    const chips=el("div",{class:"acct-chips"});Object.entries(tt.byAcct).sort((a,b)=>b[1]-a[1]).forEach(([a,v])=>{const c=el("span",{class:"acct"});c.append(el("b",{},a),document.createTextNode(" "+money(v*fxNow())));chips.append(c)});
    const add=el("button",{class:"btn sm",type:"button"},"＋ "+t("port.addBtn"));add.onclick=()=>PyImport.open("menu");
    mc.append(left,chips,add)}
  const k=$("kpis");k.innerHTML="";const P=D.precios;
  const card=(l,v,s,cls)=>{const c=el("div",{class:"card kpi"});c.append(el("span",{class:"lbl"},l),el("span",{class:"v"+(cls?" "+cls:"")},v),el("span",{class:"s"},s));k.append(c)};
  card(t("home.market"),pctf(P.VOO.cambio),"VOO · "+usd(P.VOO.precio),P.VOO.cambio>=0?"up":"dn");
  if(P["^VIX"]){const v=P["^VIX"].precio;card(t("home.fear"),fix(v,1),t(v>=30?"home.panic":v>=20?"home.nerves":"home.calm"),v>=30?"dn":v>=20?"":"up")}
  const mine=mySyms().filter(s=>s!=="^VIX").map(s=>[s,P[s].cambio]);
  if(mine.length){const best=mine.reduce((a,b)=>b[1]>a[1]?b:a),worst=mine.reduce((a,b)=>b[1]<a[1]?b:a);
    card(t("home.best"),lab(best[0])+" "+pctf(best[1]),nm(best[0]),best[1]>=0?"up":"dn");card(t("home.worst"),lab(worst[0])+" "+pctf(worst[1]),nm(worst[0]),worst[1]>=0?"up":"dn")}
  if(CUR!=="USD"&&D.fx[CUR])card(t("home.fx",{c:CUR}),money(D.fx[CUR].precio),pctf(D.fx[CUR].cambio));
  else card("Bitcoin",usd(P["BTC-USD"].precio),pctf(P["BTC-USD"].cambio),P["BTC-USD"].cambio>=0?"up":"dn");
  // Para ti
  const fy=$("forYou");fy.innerHTML="";const syms=mySyms().filter(s=>BR.activos[s]||NEWS.temas[s]?.length);
  syms.sort((a,b)=>(!!BR.activos[b])-(!!BR.activos[a])||Math.abs(P[b].cambio)-Math.abs(P[a].cambio));
  if(!syms.length)fy.append(el("p",{class:"muted small"},t("home.empty")));
  syms.slice(0,6).forEach(s=>{const a=el("button",{class:"fy",type:"button"});a.onclick=()=>assetSheet(s);
    const sb=el("div",{class:"sym"});sb.append(el("b",{},lab(s)),chg(P[s].cambio));const tx=el("div");
    const br=BR.activos[s]?.[LANG];if(br){tx.append(el("p",{},br),el("div",{class:"meta"},"✦ "+t("news.ai")))}
    else{const n=NEWS.temas[s].find(x=>x.l===GDELT_LANG[LANG]||x.l==="English")||NEWS.temas[s][0];tx.append(el("p",{},n.t),el("div",{class:"meta"},n.f))}
    a.append(sb,tx,el("span",{class:"chev muted"},"›"));fy.append(a)});
  // Análisis
  $("tzDate").textContent=fD(AN.fecha_iso,{day:"numeric",month:"long"});$("tzTit").textContent=AN.titular[LANG];$("tzSub").textContent=AN.bajada[LANG];
  // Para tu cartera (Premium)
  const pb=$("personalBody");pb.innerHTML="";
  if(premium){pb.append(el("p",{class:"small"},personalText()))}
  else{const lk=el("div",{class:"locked"});lk.append(el("div",{class:"blur"},AN.secciones.at(-1).puntos[LANG].join(" ")));const ov=el("div",{class:"over"});const b=el("a",{class:"btn pri sm",href:"#premium"},"★ "+t("pr.see"));ov.append(b);lk.append(ov);pb.append(lk)}
  // Próximas fechas
  const he=$("homeEvents");he.innerHTML="";const today=new Date(new Date().toDateString());
  EV.filter(e=>new Date(e.f+"T12:00")>=today).slice(0,3).forEach(e=>{const r=el("div",{class:"me"}),n=Math.floor((new Date(e.f+"T12:00")-today)/864e5);
    r.append(el("span",{class:"d"},fD(e.f)),el("span",{},e.t[LANG]),el("span",{class:"cd"},t("dt.d",{n})));he.append(r)});
}
/* Totales en USD: inversiones, movimiento del día, ahorro y por dónde lo tienes */
const fxOf=c=>c==="USD"?1:(D.fx[c]?.precio||1);
const cashUSD=c=>c.amt/fxOf(c.cur||CUR);
function totals(){const P=D.precios;let investUSD=0,dayUSD=0,cUSD=0;const byAcct={},other=t("port.where")+"?";
  holdings.forEach(h=>{const p=P[h.s];if(!p)return;const v=h.q*p.precio;investUSD+=v;dayUSD+=v*p.cambio/(100+p.cambio);const a=h.acct||other;byAcct[a]=(byAcct[a]||0)+v});
  cash.forEach(c=>{const v=cashUSD(c);cUSD+=v;const a=c.acct||c.name;byAcct[a]=(byAcct[a]||0)+v});
  return{investUSD,dayUSD,cashUSD:cUSD,totalUSD:investUSD+cUSD,byAcct,places:Object.keys(byAcct).length}}
function personalText(){
  const P=D.precios;if(!holdings.length)return t("home.empty");
  let now=0,day=0;const by={};holdings.forEach(b=>{if(!P[b.s])return;const v=b.q*P[b.s].precio;now+=v;by[b.s]=(by[b.s]||0)+v});
  Object.entries(by).forEach(([s,v])=>day+=v*P[s].cambio/100);
  const top=Object.entries(by).sort((a,b)=>b[1]-a[1])[0];const sh=top[1]/now*100;
  const L={es:`Hoy tu cartera se movió ${pctf(day/now*100)} (${usd(day)}). ${lab(top[0])} es ${fix(sh,0)} % de todo lo que tienes, así que lo que le pase pesa mucho. En la versión final esto lo escribe la IA cada mañana con las noticias de tus activos.`,
    en:`Your portfolio moved ${pctf(day/now*100)} today (${usd(day)}). ${lab(top[0])} is ${fix(sh,0)}% of everything you own, so what happens to it matters a lot. In the final version, AI writes this every morning from your assets’ news.`,
    pt:`Hoje sua carteira variou ${pctf(day/now*100)} (${usd(day)}). ${lab(top[0])} é ${fix(sh,0)}% de tudo o que você tem, então o que acontecer com ele pesa muito. Na versão final a IA escreve isto toda manhã com as notícias dos seus ativos.`,
    fr:`Votre portefeuille a varié de ${pctf(day/now*100)} aujourd’hui (${usd(day)}). ${lab(top[0])} représente ${fix(sh,0)} % de vos avoirs : ce qui lui arrive pèse lourd. Dans la version finale, l’IA rédige ceci chaque matin à partir des actualités de vos actifs.`,
    de:`Ihr Portfolio bewegte sich heute um ${pctf(day/now*100)} (${usd(day)}). ${lab(top[0])} macht ${fix(sh,0)} % Ihres Vermögens aus, daher zählt jede Bewegung. In der finalen Version schreibt die KI dies jeden Morgen aus den News Ihrer Werte.`};
  return L[LANG];
}

/* ---------- Mercado ---------- */
const DMAX=1826,DMIN=7,lnR=Math.log(DMAX/DMIN),v2d=v=>Math.round(DMIN*Math.exp(lnR*v/1000)),d2v=d=>Math.round(1000*Math.log(d/DMIN)/lnR);
const RANGES=[["1S","1W","1S","1S","1W"],["1M"],["3M"],["6M"],["1A","1Y","1A","1A","1J"],["2A","2Y","2A","2A","2J"],["5A","5Y","5A","5A","5J"]];
const RDAYS=[7,30,91,182,365,730,1826];
let ANIM=true,days=store.get("days",182),mode=store.get("mode","one"),sel=store.get("sel","NVDA"),cmpOff=store.get("cmpOff",{}),editing=null;
const dLabel=d=>d<14?t("u.d",{n:d}):d<60?t("u.w",{n:Math.round(d/7)}):d<700?t("u.m",{n:Math.round(d/30.4)}):t("u.y",{n:(d/365).toLocaleString(loc(),{maximumFractionDigits:1})});
const sliceD=s=>{const cut=END-days*864e5,sr=serie(s),o=sr.filter(p=>T(p[0])>=cut);return o.length>=2?o:sr.slice(-2)};
function rMarket(){if(!psyms().includes(sel))sel=psyms()[0];buildProfiles();buildSeg();drawMarket()}
function buildProfiles(){const c=$("profChips");c.innerHTML="";
  profiles().forEach(p=>{const b=el("button",{class:"chip"+(p.mine?" mine":""),type:"button","aria-pressed":String(p.id===prof().id)},p.name);
    b.addEventListener("click",()=>{profId=p.id;store.set("prof",p.id);closeEditor();if(!psyms().includes(sel))sel=psyms()[0];buildProfiles();drawMarket();header()});c.append(b)});
  const mine=!!prof().mine;$("profEdit").hidden=!mine;$("profDel").hidden=!mine;$("watchTitle").textContent=prof().name}
function openEditor(p){if(!premium&&custom.length>=2&&!p){location.hash="#premium";toast(t("pr.locked"));return}
  editing=p?p.id:"new";$("editor").hidden=false;$("profName").value=p?p.name:"";$("profMsg").textContent="";
  const chosen=new Set(p?p.syms:[]),cats={};ALL.forEach(s=>(cats[INFO[s]?.[1]||"funds"]=cats[INFO[s]?.[1]||"funds"]||[]).push(s));
  const box=$("profCats");box.innerHTML="";
  ["funds","tech","ai","fin","latam","crypto"].filter(c=>cats[c]).forEach(c=>{const d=el("div",{class:"cat"});d.append(el("span",{class:"lbl"},t("cat."+c)));
    cats[c].forEach(s=>{const l=el("label"),cb=el("input",{type:"checkbox",value:s});cb.checked=chosen.has(s);l.append(cb,el("b",{},lab(s)),el("span",{},nm(s)));d.append(l)});box.append(d)});$("profName").focus()}
function closeEditor(){editing=null;$("editor").hidden=true}
$("profNew").addEventListener("click",()=>openEditor(null));
$("profEdit").addEventListener("click",()=>openEditor(custom.find(c=>c.id===profId)&&prof()));
$("profCancel").addEventListener("click",closeEditor);
$("profDel").addEventListener("click",e=>confirmBtn(e.currentTarget,()=>{custom=custom.filter(c=>c.id!==profId);store.set("profiles",custom);profId="mine";store.set("prof",profId);rMarket();toast(t("t.deleted"))}));
$("profSave").addEventListener("click",()=>{const name=$("profName").value.trim(),syms=[...$("profCats").querySelectorAll("input:checked")].map(i=>i.value);
  if(!name)return $("profMsg").textContent=t("mkt.needName");if(!syms.length)return $("profMsg").textContent=t("mkt.needOne");
  let id=editing;if(editing==="new"){id="u"+Date.now().toString(36);custom.push({id,name,syms})}else{const c=custom.find(c=>c.id===editing);if(c){c.name=name;c.syms=syms}}
  store.set("profiles",custom);profId=id;store.set("prof",id);closeEditor();sel=syms[0];rMarket();header();toast(t("t.saved"))});
function markRanges(){[...$("rangeSeg").children].forEach((b,i)=>b.setAttribute("aria-pressed",String(Math.abs(RDAYS[i]-days)<=RDAYS[i]*.04)));$("periodLbl").textContent=dLabel(days)}
function buildSeg(){const rs=$("rangeSeg");rs.innerHTML="";const li=LCODES.indexOf(LANG);
  RANGES.forEach((r,i)=>{const b=el("button",{type:"button"},r[li]||r[0]);b.addEventListener("click",()=>{days=RDAYS[i];store.set("days",days);$("period").value=d2v(days);markRanges();ANIM=true;drawChart()});rs.append(b)});
  $("period").value=d2v(days);markRanges();
  [...$("modeSeg").children].forEach(b=>{b.setAttribute("aria-pressed",String(b.dataset.m===mode));b.onclick=()=>{mode=b.dataset.m;store.set("mode",mode);buildSeg();drawMarket()}})}
$("period").addEventListener("input",e=>{ANIM=false;days=v2d(+e.target.value);markRanges();cancelAnimationFrame(rMarket.raf);rMarket.raf=requestAnimationFrame(drawChart)});
$("period").addEventListener("change",()=>store.set("days",days));
const spark=(sr,w,h)=>{const ys=sr.map(q=>q[1]),mn=Math.min(...ys),mx=Math.max(...ys),r=mx-mn||1;return sr.map((q,i)=>`${(2+(w-4)*i/Math.max(1,sr.length-1)).toFixed(1)},${(2+(h-4)*(1-(q[1]-mn)/r)).toFixed(1)}`).join(" ")};
function buildWatch(){const w=$("watch");w.innerHTML="";
  psyms().forEach(s=>{const p=D.precios[s],sr=serie(s).slice(-22),b=el("button",{class:"wi",type:"button","aria-pressed":String(s===sel)}),tt=el("span",{class:"t"}),pr=el("span",{class:"p"});
    tt.append(el("b",{},lab(s)),el("span",{},nm(s)));const g=sv("svg",{viewBox:"0 0 60 26","aria-hidden":"true"});g.append(sv("polyline",{points:spark(sr,60,26),fill:"none",stroke:sr.at(-1)[1]>=sr[0][1]?"var(--up)":"var(--down)","stroke-width":"1.5"}));
    pr.append(el("b",{},fmtPx(s,p.precio)),chg(p.cambio));b.append(el("span",{class:"sw",style:`background:${colorOf(s)}`}),tt,g,pr);b.addEventListener("click",()=>{sel=s;store.set("sel",s);drawMarket()});w.append(b)})}
function linksFor(s){const y=`https://finance.yahoo.com/quote/${encodeURIComponent(s)}`;if(/USD$|^\^|=F$/.test(s))return[["Yahoo Finance",y]];
  return[["Yahoo Finance",y],["TradingView",`https://www.tradingview.com/symbols/${s}/`],["Google Finance",`https://www.google.com/finance/quote/${s}`],["SEC",`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${s}&owner=include&count=40`]]}
function drawMarket(){ANIM=!window.LIVE_TICK;buildWatch();const s=sel,p=D.precios[s];
  $("cName").textContent=`${lab(s)} · ${nm(s)}`;$("cPx").textContent=fmtPx(s,p.precio)+" "+unitOf(s);
  const cc=$("cChg");cc.innerHTML="";cc.append(chg(p.cambio),el("span",{class:"small muted",style:"margin-left:6px"},t("mkt.today")));if(p.live)cc.append(el("span",{class:"live",style:"margin-left:8px"},t("live")));
  if(CUR!=="USD"&&unitOf(s)==="USD")cc.append(el("span",{class:"small muted",style:"margin-left:8px"},"≈ "+money(p.precio*fxNow())));
  const L=$("cLinks");L.innerHTML="";linksFor(s).forEach(([tx,u])=>L.append(el("a",{class:"pill",href:u,target:"_blank",rel:"noopener"},tx+" ↗")));
  $("targetRow").hidden=mode==="cmp";$("target").value=targets[s]??"";targetMsg();$("legend").hidden=mode!=="cmp";drawChart()}
function drawChart(){if(VIEW!=="market")return;if(mode==="cmp")return drawCompare();
  const s=sel,p=D.precios[s],sr=sliceD(s),pts=sr.map(q=>[T(q[0]),q[1]]),per=(p.precio-sr[0][1])/sr[0][1]*100,isShort=T(serie(s)[0][0])>END-days*864e5;
  $("cRange").textContent=`${pctf(per)} ${isShort?t("mkt.sinceStart"):t("mkt.inP",{p:dLabel(days)})} · ${t("mkt.since",{d:fD(sr[0][0],{day:"numeric",month:"short",year:"numeric"})})}`;
  const ys=sr.map(q=>q[1]),st=$("stats");st.innerHTML="";
  [["mkt.hiP",Math.max(...ys)],["mkt.loP",Math.min(...ys)],["mkt.hiY",p.max52],["mkt.loY",p.min52]].forEach(([l,v])=>{const d=el("div",{class:"stat"});d.append(el("span",{class:"lbl"},t(l)),el("b",{},v!=null?fmtPx(s,v):"—"));st.append(d)});
  const c=sr.at(-1)[1]>=sr[0][1]?"var(--up)":"var(--down)",refs=[];
  if(s==="ANT")refs.push({v:83,label:t("mkt.ipo")+" 83",c:"var(--muted)"});if(targets[s])refs.push({v:targets[s],label:t("mkt.yours")+" "+fmtPx(s,targets[s]),c:"var(--accent)"});
  chart("big","chartbox","tip",{anim:ANIM,lines:[{pts,c,area:true,end:"pill"}],refs,yfmt:v=>fmtPx(s,v),xfmt:timeFmt,tipx:timeTip,tipy:(l,q)=>`${fmtPx(s,q[1])} ${unitOf(s)}  ${pctf((q[1]-sr[0][1])/sr[0][1]*100)}`})}
function drawCompare(){const lg=$("legend");lg.innerHTML="";const syms=psyms();
  syms.forEach(s=>{const b=el("button",{class:"lg",type:"button","aria-pressed":String(!cmpOff[s])});b.append(el("i",{style:`background:${colorOf(s)}`}),document.createTextNode(lab(s)));b.addEventListener("click",()=>{cmpOff[s]=!cmpOff[s];store.set("cmpOff",cmpOff);drawCompare()});lg.append(b)});
  const lines=syms.filter(s=>!cmpOff[s]).sort((a,b)=>(b===sel)-(a===sel)).map(s=>{const sr=sliceD(s),b0=sr[0][1];return{name:lab(s),c:colorOf(s),w:s===sel?2.8:1.8,end:lab(s),pts:sr.map(q=>[T(q[0]),(q[1]-b0)/b0*100])}});
  chart("big","chartbox","tip",{anim:ANIM,lines,zero:true,strict:true,yfmt:pctf,xfmt:timeFmt,tipx:timeTip,tipy:(l,q)=>pctf(q[1])});
  $("cRange").textContent=t("mkt.cmpT",{p:dLabel(days)});$("stats").innerHTML=""}
function targetMsg(){const v=+$("target").value,m=$("targetMsg"),px=D.precios[sel].precio;if(!v){m.textContent=t("mkt.tHint");m.className="muted small";return}
  if(px<=v){m.textContent=t("mkt.tBelow");m.className="up small"}else{m.textContent=t("mkt.tLeft",{p:fix((px-v)/px*100,1)+" %"});m.className="muted small"}}
$("target").addEventListener("input",()=>{const v=+$("target").value;if(v)targets[sel]=v;else delete targets[sel];store.set("targets",targets);targetMsg();drawChart()});
$("alertBtn").addEventListener("click",()=>{if(!premium){location.hash="#premium";toast(t("pr.locked"));return}const v=+$("target").value;if(!v){toast(t("mkt.tHint"));return}alerts[sel]=v;store.set("alerts",alerts);toast(t("t.saved"))});

/* ---------- Cartera ---------- */
const CAT_DROP={funds:.3,tech:.5,ai:.5,fin:.5,latam:.5,crypto:.7};
function rPortfolio(){
  const sel2=$("bSym");if(!sel2.options.length){ALL.filter(s=>!["^VIX","BZ=F"].includes(s)).forEach(s=>sel2.append(el("option",{value:s},`${lab(s)} · ${nm(s)}`)));sel2.value="VOO"}
  else[...sel2.options].forEach(o=>o.textContent=`${lab(o.value)} · ${nm(o.value)}`);
  $("thLocal").textContent=t("port.local",{c:CUR});$("cAmtL").textContent=t("cash.amount",{c:CUR});
  const P=D.precios,tb=$("buys"),tt=totals();tb.innerHTML="";let cost=0,costed=0;const by={};
  if(!holdings.length){const tr=el("tr");tr.append(el("td",{colspan:"8",class:"empty"},t("port.empty")));tb.append(tr)}
  [...holdings].sort((a,b)=>(a.acct||"").localeCompare(b.acct||"")||a.s.localeCompare(b.s)).forEach(h=>{const p=P[h.s];if(!p)return;const val=h.q*p.precio;by[h.s]=(by[h.s]||0)+val;
    const tr=el("tr"),x=el("button",{class:"ob",type:"button","aria-label":t("mkt.del")},"✕"),lt=el("td",{class:"r"});x.onclick=()=>{holdings=holdings.filter(o=>o.id!==h.id);saveHoldings();rPortfolio()};lt.append(x);
    const a=el("td");a.append(el("b",{},lab(h.s)),el("div",{class:"note"},nm(h.s)));
    let gEl,lEl;if(h.px){const c=h.q*h.px,g=val-c;cost+=c;costed+=val;gEl=el("td",{class:"r num "+(g>=0?"up":"dn")},`${usd(g)} (${pctf(g/c*100)})`);
      const il=c*(h.fx||fxNow()),vl=val*fxNow();lEl=el("td",{class:"r num "+(vl>=il?"up":"dn")},`${money(vl)} (${pctf((vl-il)/il*100)})`)}
    else{gEl=el("td",{class:"r note"},t("port.noCost"));lEl=el("td",{class:"r num"},money(val*fxNow()))}
    tr.append(a,el("td",{},h.acct||"—"),el("td",{class:"r num"},h.q.toLocaleString(loc(),{maximumFractionDigits:6})),el("td",{class:"r num"},h.px?usd(h.px):"—"),el("td",{class:"r num"},usd(val)),gEl,lEl,lt);tb.append(tr)});
  $("investTot").textContent=holdings.length?usd(tt.investUSD)+" · "+money(tt.investUSD*fxNow()):"";
  // Resumen
  const ps=$("portSummary");ps.innerHTML="";const pbn=el("div",{class:"big-n"});ps.append(el("span",{class:"lbl"},t("port.total")),pbn);countUp(pbn,tt.totalUSD*fxNow(),v=>money(v),"port");
  if(hasAny()){ps.append(el("div",{class:"small muted"},`${t("port.invest")} ${money(tt.investUSD*fxNow())} · ${t("port.cashL")} ${money(tt.cashUSD*fxNow())}`));
    if(cost){const g=costed-cost;ps.append(el("div",{class:g>=0?"up":"dn"},t(g>=0?"port.youGain":"port.youLose",{x:usd(Math.abs(g))+" ("+pctf(g/cost*100)+")"})))}
    const chips=el("div",{class:"acct-chips"});Object.entries(tt.byAcct).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>{const c=el("span",{class:"acct"});c.append(el("b",{},k),document.createTextNode(" "+fix(v/tt.totalUSD*100,0)+" %"));chips.append(c)});ps.append(el("span",{class:"lbl"},t("port.byAcct")),chips)}
  else ps.append(el("p",{class:"small muted"},t("home.moneyEmpty")));
  // Torta (inversiones + ahorro)
  if(tt.cashUSD)by["__cash"]=tt.cashUSD;
  const svg=$("donut"),lg=$("dlegend"),tot=tt.totalUSD;svg.innerHTML="";lg.innerHTML="";const R=86,cx=110,cy=110,C=2*Math.PI*R;let off=0;
  svg.append(sv("circle",{cx,cy,r:R,fill:"none",stroke:"var(--sunk)","stroke-width":"28"}));
  const ent=Object.entries(by).sort((a,b)=>b[1]-a[1]);
  ent.forEach(([s,v],i)=>{const len=C*v/tot,c=`var(${PAL[i%PAL.length]})`;svg.append(sv("circle",{cx,cy,r:R,fill:"none",stroke:c,"stroke-width":"28","stroke-dasharray":`${Math.max(0,len-2)} ${C}`,"stroke-dashoffset":String(-off),transform:`rotate(-90 ${cx} ${cy})`}));off+=len;
    const it=el("span");it.append(el("i",{style:`background:${c}`}),document.createTextNode(`${s==="__cash"?t("port.cashL"):lab(s)} ${fix(v/tot*100,0)} %`));lg.append(it)});
  if(!ent.length)lg.append(el("span",{class:"note"},t("port.splitEmpty")));
  // Ahorro
  const cl=$("cashList");cl.innerHTML="";cash.forEach(c=>{const r=el("div",{class:"cash-row"}),x=el("button",{class:"ob",type:"button","aria-label":t("mkt.del")},"✕");x.onclick=()=>{cash=cash.filter(o=>o.id!==c.id);saveHoldings();rPortfolio()};
    const year=c.rate?" · "+t("div.year",{x:money(cashUSD(c)*fxNow()*c.rate/100)}):"";
    const nmEl=el("span");nmEl.append(el("b",{},c.name));r.append(nmEl,el("span",{class:"note"},(c.acct||"")+(c.rate?" · "+fix(c.rate,1)+" %":"")+year),el("b",{class:"num"},money(cashUSD(c)*fxNow())),x);cl.append(r)});
  // Dividendos
  const db=$("divBody");db.innerHTML="";let dsum=0;const rowsD=[];
  Object.keys(by).filter(s=>s!=="__cash").forEach(s=>{const per=P[s].div12||0;if(!per)return;const q=holdings.filter(h=>h.s===s).reduce((a,h)=>a+h.q,0),v=q*per;dsum+=v;rowsD.push([s,v,per/P[s].precio*100])});
  if(!rowsD.length)db.append(el("p",{class:"small muted"},holdings.length?t("div.none"):t("port.splitEmpty")));
  else{db.append(el("div",{class:"big-n sm"},t("div.year",{x:money(dsum*fxNow())})));rowsD.sort((a,b)=>b[1]-a[1]).forEach(([s,v,y])=>{const r=el("div",{class:"cash-row"});r.append(el("b",{},lab(s)),el("span",{class:"note"},fix(y,2)+" %"),el("span",{class:"num"},usd(v)));db.append(r)})}
  // Alertas (Premium)
  const ab=$("alertsBody");ab.innerHTML="";
  if(!premium){const lk=el("div",{class:"locked"});lk.append(el("div",{class:"blur"},"NVDA 120 · ANT 80 · VOO 600 · BTC 55 000"));const ov=el("div",{class:"over"});ov.append(el("a",{class:"btn pri sm",href:"#premium"},"★ "+t("pr.see")));lk.append(ov);ab.append(lk)}
  else{const syms=[...new Set(holdings.map(b=>b.s))];if(!syms.length)ab.append(el("p",{class:"small muted"},t("port.empty")));
    syms.forEach(s=>{const r=el("div",{class:"alert-row"}),inp=el("input",{type:"number",step:"0.5",min:"0","aria-label":lab(s)});inp.value=alerts[s]??"";
      const b=el("button",{class:"btn sm",type:"button"},"🔔");b.onclick=()=>{const v=+inp.value;if(v)alerts[s]=v;else delete alerts[s];store.set("alerts",alerts);toast(t("t.saved"))};
      r.append(el("span",{},`${lab(s)} · ${fmtPx(s,D.precios[s].precio)} USD`),inp,b);ab.append(r)})}
}
$("bAdd").addEventListener("click",()=>{const s=$("bSym").value,q=+$("bQ").value,px=+$("bPx").value||null;if(!(q>0)){toast(t("port.need"));return}
  const d=new Date(END).toISOString().slice(0,10);holdings.push({id:Math.random().toString(36).slice(2,9),s,q,px,d,acct:$("bAcct").value.trim(),fx:fxNow()});saveHoldings();$("bQ").value="";$("bPx").value="";rPortfolio();toast(t("port.added"))});
$("cAdd").addEventListener("click",()=>{const name=$("cNameIn").value.trim()||t("port.cashL"),amt=+$("cAmt").value;if(!(amt>0)){toast(t("port.need"));return}
  cash.push({id:Math.random().toString(36).slice(2,9),name,amt,cur:CUR,rate:+$("cRate").value||0,acct:$("cAcct").value.trim()});saveHoldings();["cNameIn","cAmt","cRate","cAcct"].forEach(i=>$(i).value="");rPortfolio();toast(t("t.saved"))});

/* ---------- Noticias ---------- */
let ntab=store.get("ntab","you"),nAll=false;
const TAGC=["--p0","--p1","--p2","--p3","--p4","--p5","--p6"];
function rNews(){
  const keys=Object.keys(NEWS.temas).filter(k=>NEWS.temas[k].length);
  const mine=mySyms().filter(s=>keys.includes(s));const tabs=[["you",t("news.forYou")],...mine.map(s=>[s,lab(s)]),["MERCADO",t("news.market")],["MUNDO",t("news.world")]];
  if(!tabs.some(x=>x[0]===ntab))ntab="you";
  const box=$("ntabs");box.innerHTML="";tabs.forEach(([k,l])=>{const b=el("button",{type:"button","aria-pressed":String(k===ntab)},l);b.addEventListener("click",()=>{ntab=k;nAll=false;store.set("ntab",k);rNews()});box.append(b)});
  $("nLang").checked=store.get("nLang",false);
  const src=ntab==="you"?[...mine,"MERCADO"]:[ntab];
  // Se intercalan los temas (uno de cada uno) para que "Para ti" no muestre primero todo de una sola empresa.
  const lists=src.map(k=>(NEWS.temas[k]||[]).map(n=>({...n,k})).sort((a,b)=>b.d.localeCompare(a.d)));let items=[];
  for(let i=0;lists.some(l=>i<l.length);i++)lists.forEach(l=>{if(l[i])items.push(l[i])});
  const seen=new Set();items=items.filter(n=>{const x=n.t.toLowerCase().slice(0,60);if(seen.has(x))return false;seen.add(x);return true});
  items=$("nLang").checked?items.filter(n=>n.l===GDELT_LANG[LANG]):items.filter(n=>n.l===GDELT_LANG[LANG]||n.l==="English");
  const q=$("nq").value.trim().toLowerCase();if(q)items=items.filter(n=>(n.t+" "+n.f).toLowerCase().includes(q));
  const brief=ntab!=="you"&&BR.activos[ntab==="MERCADO"?"VOO":ntab]?.[LANG];$("aiBrief").hidden=!brief;if(brief)$("aiBriefBody").textContent=brief;
  const list=$("newsList");list.innerHTML="";const total=items.length;if(!q&&!nAll)items=items.slice(0,14);
  items.forEach((n,i)=>{if(!/^https?:\/\//.test(n.u))return;const a=el("button",{class:"ni",type:"button"}),tx=el("div",{style:"display:grid;gap:3px;min-width:0"});
    const ds=n.d?`${n.d.slice(0,4)}-${n.d.slice(4,6)}-${n.d.slice(6,8)}`:"";
    tx.append(el("span",{class:"tt"},n.t),el("span",{class:"mt"},`${n.f} · ${ds?fD(ds):""} ${n.d?n.d.slice(9,11)+":"+n.d.slice(11,13):""} · ${n.l}`));
    const tag=n.k==="MERCADO"?"WALL ST":n.k==="MUNDO"?"ECON":lab(n.k);a.append(el("span",{class:"tg",style:`background:var(${TAGC[Math.abs([...n.k].reduce((h,c)=>h*31+c.charCodeAt(0),7))%TAGC.length]})`},tag),tx,el("span",{class:"chev"},"›"));a.onclick=()=>newsSheet(n);list.append(a);
    if(i===3&&!premium){const ad=el("div",{class:"news-ad"});ad.append(ph67(t("ad.label")));list.append(ad)}});
  if(!list.children.length)list.append(el("div",{class:"empty"},t("news.none")));
  if(total>items.length){const m=el("div",{class:"more-btn"}),b=el("button",{class:"btn",type:"button"},t("news.more",{n:total}));b.addEventListener("click",()=>{nAll=true;rNews()});m.append(b);list.append(m)}
}
$("nq").addEventListener("input",rNews);$("nLang").addEventListener("change",()=>{store.set("nLang",$("nLang").checked);rNews()});

/* ---------- Simulador ---------- */
const SC0=()=>[{k:"sim.s0",r:0,c:"var(--faint)"},{k:"sim.s1",r:3,c:"var(--p0)"},{k:"sim.s2",r:7,c:"var(--up)"},{k:"sim.s3",r:10,c:"var(--p4)"}];
let SC=store.get("scen")||SC0();
function simDefaults(){const f=fxNow(),r=v=>{const m=Math.pow(10,Math.max(0,Math.floor(Math.log10(v))-1));return Math.round(v/m)*m};
  const s=store.get("sim");$("sIni").value=s?.ini??r(1000*f);$("sMes").value=s?.mes??r(100*f);$("sSube").value=s?.sube??0;$("sMeta").value=s?.meta??"";$("sAnios").value=s?.y??10}
function grow(P,M,r,Y,up,meta){const o=[P];let v=P,m=M,hit=null;const mr=Math.pow(1+r/100,1/12)-1;
  for(let k=1;k<=Y*12;k++){v=v*(1+mr)+m;if(meta&&hit==null&&v>=meta)hit=k;if(k%12===0){o.push(v);m*=1+up/100}}
  if(meta&&hit==null){let k=Y*12;while(v<meta&&k<1200){k++;v=v*(1+mr)+m;if(k%12===0)m*=1+up/100}if(v>=meta)hit=k}return{o,hit}}
function rSim(){document.querySelectorAll(".cur").forEach(e=>e.textContent=CUR);if(!rSim.init){simDefaults();rSim.init=true}drawProj();rTM()}
function drawProj(){if(VIEW!=="sim")return;
  const P=Math.max(0,+$("sIni").value||0),M=Math.max(0,+$("sMes").value||0),Y=+$("sAnios").value,up=Math.max(0,+$("sSube").value||0),meta=Math.max(0,+$("sMeta").value||0);
  $("sAniosL").textContent=t("sim.years",{n:Y});const res=SC.map(s=>grow(P,M,s.r,Y,up,meta));let put=P,m=M;for(let k=1;k<=Y*12;k++){put+=m;if(k%12===0)m*=1+up/100}
  const yr=new Date().getFullYear();
  chart("projChart","projBox","ptip",{lines:SC.map((s,k)=>({name:`${t(s.k)} (${s.r} %)`,c:s.c,w:k===2?2.8:1.8,dash:k===0?"4 4":"none",pts:res[k].o.map((v,i)=>[i,v])})),refs:meta?[{v:meta,label:t("sim.goalL")+" "+short(meta),c:"var(--accent)"}]:[],
    floor0:true,yfmt:short,xfmt:v=>Math.round(v)===0?t("sim.now"):String(yr+Math.round(v)),tipx:v=>v===0?t("sim.now"):t("sim.year",{n:v})+` (${yr+v})`,tipy:(l,q)=>money(q[1])});
  const box=$("scen");box.innerHTML="";box.append(el("h3",{},t("sim.have",{n:Y})),el("p",{class:"small muted"},t("sim.put",{x:money(put)})));
  SC.forEach((s,k)=>{const d=el("div",{class:"sc"+(k===2?" main":"")}),inp=el("input",{type:"number",step:"0.5",min:"-20",max:"30","aria-label":t(s.k)});inp.value=s.r;
    inp.addEventListener("change",()=>{s.r=+inp.value||0;store.set("scen",SC);drawProj()});const pc=el("span",{style:"display:flex;align-items:center;gap:3px"});pc.append(inp,document.createTextNode("%"));
    d.append(el("i",{style:`background:${s.c}`}),el("span",{},t(s.k)),pc,el("b",{},short(res[k].o.at(-1))));box.append(d);
    if(meta){const h=res[k].hit;box.append(el("span",{class:"note",style:"padding-left:26px;margin-top:-4px"},h?t("sim.reach",{y:Math.floor(h/12),m:h%12}):t("sim.noReach")))}});
  const rs=el("button",{class:"btn sm",type:"button",style:"justify-self:start"},t("sim.reset"));rs.addEventListener("click",()=>{store.del("scen");SC=SC0();drawProj()});box.append(rs);
  const cr=$("crash");cr.innerHTML="";const by={};holdings.forEach(b=>{if(D.precios[b.s])by[b.s]=(by[b.s]||0)+b.q*D.precios[b.s].precio});const tot=Object.values(by).reduce((a,b)=>a+b,0);
  if(!tot)cr.append(el("span",{class:"small muted"},t("sim.crashEmpty")));else{let after=0;Object.entries(by).forEach(([s,v])=>after+=v*(1-(CAT_DROP[INFO[s]?.[1]]??.5)));
    cr.textContent=t("sim.crashRes",{a:money(tot*fxNow()),b:money(after*fxNow())})}}
["sIni","sMes","sSube","sMeta","sAnios"].forEach(id=>$(id).addEventListener("input",()=>{store.set("sim",{ini:+$("sIni").value,mes:+$("sMes").value,sube:+$("sSube").value,meta:$("sMeta").value,y:+$("sAnios").value});drawProj()}));
function rTM(){const S=$("tmSym");if(!S.options.length){ALL.filter(s=>s!=="^VIX").forEach(s=>S.append(el("option",{value:s},`${lab(s)} · ${nm(s)}`)));const tm=store.get("tm",{});S.value=tm.s||"VOO";$("tmMode").value=tm.mode||"once";$("tmAmt").value=tm.amt||Math.round(1000*fxNow());$("tmYrs").value=tm.m||36}
  [...$("tmMode").options].forEach(o=>o.textContent=t(o.dataset.t));drawTM()}
function drawTM(){if(VIEW!=="sim")return;const s=$("tmSym").value,mode=$("tmMode").value,amt=Math.max(0,+$("tmAmt").value||0),months=+$("tmYrs").value;store.set("tm",{s,mode,amt,m:months});
  const per=months<24?t("u.m",{n:months}):t("u.y",{n:fix(months/12,months%12?1:0)});$("tmYrsL").textContent=t("sim.ago",{p:per});
  const sr=serie(s),first=T(sr[0][0]),start=Math.max(END-months*30.44*864e5,first),pts=sr.filter(p=>T(p[0])>=start),out=$("tmOut");out.innerHTML="";
  if(pts.length<2||!amt){chart("tmChart","tmBox","tmTip",{h:230,lines:[],yfmt:short,xfmt:timeFmt,tipx:timeTip,tipy:()=>""});return}
  let units=0,put=0,next=T(pts[0][0]);const val=[],pl=[];
  pts.forEach(p=>{const tt=T(p[0]),fx=fxAt(p[0]);if(mode==="once"?units===0:tt>=next){units+=amt/fx/p[1];put+=amt;next=tt+30.44*864e5}val.push([tt,units*p[1]*fx]);pl.push([tt,put])});
  const endV=units*D.precios[s].precio*fxNow();if(END>val.at(-1)[0]){val.push([END,endV]);pl.push([END,put])}
  const g=endV-put,ini=fT(T(pts[0][0]),{day:"numeric",month:"short",year:"numeric"});
  const stats=[["sim.tmPut",money(put),mode==="once"?t("sim.tmOn",{d:ini}):t("sim.tmEvery",{x:money(amt),d:ini})],["sim.tmNow",money(endV),pctf(g/put*100)],[g>=0?"sim.tmGain":"sim.tmLoss",money(Math.abs(g)),CUR==="USD"?"":t("sim.tmFx",{a:fix(fxAt(pts[0][0]),0),b:fix(fxNow(),0)})]];
  stats.forEach(([l,v,n],i)=>{const d=el("div",{class:"stat"});d.append(el("span",{class:"lbl"},t(l)),el("b",{class:i===2?(g>=0?"up":"dn"):""},v),el("span",{class:"note"},n));out.append(d)});
  if(first>END-months*30.44*864e5)out.append(el("p",{class:"note",style:"grid-column:1/-1"},t("sim.tmSince",{s:lab(s),d:fT(first,{day:"numeric",month:"short",year:"numeric"})})));
  chart("tmChart","tmBox","tmTip",{h:230,lines:[{name:t("sim.value"),c:g>=0?"var(--up)":"var(--down)",pts:val,area:true},{name:t("sim.putL"),c:"var(--muted)",dash:"4 4",w:1.6,pts:pl}],floor0:true,yfmt:short,xfmt:timeFmt,tipx:timeTip,tipy:(l,q)=>money(q[1])})}
["tmSym","tmMode","tmAmt","tmYrs"].forEach(id=>$(id).addEventListener("input",drawTM));

/* ---------- Análisis ---------- */
function rAnalysis(){$("anDate").textContent=fD(AN.fecha_iso,{weekday:"long",day:"numeric",month:"long",year:"numeric"});$("anTit").textContent=AN.titular[LANG];$("anSub").textContent=AN.bajada[LANG];
  const cf=$("anCif");cf.innerHTML="";AN.cifras.forEach(c=>{const d=el("div",{class:"an-c"});d.append(el("span",{},c.l[LANG]),el("b",{class:c.t||""},c.v),el("span",{},c.s[LANG]));cf.append(d)});
  const age=Math.floor((Date.now()-T(AN.fecha_iso))/864e5)-1;$("anOld").hidden=age<3;if(age>=3)$("anOld").textContent=t("an.old",{n:age});
  const box=$("anSecs");box.innerHTML="";AN.secciones.forEach((s,i)=>{const c=el("div",{class:"card an-s"+(s.ti?" wide":"")}),h=el("h3"),ul=el("ul");h.append(el("span",{class:"n"},String(i+1)),document.createTextNode(s.titulo[LANG]));
    s.puntos[LANG].forEach(p=>ul.append(el("li",{},p)));c.append(h,ul);box.append(c)});
  const f=$("anSrc");f.innerHTML="";AN.fuentes.forEach(([tx,u])=>{const li=el("li");li.append(el("a",{href:u,target:"_blank",rel:"noopener"},tx));f.append(li)})}

/* ---------- Fechas ---------- */
let etab=store.get("etab","all");
const pad=n=>String(n).padStart(2,"0"),zs=x=>`${x.getUTCFullYear()}${pad(x.getUTCMonth()+1)}${pad(x.getUTCDate())}T${pad(x.getUTCHours())}${pad(x.getUTCMinutes())}00Z`;
function evDates(e){if(e.h){const [h,m]=e.h.split(":").map(Number),s=new Date(T(e.f)+(h+5)*36e5+m*6e4);return[zs(s),zs(new Date(s.getTime()+36e5))]}
  const n=new Date(T(e.f)+864e5);return[e.f.replace(/-/g,""),`${n.getUTCFullYear()}${pad(n.getUTCMonth()+1)}${pad(n.getUTCDate())}`]}
const gLink=e=>{const [a,b]=evDates(e);return"https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent((e.imp?"⭐ ":"")+e.t[LANG])+"&dates="+a+"/"+b+"&details="+encodeURIComponent(e.d[LANG]+"\n\nProyecto Py")};
function icsOne(e){const [a,b]=evDates(e),esc=x=>x.replace(/[\\;,]/g,m=>"\\"+m),dt=e.h?`DTSTART:${a}\r\nDTEND:${b}`:`DTSTART;VALUE=DATE:${a}\r\nDTEND;VALUE=DATE:${b}`;
  return`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//proyecto-py//${LANG}\r\nBEGIN:VEVENT\r\nUID:${e.f}-${encodeURIComponent(e.t.en).slice(0,30)}@proyecto-py\r\nDTSTAMP:${zs(new Date())}\r\n${dt}\r\nSUMMARY:${esc(e.t[LANG])}\r\nDESCRIPTION:${esc(e.d[LANG])}\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`}
function rDates(){
  const url=new URL(`data/fechas-${LANG}.ics`,location.href).href,wc=url.replace(/^https?:/,"webcal:");$("icsUrl").textContent=url;
  $("gcal").href="https://calendar.google.com/calendar/render?cid="+encodeURIComponent(wc);$("webcal").href=wc;
  const tabs=$("evTabs");tabs.innerHTML="";[["all","dt.all"],["co","dt.co"],["mk","dt.mk"]].forEach(([k,l])=>{const b=el("button",{type:"button","aria-pressed":String(k===etab)},t(l));b.addEventListener("click",()=>{etab=k;store.set("etab",k);rDates()});tabs.append(b)});
  const box=$("tl");box.innerHTML="";const today=new Date(new Date().toDateString());let nx=false;
  EV.filter(e=>etab==="all"||e.tipo===etab).forEach(e=>{const dt=new Date(e.f+"T12:00"),n=Math.floor((dt-today)/864e5),isNext=!nx&&n>=0;if(isNext){nx=true;$("nextEv").textContent=t("dt.next",{t:e.t[LANG],n})}
    const r=el("button",{type:"button",class:"evc"+(n<0?" past":"")+(isNext?" next":"")}),d=el("span",{class:"d"});d.append(el("b",{},e.f.slice(8)),document.createTextNode(fT(T(e.f),{month:"short"})));
    const mid=el("span",{style:"display:grid;min-width:0"}),tg=el("span",{class:"tags"});tg.append(el("span",{class:"tag"},t(e.tipo==="co"?"dt.co":"dt.mk")));if(e.imp)tg.append(el("span",{class:"tag w"},t("dt.imp")));if(e.aprox)tg.append(el("span",{class:"tag w"},t("dt.approx")));
    mid.append(tg,el("span",{class:"tt"},e.t[LANG]));r.append(d,mid,el("span",{class:"cd num small muted"},n<0?t("dt.past"):t("dt.d",{n})));r.onclick=()=>eventSheet(e,n);box.append(r)})}
function eventSheet(e,n){sheet(s=>{const tg=el("div",{class:"tags"});tg.append(el("span",{class:"tag"},t(e.tipo==="co"?"dt.co":"dt.mk")));if(e.sym)tg.append(el("span",{class:"tag"},lab(e.sym)));if(e.imp)tg.append(el("span",{class:"tag w"},t("dt.imp")));if(e.aprox)tg.append(el("span",{class:"tag w"},t("dt.approx")));
  s.append(tg,el("h2",{},e.t[LANG]),el("div",{class:"meta"},fD(e.f,{weekday:"long",day:"numeric",month:"long",year:"numeric"})+(e.h?" · "+e.h+" (NY)":"")+" · "+(n<0?t("dt.past"):t("dt.d",{n}))),el("p",{},e.d[LANG]));
  if(n>=0){const r=el("div",{class:"row"}),ics=el("button",{class:"btn",type:"button"},"⬇ .ics");r.append(el("a",{class:"btn pri",href:gLink(e),target:"_blank",rel:"noopener"},"＋ Google Calendar"),ics);
    ics.onclick=()=>{const u=URL.createObjectURL(new Blob([icsOne(e)],{type:"text/calendar"})),a2=el("a",{href:u,download:e.f+".ics"});document.body.append(a2);a2.click();a2.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)};s.append(r)}})}
$("copyIcs").addEventListener("click",()=>navigator.clipboard.writeText($("icsUrl").textContent).then(()=>toast(t("dt.copied")),()=>{const r=document.createRange();r.selectNodeContents($("icsUrl"));getSelection().removeAllRanges();getSelection().addRange(r)}));

/* ---------- Pasos ---------- */
const defSteps=()=>t("st.defaults").split("|").map(x=>({t:x,done:false}));
let steps=store.get("steps");
const saveSteps=()=>store.set("steps",steps);
function rSteps(){const list=steps||defSteps(),ol=$("steps");ol.innerHTML="";
  const own=()=>{if(!steps){steps=list;}};
  list.forEach((s,i)=>{const li=el("li",{class:s.done?"done":""}),cb=el("input",{type:"checkbox","aria-label":"✓"}),tx=el("input",{type:"text",class:"tx"}),ops=el("div",{class:"ops"});
    cb.checked=s.done;cb.addEventListener("change",()=>{own();s.done=cb.checked;saveSteps();rSteps()});tx.value=s.t;tx.addEventListener("change",()=>{own();s.t=tx.value.trim()||s.t;saveSteps()});
    const mk=(sym,f)=>{const b=el("button",{class:"ob",type:"button"},sym);b.addEventListener("click",()=>{own();f();saveSteps();rSteps()});ops.append(b)};
    mk("↑",()=>{if(i>0)[steps[i-1],steps[i]]=[steps[i],steps[i-1]]});mk("↓",()=>{if(i<steps.length-1)[steps[i+1],steps[i]]=[steps[i],steps[i+1]]});mk("✕",()=>steps.splice(i,1));
    li.append(cb,tx,ops);ol.append(li)});
  const d=list.filter(s=>s.done).length;$("stepCount").textContent=t("st.of",{a:d,b:list.length});$("stepBar").style.width=(list.length?d/list.length*100:0)+"%"}
$("stepForm").addEventListener("submit",e=>{e.preventDefault();const v=$("stepNew").value.trim();if(!v)return;if(!steps)steps=defSteps();steps.push({t:v,done:false});saveSteps();$("stepNew").value="";rSteps()});
$("stepsReset").addEventListener("click",e=>confirmBtn(e.currentTarget,()=>{steps=null;store.del("steps");rSteps()}));

/* ---------- Premium y ajustes ---------- */
function rPremium(){$("prState").textContent=premium?"★ "+t("pr.active"):""}
const CURS=[["USD","US$"],["EUR","€"],["GBP","£"],["MXN","MX$"],["BRL","R$"],["COP","COL$"],["ARS","AR$"],["CLP","CL$"],["PEN","S/"],["CAD","CA$"],["JPY","¥"]].filter(c=>c[0]==="USD"||D?.fx?.[c[0]]);
function rSettings(){
  const sl=$("setLang");sl.innerHTML="";LANGS.forEach(([c,n])=>{const b=el("button",{type:"button","aria-pressed":String(c===LANG)},n);b.addEventListener("click",()=>setLang(c));sl.append(b)});
  const sc=$("setCur");sc.innerHTML="";CURS.forEach(([c,s])=>sc.append(el("option",{value:c},`${c} · ${s}`)));sc.value=CUR;
  const st=$("setTheme");st.innerHTML="";[["system","set.system"],["light","set.light"],["dark","set.dark"]].forEach(([k,l])=>{const b=el("button",{type:"button","aria-pressed":String(store.get("theme","system")===k)},t(l));b.addEventListener("click",()=>{store.set("theme",k);applyTheme();rSettings()});st.append(b)});
  $("setDemo").checked=premium;PyCuenta.draw()}
function setLang(c){LANG=c;store.set("lang",c);applyI18n();buildNav();header();route()}
$("setCur").addEventListener("change",e=>{CUR=e.target.value;store.set("cur",CUR);rSim.init=false;store.del("sim");header();toast(t("t.saved"))});
$("setDemo").addEventListener("change",e=>{premium=e.target.checked;store.set("premium",premium);header();fillAds();toast(premium?"★ "+t("pr.active"):t("t.saved"))});
$("expBtn").addEventListener("click",()=>{const dump={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith("py."))dump[k]=localStorage.getItem(k)}
  const u=URL.createObjectURL(new Blob([JSON.stringify(dump,null,1)],{type:"application/json"})),a=el("a",{href:u,download:"proyecto-py.json"});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)});
$("impFile").addEventListener("change",async e=>{try{const d=JSON.parse(await e.target.files[0].text());Object.entries(d).forEach(([k,v])=>{if(k.startsWith("py."))localStorage.setItem(k,v)});toast(t("set.imported"));setTimeout(()=>location.reload(),600)}catch(x){toast(t("set.bad"))}});
$("wipeBtn").addEventListener("click",e=>confirmBtn(e.currentTarget,()=>{Object.keys(localStorage).filter(k=>k.startsWith("py.")).forEach(k=>localStorage.removeItem(k));location.reload()}));
let installEv=null;addEventListener("beforeinstallprompt",e=>{e.preventDefault();installEv=e;$("installBtn").hidden=false});
$("installBtn").addEventListener("click",()=>installEv&&installEv.prompt());

/* ---------- Bienvenida (2 pasos) ---------- */
const CUR_BY_LANG={es:"USD",en:"USD",pt:"BRL",fr:"EUR",de:"EUR"};
const CUR_BY_ZONE={Bogota:"COP",Mexico_City:"MXN",Monterrey:"MXN",Sao_Paulo:"BRL",Buenos_Aires:"ARS",Santiago:"CLP",Lima:"PEN",London:"GBP",Toronto:"CAD",Tokyo:"JPY",Madrid:"EUR",Paris:"EUR",Berlin:"EUR",Lisbon:"EUR",Rome:"EUR"};
function guessCur(){const z=(Intl.DateTimeFormat().resolvedOptions().timeZone||"").split("/").pop();return CUR_BY_ZONE[z]||CUR_BY_LANG[LANG]||"USD"}
function onboarding(done){
  const o=$("onb");o.hidden=false;if(!store.get("cur"))CUR=guessCur();
  const step=n=>o.querySelectorAll(".onb-step").forEach(s=>s.hidden=+s.dataset.step!==n);
  const draw=()=>{applyI18n();const L=$("onbLangs");L.innerHTML="";LANGS.forEach(([c,n])=>{const b=el("button",{type:"button","aria-pressed":String(c===LANG)},n);b.onclick=()=>{LANG=c;store.set("lang",c);draw()};L.append(b)});
    const C=$("onbCur");C.innerHTML="";CURS.forEach(([c,sy])=>C.append(el("option",{value:c},`${c} · ${sy}`)));C.value=CUR};
  $("onbCur").onchange=e=>{CUR=e.target.value};
  $("onbNext").onclick=()=>{store.set("cur",CUR);step(2)};
  o.querySelectorAll("[data-onb]").forEach(b=>b.onclick=()=>{store.set("onboarded",true);o.hidden=true;const k=b.dataset.onb;done(k==="skip");if(k!=="skip")PyImport.open(k)});
  step(1);draw()}

/* ---------- Arranque ---------- */
async function boot(){
  applyI18n();buildNav();
  const get=f=>fetch("data/"+f,{cache:"no-cache"}).then(r=>r.json());
  [D,NEWS,AN,BR,EV]=await Promise.all(["mercado.json","noticias.json","analisis.json","resumenes.json","eventos.json"].map(get));
  document.body.classList.remove("loading");$("skel").remove();ALL=Object.keys(D.precios);END=Math.max(...ALL.map(s=>T(serie(s).at(-1)[0])));
  CURS.splice(0,CURS.length,...[["USD","US$"],["EUR","€"],["GBP","£"],["MXN","MX$"],["BRL","R$"],["COP","COL$"],["ARS","AR$"],["CLP","CL$"],["PEN","S/"],["CAD","CA$"],["JPY","¥"]].filter(c=>c[0]==="USD"||D.fx[c[0]]));
  // Vista previa para capturas: ?shot=1 salta la bienvenida y el anuncio y usa compras de ejemplo (no guarda nada).
  const Q=new URLSearchParams(location.search),SHOT=Q.has("shot");
  if(SHOT){if(Q.get("lang"))LANG=Q.get("lang");if(Q.get("cur"))CUR=Q.get("cur");premium=Q.has("premium");applyI18n();buildNav();
    if(!Q.has("empty")&&!holdings.length){holdings=[{id:"a",s:"VOO",q:.0944,px:635.54,d:"2026-11-20",acct:"Hapi",fx:fxAt("2026-11-20")},{id:"b",s:"ANT",q:.39,px:88.91,d:"2026-11-20",acct:"Hapi",fx:fxAt("2026-11-20")},{id:"c",s:"NVDA",q:.5,px:null,d:"2026-11-20",acct:"Hapi",fx:fxAt("2026-11-20")},{id:"d",s:"GOOGL",q:.13,px:190,d:"2025-11-20",acct:"eToro",fx:fxAt("2025-11-20")},{id:"e",s:"BTC-USD",q:.001,px:61000,d:"2026-10-01",acct:"Binance",fx:fxAt("2026-10-01")}];cash=[{id:"f",name:"CDT",amt:240000,cur:"COP",rate:13,acct:"Lulo"}]}}
  header();
  PyImport.init();PyCuenta.init();PyVivo.init();route();
  const start=(ad)=>{applyI18n();buildNav();header();route();if(ad&&(!SHOT||Q.has("ad")))interstitial()};
  if((SHOT&&Q.has("onb"))||(!SHOT&&!store.get("onboarded")))onboarding(start);else if(!SHOT||Q.has("ad"))interstitial();
  if(SHOT){document.documentElement.classList.add("noanim");const sh=Q.get("sheet");
    if(sh==="asset")assetSheet(Q.get("s")||"NVDA");if(sh==="news")newsSheet({...NEWS.temas.NVDA[0],k:"NVDA"});if(sh==="event")eventSheet(EV[2],19)}
  if(SHOT&&Q.get("imp")){PyImport.open(Q.get("imp"));if(Q.get("impq"))PyImport.review(Q.get("impq"),Q.get("imp"),"")}
  let rt;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(render,150)});
  if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});
}
boot();
