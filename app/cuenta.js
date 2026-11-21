"use strict";
/* Proyecto Py — cuentas y sincronización con Supabase (plan gratis).
   Se activa solo si app/config.js tiene supabaseUrl y supabaseKey (la clave "anon", que es pública).
   Guarda todo lo del usuario (las claves py.* del navegador) en una fila de la tabla "datos". */
const PyCuenta=(()=>{
  const CFG=window.PY_CONFIG||{};const ready=!!(CFG.supabaseUrl&&CFG.supabaseKey);
  let sb=null,user=null,pushT=null,lastSync=store.get("lastSync",null),applying=false;
  const AVATARS=["🦊","🐼","🐯","🦉","🐙","🚀","🌱","💎"];
  const dump=()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith("py.")&&k!=="py.lastSync")o[k]=localStorage.getItem(k)}return o};
  async function load(){if(window.supabase)return;await new Promise((ok,ko)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";s.onload=ok;s.onerror=ko;document.head.append(s)})}
  async function init(){if(!ready)return;try{await load();sb=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseKey);
      const {data}=await sb.auth.getSession();user=data.session?.user||null;if(user)await pull();
      sb.auth.onAuthStateChange(async(ev,session)=>{const was=user;user=session?.user||null;if(user&&!was)await pull();if(VIEW==="settings")draw()});}
    catch(e){console.warn("cuenta",e)}}
  async function pull(){const {data,error}=await sb.from("datos").select("datos,actualizado").eq("user_id",user.id).maybeSingle();if(error)throw error;
    if(data&&(!lastSync||data.actualizado>lastSync)&&Object.keys(data.datos||{}).length){applying=true;Object.entries(data.datos).forEach(([k,v])=>localStorage.setItem(k,v));
      lastSync=data.actualizado;store.set("lastSync",lastSync);location.reload();return}
    await push()}
  async function push(){if(!sb||!user||applying)return;const now=new Date().toISOString();
    const {error}=await sb.from("datos").upsert({user_id:user.id,datos:dump(),actualizado:now});if(!error){lastSync=now;store.set("lastSync",now);if(VIEW==="settings")draw()}}
  function changed(){if(!user||applying)return;clearTimeout(pushT);pushT=setTimeout(push,2500)}
  function draw(){const c=$("acctCard");if(!c)return;c.innerHTML="";
    const hd=el("div",{class:"sh"});hd.append(el("span",{class:"lbl"},t("set.account")));if(!ready)hd.append(el("span",{class:"pill-soon"},t("set.soon")));c.append(hd);
    c.append(el("p",{class:"small muted"},t("acc.why")));
    // Perfil (funciona con o sin cuenta)
    const prof=store.get("profile",{name:"",avatar:"🦊"}),row=el("div",{class:"row"}),nameIn=el("input",{type:"text",placeholder:t("acc.name"),"aria-label":t("acc.name"),maxlength:"30",style:"flex:1;min-width:140px"});nameIn.value=prof.name||"";
    nameIn.onchange=()=>{prof.name=nameIn.value.trim();store.set("profile",prof);changed()};
    const av=el("div",{class:"avatars"});AVATARS.forEach(a=>{const b=el("button",{type:"button",class:"av","aria-pressed":String(a===prof.avatar)},a);b.onclick=()=>{prof.avatar=a;store.set("profile",prof);changed();draw()};av.append(b)});
    row.append(nameIn);c.append(row,av);
    if(!ready){c.append(el("p",{class:"note"},t("acc.notReady")));return}
    if(!user){const em=el("input",{type:"email",placeholder:t("acc.email"),"aria-label":t("acc.email"),autocomplete:"email"}),send=el("button",{class:"btn pri",type:"button"},t("acc.send")),msg=el("p",{class:"small muted"});
      send.onclick=async()=>{if(!em.value.includes("@"))return;send.disabled=true;const {error}=await sb.auth.signInWithOtp({email:em.value.trim(),options:{emailRedirectTo:location.origin+location.pathname}});
        msg.textContent=error?t("acc.err",{m:error.message}):t("acc.sent");send.disabled=false};
      const g=el("button",{class:"btn",type:"button"},"G  "+t("acc.google"));g.onclick=()=>sb.auth.signInWithOAuth({provider:"google",options:{redirectTo:location.origin+location.pathname}});
      const f=el("div",{class:"stack"});f.append(em,send);if(CFG.googleLogin)f.append(el("div",{class:"note center"},t("acc.or")),g);f.append(msg);c.append(f);return}
    const who=el("div",{class:"row"});who.append(el("span",{class:"big-av"},prof.avatar||"🦊"),el("span",{class:"small"},t("acc.signedAs",{e:user.email||""})));
    const st=el("p",{class:"note"},lastSync?t("acc.synced",{t:new Date(lastSync).toLocaleString(loc(),{day:"numeric",month:"short",hour:"numeric",minute:"2-digit"})}):"");
    const r2=el("div",{class:"row"}),sy=el("button",{class:"btn",type:"button"},"⟳ "+t("acc.sync")),out=el("button",{class:"btn danger",type:"button"},t("acc.out"));
    sy.onclick=push;out.onclick=async()=>{await sb.auth.signOut();user=null;draw()};r2.append(sy,out);c.append(who,st,r2)}
  return{init,draw,changed,ready:()=>ready,user:()=>user};
})();
