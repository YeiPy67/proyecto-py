"use strict";
/* Proyecto Py — video "Cinco personas": 20 años, el mismo dinero, cinco formas de invertirlo.
   Se dibuja en un <canvas> a partir de data/cinco.json (S&P 500 real, con dividendos), así sirve en los 5 idiomas.
   draw(ctx,W,H,t,li,D) es puro: el mismo tiempo t da siempre el mismo cuadro (así también se exporta a MP4). */
const PyVideo=(()=>{
  const DUR=74;
  const TX={
    t1:["5 personas. 20 años.","5 people. 20 years.","5 pessoas. 20 anos.","5 personnes. 20 ans.","5 Menschen. 20 Jahre."],
    t2:["El mismo dinero.","The same money.","O mesmo dinheiro.","Le même argent.","Dasselbe Geld."],
    t3:["Cada una recibe {a} al año y lo invierte en el S&P 500: las 500 empresas más grandes de Estados Unidos, todas juntas.","Each one gets {a} a year and invests it in the S&P 500: the 500 largest US companies, all together.","Cada uma recebe {a} por ano e investe no S&P 500: as 500 maiores empresas dos EUA, todas juntas.","Chacune reçoit {a} par an et l’investit dans le S&P 500 : les 500 plus grandes entreprises américaines, toutes ensemble.","Jede bekommt {a} pro Jahr und legt es im S&P 500 an: den 500 größten US-Firmen, alle zusammen."],
    t4:["Lo único que cambia es cuándo invierte.","The only difference is when they invest.","A única diferença é quando investem.","La seule différence : quand elles investissent.","Der einzige Unterschied: wann sie investieren."],
    n_perfect:["La que ve el futuro","The fortune teller","A que vê o futuro","La voyante","Die Hellseherin"],
    n_now:["La del primer día","The first-day investor","A do primeiro dia","Celle du premier jour","Die vom ersten Tag"],
    n_monthly:["La constante","The steady one","A constante","La régulière","Die Beständige"],
    n_worst:["La de mala suerte","The unlucky one","A azarada","La malchanceuse","Die Pechvogel"],
    n_cash:["La que esperó","The one who waited","A que esperou","Celle qui a attendu","Die Abwartende"],
    s_perfect:["Sabe el futuro: cada año invierte justo en el mes más barato.","Knows the future: every year she invests in the cheapest month.","Sabe o futuro: todo ano investe no mês mais barato.","Elle connaît l’avenir : chaque année, elle investit au mois le moins cher.","Kennt die Zukunft: Jedes Jahr investiert sie im billigsten Monat."],
    s_now:["Invierte todo apenas le llega el dinero, en enero.","Invests it all as soon as the money arrives, in January.","Investe tudo assim que o dinheiro chega, em janeiro.","Elle investit tout dès que l’argent arrive, en janvier.","Investiert alles, sobald das Geld kommt, im Januar."],
    s_monthly:["Lo divide en 12 e invierte un poco cada mes, sin mirar el precio.","Splits it in 12 and invests a little every month, never checking the price.","Divide em 12 e investe um pouco todo mês, sem olhar o preço.","Elle divise en 12 et investit un peu chaque mois, sans regarder le prix.","Teilt es in 12 und investiert jeden Monat etwas, ohne auf den Kurs zu schauen."],
    s_worst:["Mala suerte total: cada año invierte en el mes más caro.","Terrible luck: every year she invests in the most expensive month.","Azar total: todo ano investe no mês mais caro.","Pas de chance : chaque année, elle investit au mois le plus cher.","Pech pur: Jedes Jahr investiert sie im teuersten Monat."],
    s_cash:["Espera el momento perfecto… que nunca llega. Guarda todo.","Waits for the perfect moment… that never comes. Keeps it all in cash.","Espera o momento perfeito… que nunca chega. Guarda tudo.","Elle attend le moment parfait… qui ne vient jamais. Elle garde tout.","Wartet auf den perfekten Moment … der nie kommt. Behält alles."],
    c0:["Empiezan.","They begin.","Elas começam.","C’est parti.","Es geht los."],
    c08:["2008: la gran crisis. La bolsa cae a la mitad.","2008: the great crisis. The market falls by half.","2008: a grande crise. A bolsa cai pela metade.","2008 : la grande crise. La Bourse perd la moitié.","2008: die große Krise. Die Börse halbiert sich."],
    c09:["Las que siguieron invirtiendo compraron barato.","Those who kept investing bought cheap.","Quem continuou investindo comprou barato.","Celles qui ont continué ont acheté pas cher.","Wer weiter investierte, kaufte billig."],
    c20:["2020: el covid. Cae fuerte… y vuelve a subir.","2020: Covid. A sharp fall… and back up again.","2020: a covid. Cai forte… e volta a subir.","2020 : le Covid. Forte chute… puis ça remonte.","2020: Corona. Ein harter Absturz … und wieder hoch."],
    c22:["Hay años malos. Siempre los hay.","There are bad years. There always are.","Há anos ruins. Sempre há.","Il y a de mauvaises années. Toujours.","Es gibt schlechte Jahre. Immer."],
    c13:["Años tranquilos: el dinero ya invertido empieza a crecer solo.","Calm years: money already invested starts growing on its own.","Anos tranquilos: o dinheiro já investido começa a crescer sozinho.","Années calmes : l’argent déjà investi commence à grossir tout seul.","Ruhige Jahre: Das angelegte Geld wächst von selbst."],
    c24:["Y la bolsa vuelve a máximos.","And the market hits new highs.","E a bolsa volta às máximas.","Et la Bourse retrouve des sommets.","Und die Börse erreicht neue Hochs."],
    cEnd:["Hoy.","Today.","Hoje.","Aujourd’hui.","Heute."],
    r1:["Cada una puso {a} en total. Hoy tienen:","Each one put in {a} in total. Today they have:","Cada uma colocou {a} no total. Hoje têm:","Chacune a versé {a} au total. Aujourd’hui elles ont :","Jede hat insgesamt {a} eingezahlt. Heute haben sie:"],
    l1:["Hasta la de peor suerte terminó con {x} veces más que la que esperó.","Even the unluckiest ended with {x} times more than the one who waited.","Até a mais azarada terminou com {x} vezes mais do que a que esperou.","Même la plus malchanceuse a fini avec {x} fois plus que celle qui a attendu.","Selbst die Pechvogel hat {x}-mal so viel wie die Abwartende."],
    l2:["Y la constante, sin adivinar nada, quedó a solo {p} de la que ve el futuro.","And the steady one, guessing nothing, ended just {p} behind the fortune teller.","E a constante, sem adivinhar nada, ficou a só {p} da que vê o futuro.","Et la régulière, sans rien deviner, finit à seulement {p} de la voyante.","Und die Beständige, ohne zu raten, liegt nur {p} hinter der Hellseherin."],
    l3:["Adivinar el momento casi no importa.","Timing the market barely matters.","Acertar o momento quase não importa.","Deviner le bon moment compte peu.","Den richtigen Moment zu treffen, zählt kaum."],
    l4:["Empezar, sí.","Starting does.","Começar, sim.","Commencer, si.","Anfangen schon."],
    foot:["Datos reales del S&P 500 con dividendos, {a}. Lo que pasó antes no garantiza el futuro. No es consejo de inversión.","Real S&P 500 data with dividends, {a}. Past results don’t guarantee the future. Not investment advice.","Dados reais do S&P 500 com dividendos, {a}. O passado não garante o futuro. Não é recomendação de investimento.","Données réelles du S&P 500 avec dividendes, {a}. Le passé ne garantit pas l’avenir. Ce n’est pas un conseil en investissement.","Echte S&P-500-Daten mit Dividenden, {a}. Vergangenes garantiert nichts. Keine Anlageberatung."],
    put:["puesto","put in","colocado","versé","eingezahlt"],
    play:["Reproducir","Play","Reproduzir","Lecture","Abspielen"],pause:["Pausa","Pause","Pausar","Pause","Pause"],
    again:["Ver otra vez","Watch again","Ver de novo","Revoir","Nochmal ansehen"],skip:["Saltar","Skip","Pular","Passer","Überspringen"],close:["Cerrar","Close","Fechar","Fermer","Schließen"],
  };
  const P=[["perfect","∞","#30d158"],["now","1","#ffffff"],["monthly","∑","#bdbdbd"],["worst","∂","#ff3b30"],["cash","0","#6b6b6b"]];
  const LOC=["es-ES","en-US","pt-BR","fr-FR","de-DE"];
  const tx=(k,li,v={})=>TX[k][li].replace(/\{(\w)\}/g,(_,x)=>v[x]??"");
  const usd=(v,li)=>new Intl.NumberFormat(LOC[li],{style:"currency",currency:"USD",maximumFractionDigits:0,useGrouping:"always"}).format(v);
  const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,eo=x=>1-Math.pow(1-x,3);
  const ph=(t,a,b)=>cl((t-a)/(b-a));
  const F={d:'"Inter Tight",system-ui,sans-serif',b:'Inter,system-ui,sans-serif',m:'"IBM Plex Mono",ui-monospace,monospace',x:'"STIX Two Text",Georgia,serif'};
  const SY="∑π∞√∫Δφλ≈±∂θ";
  // Números que nacen de símbolos: cada dígito es un símbolo hasta que "aterriza"
  const scr=(s,k,seed)=>{if(k>=1)return s;let n=0,out="";const ch=[...s],dg=ch.filter(c=>/\d/.test(c)).length||1;
    for(const c of ch){if(/\d/.test(c)){n++;out+=k>=n/dg?c:SY[(Math.floor(k*24)+n*7+seed)%SY.length]}else out+=c}return out};
  function wrap(ctx,text,maxW){const words=text.split(" "),lines=[];let cur="";for(const w of words){const tt=cur?cur+" "+w:w;if(ctx.measureText(tt).width>maxW&&cur){lines.push(cur);cur=w}else cur=tt}if(cur)lines.push(cur);return lines}
  function para(ctx,text,x,y,maxW,lh,align="center"){ctx.textAlign=align;const ls=wrap(ctx,text,maxW);ls.forEach((l,i)=>ctx.fillText(l,x,y+i*lh));return ls.length*lh}
  function fade(ctx,a,fn){if(a<=0)return;ctx.save();ctx.globalAlpha*=a;fn();ctx.restore()}

  // Tiempo de la carrera: va más lento en las crisis (2008 y 2020) para que se alcance a leer qué pasó
  const WARP=new WeakMap();
  function warp(D,x){let c=WARP.get(D);if(!c){const w=D.meses.map(m=>(m>="2008-06"&&m<="2009-06")||(m>="2020-01"&&m<="2020-10")?3.2:m<"2007-01"?1.6:1);let acc=0;c=w.map(v=>acc+=v);c=c.map(v=>v/acc);WARP.set(D,c)}
    let lo=0,hi=c.length-1;while(lo<hi){const md=(lo+hi)>>1;if(c[md]<x)lo=md+1;else hi=md}return lo}
  function draw(ctx,W,H,t,li,D){
    const port=H>W*1.1,u=Math.min(W,H)/100*(port?1:1.12),cx=W/2,mw=Math.min(W*.86,port?W*.86:W*.62);
    ctx.fillStyle="#000";ctx.fillRect(0,0,W,H);ctx.textBaseline="alphabetic";
    const fin=k=>D.p[k].at(-1),A=D.anual,yrs=`${D.desde}–${D.meses.at(-1).slice(0,4)}`;
    // Escena 1 · título (0–8 s)
    fade(ctx,ph(t,0,.8)*(1-ph(t,7.2,8)),()=>{const y=H*(port?.36:.34);
      ctx.fillStyle="#fff";ctx.font=`800 ${u*(port?9:8.4)}px ${F.d}`;ctx.textAlign="center";
      fade(ctx,eo(ph(t,.2,1.2)),()=>ctx.fillText(tx("t1",li),cx,y));
      fade(ctx,eo(ph(t,1,2)),()=>{ctx.fillStyle="#ff3b30";ctx.fillText(tx("t2",li),cx,y+u*(port?11:10))});
      fade(ctx,eo(ph(t,2.4,3.4)),()=>{ctx.fillStyle="#bdbdbd";ctx.font=`500 ${u*(port?4.3:3.4)}px ${F.b}`;para(ctx,tx("t3",li,{a:usd(A,li)}),cx,y+u*(port?24:22),mw,u*(port?6.2:4.9))});
      fade(ctx,eo(ph(t,4.8,5.6)),()=>{ctx.fillStyle="#fff";ctx.font=`600 ${u*(port?4.6:3.6)}px ${F.b}`;ctx.fillText(tx("t4",li),cx,y+u*(port?52:42))})});
    // Escena 2 · las cinco (8–23 s): cada una entra con su símbolo y su forma de invertir
    fade(ctx,ph(t,8,8.6)*(1-ph(t,22.3,23)),()=>{const n=P.length,rowH=port?H*.15:H*.15,top=port?H*.14:H*.13;
      P.forEach(([k,sym,c],i)=>{const a=eo(ph(t,8.4+i*2.6,9.3+i*2.6));if(a<=0)return;const y=top+i*rowH+(1-a)*u*4;
        fade(ctx,a,()=>{const x0=port?W*.08:W*.2,r=u*(port?6:5.2);ctx.strokeStyle=c;ctx.lineWidth=u*.45;ctx.beginPath();ctx.arc(x0+r,y+r,r,0,7);ctx.stroke();
          ctx.fillStyle=c;ctx.font=`italic 600 ${r*1.15}px ${F.x}`;ctx.textAlign="center";ctx.fillText(sym,x0+r,y+r*1.38);
          const tx0=x0+r*2+u*4,tw=(port?W*.92:W*.8)-tx0;ctx.fillStyle="#fff";ctx.font=`700 ${u*(port?4.6:3.8)}px ${F.d}`;ctx.textAlign="left";ctx.fillText(tx("n_"+k,li),tx0,y+r*.62);
          ctx.fillStyle="#9a9a9a";ctx.font=`400 ${u*(port?3.4:2.7)}px ${F.b}`;para(ctx,tx("s_"+k,li),tx0,y+r*.62+u*(port?5.4:4.4),tw,u*(port?4.6:3.6),"left")})})});
    // Escena 3 · la carrera (23–52 s)
    const R0=23,R1=50;
    fade(ctx,ph(t,R0,R0+.6)*(1-ph(t,52,52.8)),()=>{const n=D.meses.length,idx=Math.max(1,warp(D,ph(t,R0+1,R1)));
      const L={l:port?W*.06:W*.07,r:port?W*.74:W*.8,t:port?H*.2:H*.17,b:port?H*.7:H*.8};
      let ymax=1;P.forEach(([k])=>{for(let i=0;i<=idx;i++)ymax=Math.max(ymax,D.p[k][i])});ymax*=1.12;
      const X=i=>L.l+(L.r-L.l)*i/(n-1),Y=v=>L.b-(L.b-L.t)*v/ymax;
      // año grande
      const yr=D.meses[idx].slice(0,4);ctx.fillStyle="#fff";ctx.font=`800 ${u*(port?13:11)}px ${F.d}`;ctx.textAlign="left";ctx.fillText(yr,L.l,port?H*.13:H*.12);
      // rejilla
      ctx.font=`500 ${u*(port?2.6:2)}px ${F.m}`;ctx.textAlign="left";for(let g=0;g<=3;g++){const v=ymax/1.12*g/3,y=Y(v);ctx.strokeStyle="#1f1f1f";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(L.l,y);ctx.lineTo(L.r,y);ctx.stroke();if(g){ctx.fillStyle="#5e5e5e";ctx.textAlign="right";ctx.fillText(usd(v,li),L.r,y-u*.8);ctx.textAlign="left"}}
      // marcas de crisis
      [["2008-10","2008"],["2020-03","2020"]].forEach(([m,l])=>{const i=D.meses.indexOf(m);if(i<0||i>idx)return;const x=X(i);ctx.strokeStyle="#3a3a3a";ctx.setLineDash([u*.6,u*.8]);ctx.beginPath();ctx.moveTo(x,L.t);ctx.lineTo(x,L.b);ctx.stroke();ctx.setLineDash([])});
      // líneas
      const ends=[];P.forEach(([k,sym,c])=>{const s=D.p[k];ctx.strokeStyle=c;ctx.lineWidth=u*(k==="cash"?.5:.6);ctx.lineJoin="round";if(k==="monthly")ctx.setLineDash([u*1.4,u*.9]);
        ctx.beginPath();for(let i=0;i<=idx;i++){const x=X(i),y=Y(s[i]);i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();ctx.setLineDash([]);
        (D.compras[k]||[]).forEach(m=>{const i=D.meses.indexOf(m);if(i<0||i>idx)return;ctx.fillStyle=c;ctx.beginPath();ctx.arc(X(i),Y(s[i]),u*.55,0,7);ctx.fill()});
        ends.push({k,sym,c,y:Y(s[idx]),v:s[idx],x:X(idx)})});
      // etiquetas al final de cada línea sin montarse
      ends.sort((a,b)=>a.y-b.y);const gap=u*(port?5.2:4.2);for(let i=1;i<ends.length;i++)if(ends[i].y-ends[i-1].y<gap)ends[i].y=ends[i-1].y+gap;
      const over=ends.at(-1).y-(L.b+u*2);if(over>0)ends.forEach(e=>e.y-=over);
      ends.forEach(e=>{ctx.fillStyle=e.c;ctx.beginPath();ctx.arc(e.x,Y(e.v),u*.9,0,7);ctx.fill();const lx=e.x+u*2.4;
        ctx.font=`italic 600 ${u*(port?3.8:3)}px ${F.x}`;ctx.textAlign="left";ctx.fillText(e.sym,lx,e.y+u*1.2);ctx.font=`600 ${u*(port?3:2.4)}px ${F.m}`;ctx.fillText(usd(e.v,li),lx+u*(port?4.2:3.4),e.y+u*1.1)});
      // frase según el año
      const m=D.meses[idx],cap=t>R1+.2?"cEnd":m<"2007-06"?"c0":m<"2009-03"?(m>="2008-06"?"c08":"c0"):m<"2012-01"?"c09":m>="2013-01"&&m<"2020-01"?"c13":m>="2020-02"&&m<"2021-06"?"c20":m>="2022-01"&&m<"2023-03"?"c22":m>="2023-09"?"c24":null;
      if(cap){ctx.fillStyle=cap==="c08"||cap==="c20"?"#ff3b30":"#fff";ctx.font=`600 ${u*(port?4.4:3.4)}px ${F.b}`;para(ctx,tx(cap,li),cx,port?H*.8:H*.9,mw,u*(port?6:4.6))}});
    // Escena 4 · resultados (52–62 s)
    fade(ctx,ph(t,52.4,53)*(1-ph(t,61.4,62)),()=>{const put=A*D.anios;ctx.fillStyle="#bdbdbd";ctx.font=`500 ${u*(port?4.2:3.2)}px ${F.b}`;
      const top=port?H*.16:H*.15;para(ctx,tx("r1",li,{a:usd(put,li)}),cx,top,mw,u*(port?5.8:4.4));
      const mx=fin("perfect"),bx=port?W*.08:W*.2,bw=port?W*.84:W*.6,rh=port?H*.12:H*.13;
      [...P].sort((a,b)=>fin(b[0])-fin(a[0])).forEach(([k,sym,c],i)=>{const a=eo(ph(t,53.2+i*.5,54.4+i*.5));if(a<=0)return;const y=top+u*(port?14:10)+i*rh;
        fade(ctx,Math.min(1,a*1.5),()=>{ctx.fillStyle=c;ctx.font=`italic 600 ${u*(port?5:4)}px ${F.x}`;ctx.textAlign="left";ctx.fillText(sym,bx,y+u*(port?4:3.2));
          ctx.fillStyle="#fff";ctx.font=`600 ${u*(port?3.6:2.8)}px ${F.b}`;ctx.fillText(tx("n_"+k,li),bx+u*(port?7:5.5),y+u*(port?3.6:2.9));
          const v=fin(k),w=(bw-u*(port?7:5.5))*v/mx*a;ctx.fillStyle=c;ctx.globalAlpha*=.9;ctx.fillRect(bx+u*(port?7:5.5),y+u*(port?5.6:4.6),w,u*(port?2.2:1.8));ctx.globalAlpha/=.9;
          ctx.font=`600 ${u*(port?4:3.2)}px ${F.m}`;ctx.textAlign="right";ctx.fillStyle="#fff";ctx.fillText(scr(usd(v,li),ph(t,53.6+i*.5,55.4+i*.5),i*3),bx+bw,y+u*(port?3.8:3))})})});
    // Escena 5 · la lección (62–74 s)
    fade(ctx,ph(t,62.3,63)*(1-ph(t,73.4,74)),()=>{const y0=port?H*.22:H*.2,x=(fin("worst")/fin("cash")),p=(1-fin("monthly")/fin("perfect"))*100;
      ctx.font=`600 ${u*(port?4.8:3.8)}px ${F.b}`;let y=y0;
      fade(ctx,eo(ph(t,62.6,63.6)),()=>{ctx.fillStyle="#fff";y+=para(ctx,tx("l1",li,{x:new Intl.NumberFormat(LOC[li],{maximumFractionDigits:1}).format(x)}),cx,y,mw,u*(port?6.6:5.2))+u*4});
      if(t<62.6)y+=u*20;
      fade(ctx,eo(ph(t,65.2,66.2)),()=>{ctx.fillStyle="#bdbdbd";para(ctx,tx("l2",li,{p:new Intl.NumberFormat(LOC[li],{maximumFractionDigits:0}).format(p)+" %"}),cx,y,mw,u*(port?6.6:5.2))});
      const yb=port?H*.62:H*.64;
      let h3=0;ctx.font=`800 ${u*(port?6.4:5.4)}px ${F.d}`;h3=wrap(ctx,tx("l3",li),mw).length*u*(port?8:6.6);
      fade(ctx,eo(ph(t,68,68.8)),()=>{ctx.fillStyle="#fff";para(ctx,tx("l3",li),cx,yb,mw,u*(port?8:6.6))});
      fade(ctx,eo(ph(t,69.4,70.2)),()=>{ctx.fillStyle="#ff3b30";ctx.font=`800 ${u*(port?6.4:5.4)}px ${F.d}`;ctx.textAlign="center";ctx.fillText(tx("l4",li),cx,yb+h3+u*(port?1.5:1))});
      fade(ctx,eo(ph(t,70.6,71.4)),()=>{ctx.fillStyle="#6b6b6b";ctx.font=`400 ${u*(port?2.6:2)}px ${F.b}`;para(ctx,tx("foot",li,{a:yrs}),cx,H*.9,mw,u*(port?3.6:2.8))})});
    // marca de agua π.
    ctx.globalAlpha=1;ctx.fillStyle="#fff";ctx.font=`italic 600 ${u*(port?4.4:3.4)}px ${F.x}`;ctx.textAlign="right";ctx.fillText("π",W-u*(port?6:4.4),port?u*9:u*6.4);ctx.fillStyle="#ff3b30";ctx.beginPath();ctx.arc(W-u*(port?4.8:3.5),port?u*8.6:u*6.1,u*.6,0,7);ctx.fill();
  }

  let DATA=null;const FONTS=['800 20px "Inter Tight"','700 20px "Inter Tight"','400 20px Inter','500 20px Inter','600 20px Inter','500 20px "IBM Plex Mono"','600 20px "IBM Plex Mono"','italic 600 20px "STIX Two Text"'];
  const load=()=>DATA?Promise.resolve(DATA):Promise.all([fetch("data/cinco.json",{cache:"no-cache"}).then(r=>r.json()),...FONTS.map(f=>document.fonts?.load(f,"0123456789 Aa∑∞∂").catch(()=>null))]).then(([d])=>DATA=d);
  const li=()=>Math.max(0,["es","en","pt","fr","de"].indexOf(typeof LANG!=="undefined"?LANG:"es"));
  /* Reproductor: lo pone dentro de `box`. Devuelve {stop}. onEnd se llama al terminar. */
  function mount(box,{onEnd,autoplay=true,at=0}={}){
    const wrap=document.createElement("div");wrap.className="vid";const cv=document.createElement("canvas");cv.setAttribute("role","img");cv.setAttribute("aria-label",TX.t1[li()]+" "+TX.t2[li()]);
    const bar=document.createElement("div");bar.className="vid-bar";const pp=document.createElement("button");pp.type="button";pp.className="vid-pp";
    const prog=document.createElement("div");prog.className="vid-prog";const fill=document.createElement("i");prog.append(fill);bar.append(pp,prog);wrap.append(cv,bar);box.append(wrap);
    let t=0,playing=false,last=0,raf=0,ended=false;const ctx=cv.getContext("2d");
    const size=()=>{const r=wrap.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);cv.width=Math.round(r.width*dpr);cv.height=Math.round(cv.clientHeight*dpr)};
    const paint=()=>{if(!DATA)return;if(!cv.width)size();draw(ctx,cv.width,cv.height,t,li(),DATA);fill.style.width=(t/DUR*100)+"%";
      pp.innerHTML=playing?'<svg viewBox="0 0 24 24"><path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor"/></svg>':'<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>';pp.setAttribute("aria-label",TX[playing?"pause":ended?"again":"play"][li()])};
    const loop=now=>{if(!playing)return;if(!wrap.isConnected){playing=false;ro.disconnect();return}t=Math.min(DUR,t+(now-last)/1000);last=now;paint();if(t>=DUR){playing=false;ended=true;paint();onEnd&&onEnd();return}raf=requestAnimationFrame(loop)};
    const play=()=>{if(ended){t=0;ended=false}playing=true;last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)};
    const pause=()=>{playing=false;cancelAnimationFrame(raf);paint()};
    pp.onclick=()=>playing?pause():play();cv.onclick=()=>playing?pause():play();
    prog.onclick=e=>{const r=prog.getBoundingClientRect();t=cl((e.clientX-r.left)/r.width)*DUR;ended=false;paint()};
    const ro=new ResizeObserver(()=>{size();paint()});ro.observe(wrap);
    const rm=matchMedia("(prefers-reduced-motion: reduce)").matches;
    load().then(()=>{size();if(autoplay&&!rm)play();else{t=at||(rm?52.5:0);paint()}});
    return{stop(){playing=false;cancelAnimationFrame(raf);ro.disconnect()},seek(s){t=s;paint()},wrap}}
  /* Pantalla completa, para verlo desde Aprende o Inicio */
  function open(at){const o=document.createElement("div");o.className="vid-full";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");
    const x=document.createElement("button");x.type="button";x.className="vid-x";x.textContent="✕";x.setAttribute("aria-label",TX.close[li()]);o.append(x);document.body.append(o);
    const p=mount(o,at!=null?{autoplay:false,at}:{onEnd:()=>{try{store.set("vidSeen",true)}catch(e){}}});const close=()=>{p.stop();o.remove();removeEventListener("keydown",k)},k=e=>{if(e.key==="Escape")close();if(e.key===" "){e.preventDefault();p.wrap.querySelector(".vid-pp").click()}};x.onclick=close;addEventListener("keydown",k)}
  /* Miniatura quieta (un cuadro de la carrera) para las tarjetas */
  function thumb(cv,at=47){load().then(()=>{const r=cv.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);cv.width=Math.max(300,r.width*dpr);cv.height=Math.max(160,r.height*dpr);draw(cv.getContext("2d"),cv.width,cv.height,at,li(),DATA)})}
  return{draw,mount,open,load,thumb,DUR,TX}
})();
