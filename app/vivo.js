"use strict";
/* Proyecto Py — precios en vivo, gratis.
   Cripto: canal público de Coinbase (sin clave). Acciones: Finnhub si config.js trae finnhubKey (clave gratis).
   Sin eso, los precios vienen de la última actualización (cada 30 minutos). */
const PyVivo=(()=>{
  const CRYPTO={"BTC-USD":"BTC-USD","ETH-USD":"ETH-USD","SOL-USD":"SOL-USD"};
  let dirty=false,timer=null;
  const touch=(s,px,chgPct)=>{const p=D.precios[s];if(!p||!(px>0))return;p.precio=px;if(chgPct!=null&&isFinite(chgPct))p.cambio=+chgPct.toFixed(2);p.live=true;
    const sr=p.serie;if(sr?.length)sr[sr.length-1][1]=px;dirty=true};
  function refresh(){if(!dirty)return;dirty=false;const a=document.activeElement;
    if(document.querySelector(".sheet-wrap")||!$("impModal").hidden||(a&&/INPUT|SELECT|TEXTAREA/.test(a.tagName)))return void(dirty=true);
    if(["home","market","portfolio"].includes(VIEW)){window.LIVE_TICK=true;try{render()}finally{window.LIVE_TICK=false}}}
  function crypto(){try{const ws=new WebSocket("wss://ws-feed.exchange.coinbase.com");
      ws.onopen=()=>ws.send(JSON.stringify({type:"subscribe",product_ids:Object.values(CRYPTO),channels:["ticker"]}));
      ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.type!=="ticker")return;const px=+m.price,open=+m.open_24h;touch(m.product_id,px,open?(px-open)/open*100:null)};
      ws.onclose=()=>setTimeout(crypto,15000)}catch(e){}}
  function stocks(key){const syms=[...new Set([...mySyms(),...psyms()])].filter(s=>!CRYPTO[s]&&!/[=^]/.test(s));if(!syms.length)return;
    const prev={};syms.forEach(s=>{const p=D.precios[s];prev[s]=p.precio/(1+p.cambio/100)});
    try{const ws=new WebSocket("wss://ws.finnhub.io?token="+encodeURIComponent(key));
      ws.onopen=()=>syms.slice(0,50).forEach(s=>ws.send(JSON.stringify({type:"subscribe",symbol:s})));
      ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.type!=="trade")return;m.data.forEach(d=>touch(d.s,d.p,(d.p-prev[d.s])/prev[d.s]*100))};
      ws.onclose=()=>setTimeout(()=>stocks(key),30000)}catch(e){}}
  function init(){if(!("WebSocket" in window))return;crypto();const k=(window.PY_CONFIG||{}).finnhubKey;if(k)stocks(k);timer=setInterval(refresh,3000)}
  return{init};
})();
