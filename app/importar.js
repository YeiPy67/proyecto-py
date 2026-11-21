"use strict";
/* Proyecto Py — cargar lo que tienes: pantallazos (lectura de texto en el navegador), voz o texto.
   Todo gratis y en el aparato. Más adelante se puede cambiar el analizador por uno con IA (config ia_importar). */

const PyParse=(()=>{
  const ALIAS={VOO:["voo","s&p 500","s&p500","sp500","sp 500","vanguard s&p"],QQQ:["qqq","nasdaq 100","nasdaq-100"],VT:["vanguard total world"],SCHD:["schd","schwab dividend"],GLD:["spdr gold"],
    ANT:["anthropic"],NVDA:["nvidia","nvda"],GOOGL:["alphabet","google","googl","goog"],META:["meta platforms","meta","facebook"],AAPL:["apple","aapl"],MSFT:["microsoft","msft"],AMZN:["amazon","amzn"],
    TSLA:["tesla","tsla"],NFLX:["netflix","nflx"],AMD:["advanced micro devices","amd"],AVGO:["broadcom","avgo"],TSM:["tsmc","taiwan semiconductor"],ASML:["asml"],PLTR:["palantir","pltr"],
    JPM:["jpmorgan","jp morgan","jpm"],V:["visa inc","visa"],KO:["coca-cola","coca cola","cocacola"],MELI:["mercadolibre","mercado libre","meli"],NU:["nubank","nu holdings"],EC:["ecopetrol"],CIB:["bancolombia"],
    "BTC-USD":["bitcoin","btc"],"ETH-USD":["ethereum","ether","eth"],"SOL-USD":["solana"]};
  const UPPER={ANT:"ANT",NU:"NU",EC:"EC",CIB:"CIB",KO:"KO",V:"V",VT:"VT",SOL:"SOL-USD",TSM:"TSM",GLD:"GLD",GOLD:"GLD"};
  const APPS=["hapi","trii","etoro","interactive brokers","ibkr","robinhood","binance","nubank","bancolombia","lulo","revolut","degiro","trade republic","xtb","gbm","bitso","mercado pago","schwab","fidelity","webull","coinbase","kraken","tyba","flink"];
  const NICE={ibkr:"Interactive Brokers",gbm:"GBM",xtb:"XTB",etoro:"eToro"};
  const CONN=/\s(?:y|and|e|et|und|plus)\s|[;\n]|,\s/;
  const UNITS=/^\s*(acciones?|accion|shares?|stocks?|acoes|acao|actions?|aktien?|unidades?|units?|titulos?|participaciones|cuotas?|coins?|monedas?|tokens?|btc|eth|sol)\b/;
  const MONEY_AFTER=/^\s*(usd|us\$|u\$s|dolares?|dollars?|dolar|dollar|euros?|eur|reais|reales)\b/;
  const MONEY_BEFORE=/(\$|usd|us\$|u\$s|€)\s*$/;
  const PRICE_BEFORE=/(\ba|\bat|\bpor|@|precio( promedio)?|price|average|avg|costo|cost|preco( medio)?|prix|preis|kurs|compre a|bought at|cada una a)\s*(de\s*)?\$?\s*$/;
  const HALF=/\b(media|medio|half|meia|meio|demi|demie|halbe?)\s+(accion|acciones|share|acao|action|aktie|unidad|bitcoin|btc)/;
  const ONE=/\b(una|un|one|uma|um|une|eine?)\s+(accion|share|acao|action|aktie|unidad)\b/;
  const strip=s=>s.normalize("NFD").replace(/[̀-ͯ]/g,"");
  const isW=c=>!!c&&/[a-z0-9]/i.test(c);
  /* Números en cualquier formato: 1,234.56 · 1.234,56 · 0,5 · 1.500 (mil quinientos) · 0.512 */
  function num(str){let s=str.replace(/\s/g,"").replace(/[.,]+$/,"");const c=s.lastIndexOf(","),d=s.lastIndexOf(".");
    const thousands=(sep)=>{const p=s.split(sep);return p.length>2||(p[1].length===3&&p[0]!=="0"&&p[0].length<=3)};
    if(c>=0&&d>=0)s=c>d?s.replace(/\./g,"").replace(",","."):s.replace(/,/g,"");
    else if(c>=0)s=thousands(",")?s.replace(/,/g,""):s.replace(",",".");
    else if(d>=0&&thousands("."))s=s.replace(/\./g,"");
    const v=parseFloat(s);return isFinite(v)?v:null}
  function mentions(low,up){const out=[];
    for(const [s,al] of Object.entries(ALIAS))for(const a of al){let i=low.indexOf(a);while(i>=0){if(!isW(low[i-1])&&!isW(low[i+a.length]))out.push({i,end:i+a.length,s,len:a.length});i=low.indexOf(a,i+1)}}
    const re=/\b([A-Z]{1,5})\b/g;let m;while((m=re.exec(up))){const s=UPPER[m[1]];if(s)out.push({i:m.index,end:m.index+m[1].length,s,len:m[1].length})}
    out.sort((a,b)=>a.i-b.i||b.len-a.len);const res=[];for(const x of out){const last=res.at(-1);if(last&&x.i<last.end)continue;if(last&&last.s===x.s&&x.i-last.end<40){last.end=x.end;continue}res.push(x)}
    return res}
  function account(ctx){for(const a of APPS){const i=ctx.indexOf(a);if(i>=0&&!isW(ctx[i-1])&&!isW(ctx[i+a.length]))return NICE[a]||a.replace(/\b\w/g,c=>c.toUpperCase())}return""}
  function numbers(ctx){const out=[],re=/[+-]?\$?\s?\d[\d.,]*/g;let m;
    while((m=re.exec(ctx))){const raw=m[0].replace(/^[+\-$\s]+/,""),v=num(raw);if(v==null)continue;
      const before=ctx.slice(Math.max(0,m.index-24),m.index+(m[0].indexOf("$")>=0?m[0].indexOf("$")+1:0)),after=ctx.slice(m.index+m[0].length,m.index+m[0].length+22);
      if(/^\s*%/.test(after)||/[+\-]$/.test(ctx.slice(m.index-1,m.index))&&/^\s*%?/.test(after)&&/^[+-]/.test(m[0]))continue;
      if(/^\s*(dias?|days?|años?|anos|years?|meses|months?|h\b|min)/.test(after))continue;
      let kind="";if(UNITS.test(after))kind="units";else if(PRICE_BEFORE.test(before))kind="price";else if(MONEY_BEFORE.test(before)||m[0].includes("$")||MONEY_AFTER.test(after))kind="money";
      else kind=(raw.split(/[.,]/)[1]||"").length>2?"units":"money";
      out.push({v,kind})}
    return out}
  function parse(text,mode,priceOf){
    const orig=strip(text),low=orig.toLowerCase(),ms=mentions(low,orig),rows=[];
    ms.forEach((m,k)=>{const prevEnd=k?ms[k-1].end:0,nextI=k<ms.length-1?ms[k+1].i:low.length;
      let before=low.slice(prevEnd,m.i),after=low.slice(m.end,nextI);
      if(mode!=="ocr"){const parts=before.split(CONN);before=parts.at(-1)||"";after=after.split(CONN)[0]||""}
      else before="";
      let q=null,px=null,money=null;
      // "0,5 bitcoin", "3 de Nvidia": un número pegado al nombre son unidades
      const glued=mode!=="ocr"&&before.match(/(\d[\d.,]*)\s*(?:de|of|da|do|von|en|em|d')?\s*$/);
      if(glued){q=num(glued[1]);before=before.slice(0,glued.index)}
      const ctx=before+" § "+after;
      if(q==null&&HALF.test(ctx))q=.5;else if(q==null&&ONE.test(before))q=1;
      numbers(ctx).forEach(n=>{if(n.kind==="units"&&q==null)q=n.v;else if(n.kind==="price"&&px==null)px=n.v;else if(n.kind==="money"&&money==null)money=n.v});
      const cur=priceOf(m.s);let note="";
      if(q==null&&money!=null&&px)q=money/px;
      else if(q==null&&money!=null&&cur){q=money/cur;note="value"}
      rows.push({s:m.s,q:q!=null?+q.toFixed(6):null,px:px!=null?+px.toFixed(4):null,acct:account(before+" "+after),note})});
    // Un mismo activo mencionado dos veces seguidas sin datos se junta
    return rows.filter((r,i)=>!(r.q==null&&rows.some((o,j)=>j!==i&&o.s===r.s&&o.q!=null)))}
  return{parse,num};
})();

/* ---------- Ventana de importar ---------- */
const PyImport=(()=>{
  let rows=[],source="text",rec=null,listening=false;
  const SPEECH_LANG={es:"es-ES",en:"en-US",pt:"pt-BR",fr:"fr-FR",de:"de-DE"};
  const priceOf=s=>D?.precios?.[s]?.precio||null;
  function open(mode){const m=$("impModal");m.hidden=false;show(mode||"menu")}
  function close(){stopVoice();$("impModal").hidden=true}
  function show(mode){source=mode;["menu","photo","voice","text","connect","review"].forEach(k=>$("imp-"+k).hidden=k!==mode);
    if(mode==="voice"){$("impVoiceTxt").value="";$("impMic").innerHTML=ICON.mic+" "+t("imp.listen");$("impNoVoice").hidden=!!(window.SpeechRecognition||window.webkitSpeechRecognition)}
    if(mode==="text")$("impText").focus()}
  // Pantallazos
  async function loadTesseract(){if(window.Tesseract)return;await new Promise((ok,ko)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";s.onload=ok;s.onerror=ko;document.head.append(s)})}
  async function readImages(files){if(!files.length)return;const st=$("impPhotoStatus");st.hidden=false;let all="";
    try{st.textContent=t("imp.reading",{p:0});await loadTesseract();
      for(let i=0;i<files.length;i++){const r=await Tesseract.recognize(files[i],"eng+spa",{logger:m=>{if(m.status==="recognizing text")st.textContent=t("imp.reading",{p:Math.round((i+m.progress)/files.length*100)})}});all+="\n"+r.data.text}
      st.hidden=true;review(all,"ocr",$("impPhotoApp").value)}
    catch(e){st.textContent=t("imp.ocrFail")}}
  // Voz
  function toggleVoice(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){$("impNoVoice").hidden=false;return}
    if(listening){stopVoice();return}
    rec=new SR();rec.lang=SPEECH_LANG[LANG];rec.continuous=true;rec.interimResults=true;let base=$("impVoiceTxt").value;
    rec.onresult=e=>{let fin="",tmp="";for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i];if(r.isFinal)fin+=r[0].transcript+" ";else tmp+=r[0].transcript}
      base+=fin;$("impVoiceTxt").value=(base+tmp).trim()};
    rec.onerror=()=>stopVoice();rec.onend=()=>{if(listening)stopVoice()};
    try{rec.start();listening=true;$("impMic").textContent="⏹ "+t("imp.stop");$("impMic").classList.add("rec")}catch(e){$("impNoVoice").hidden=false}}
  function stopVoice(){listening=false;try{rec&&rec.stop()}catch(e){}const b=$("impMic");if(b){b.innerHTML=ICON.mic+" "+t("imp.listen");b.classList.remove("rec")}}
  // Revisión
  function review(text,mode,app){rows=PyParse.parse(text||"",mode,priceOf);if(app)rows.forEach(r=>{if(!r.acct)r.acct=app});
    $("impRaw").textContent=text.trim();show("review");drawRows()}
  function drawRows(){const box=$("impRows");box.innerHTML="";
    $("impNone").hidden=!!rows.length;
    rows.forEach((r,i)=>{const row=el("div",{class:"imp-row"});
      const sel=el("select",{"aria-label":t("port.what")});ALL.filter(s=>!["^VIX","BZ=F"].includes(s)).forEach(s=>sel.append(el("option",{value:s},`${lab(s)} · ${nm(s)}`)));sel.value=r.s;sel.onchange=()=>r.s=sel.value;
      const q=el("input",{type:"text",inputmode:"decimal",placeholder:"0",autocomplete:"off","aria-label":t("imp.units")});q.value=r.q!=null?String(r.q).replace(".",loc().startsWith("en")?".":","):"";q.oninput=()=>{const v=PyParse.num?PyParse.num(q.value):+q.value.replace(",",".");r.q=q.value===""||!isFinite(v)?null:v;$("impSave").textContent=t("imp.save",{n:rows.filter(r=>r.q>0).length});$("impSave").disabled=!rows.some(r=>r.q>0)};
      const px=el("input",{type:"text",inputmode:"decimal",placeholder:"—",autocomplete:"off","aria-label":t("imp.cost")});px.value=r.px!=null?String(r.px).replace(".",loc().startsWith("en")?".":","):"";px.oninput=()=>{const v=PyParse.num?PyParse.num(px.value):+px.value.replace(",",".");r.px=px.value===""||!isFinite(v)?null:v};
      const ac=el("input",{type:"text",placeholder:t("imp.where"),"aria-label":t("imp.where"),list:"impApps"});ac.value=r.acct||"";ac.oninput=()=>r.acct=ac.value;
      const del=el("button",{class:"ob",type:"button","aria-label":t("mkt.del")},"✕");del.onclick=()=>{rows.splice(i,1);drawRows()};
      const lbls=[["port.what",sel],["imp.units",q],["imp.cost",px],["imp.where",ac]].map(([k,inp])=>{const f=el("label",{class:"field"}),full=t(k),m=full.match(/\s*\(([^)]*)\)\s*$/);if(m&&!inp.value)inp.placeholder=m[1];f.append(el("span",{title:full},m?full.slice(0,m.index):full),inp);return f});
      row.append(...lbls,del);box.append(row)});
    $("impSave").textContent=t("imp.save",{n:rows.filter(r=>r.q>0).length});$("impSave").disabled=!rows.some(r=>r.q>0)}
  function save(){const ok=rows.filter(r=>r.q>0&&D.precios[r.s]);const today=new Date(END).toISOString().slice(0,10);
    ok.forEach(r=>holdings.push({id:Math.random().toString(36).slice(2,9),s:r.s,q:r.q,px:r.px||null,d:today,acct:r.acct||"",fx:fxAt(today)}));
    saveHoldings();toast(t("imp.saved",{n:ok.length}));close();if(VIEW==="portfolio")rPortfolio();else location.hash="#portfolio"}
  function init(){
    document.querySelectorAll("[data-imp]").forEach(b=>b.addEventListener("click",()=>{const k=b.dataset.imp;if($("impModal").hidden)open(k);else show(k)}));
    $("impClose").onclick=close;$("impBack").onclick=()=>show("menu");
    $("impFiles").onchange=e=>readImages([...e.target.files]);
    $("impMic").onclick=toggleVoice;
    $("impVoiceGo").onclick=()=>{stopVoice();review($("impVoiceTxt").value,"voice")};
    $("impTextGo").onclick=()=>review($("impText").value,"text");
    $("impAddRow").onclick=()=>{rows.push({s:"VOO",q:null,px:null,acct:""});drawRows()};
    $("impSave").onclick=save;
    $("impModal").addEventListener("click",e=>{if(e.target.id==="impModal")close()})}
  return{open,close,init,review};
})();
