"use strict";
/* Proyecto Py — palabras nuevas para el diccionario de la esquina.
   Cada palabra trae cómo reconocerla en pantalla (re) en los 5 idiomas. Las del diccionario de Aprende (LEARN) también se reconocen. */
window.GLOS = [
  {id:"sp500",re:"s&p ?500|\\bvoo\\b",t:["S&P 500","S&P 500","S&P 500","S&P 500","S&P 500"],d:[
    "Una lista de las 500 empresas más grandes de Estados Unidos (Apple, Microsoft, Amazon…). Cuando dicen “el mercado subió”, casi siempre hablan de ella. Puedes comprarla toda de una vez con un fondo como VOO.",
    "A list of the 500 largest US companies (Apple, Microsoft, Amazon…). When people say “the market rose”, they usually mean this. You can buy all of it at once with a fund like VOO.",
    "Uma lista das 500 maiores empresas dos EUA (Apple, Microsoft, Amazon…). Quando dizem “o mercado subiu”, quase sempre falam dela. Dá para comprar tudo de uma vez com um fundo como o VOO.",
    "Une liste des 500 plus grandes entreprises américaines (Apple, Microsoft, Amazon…). Quand on dit « le marché a monté », on parle souvent d’elle. On peut l’acheter d’un coup avec un fonds comme VOO.",
    "Eine Liste der 500 größten US-Firmen (Apple, Microsoft, Amazon …). Wenn es heißt „der Markt stieg“, ist meist sie gemeint. Mit einem Fonds wie VOO kauft man sie auf einmal."]},
  {id:"accion",re:"\\bacci[oó]n(es)?\\b|\\bstocks?\\b|\\bshares?\\b|\\ba[cç][oõ]es\\b|\\ba[cç][aã]o\\b|\\bactions?\\b|\\baktien?\\b",t:["Acción","Stock (share)","Ação","Action","Aktie"],d:[
    "Un pedacito de una empresa. Si compras una acción de Apple, eres dueño de una parte diminuta de Apple: si a la empresa le va bien, tu pedacito vale más.",
    "A tiny piece of a company. If you buy an Apple share, you own a tiny part of Apple: if the company does well, your piece is worth more.",
    "Um pedacinho de uma empresa. Se você compra uma ação da Apple, é dono de uma parte minúscula dela: se a empresa vai bem, seu pedaço vale mais.",
    "Un petit morceau d’entreprise. Avec une action Apple, vous possédez une infime partie d’Apple : si l’entreprise va bien, votre part vaut plus.",
    "Ein kleines Stück einer Firma. Mit einer Apple-Aktie gehört Ihnen ein winziger Teil von Apple: Läuft es gut, ist Ihr Stück mehr wert."]},
  {id:"indice",re:"[ií]ndices?\\b|\\bindex\\b|\\bindices\\b|\\bindizes\\b",t:["Índice","Index","Índice","Indice","Index"],d:[
    "Un número que resume cómo le va a un grupo de empresas. El S&P 500 y el Nasdaq son índices. No se compran directamente: se compran fondos que los copian.",
    "A number that sums up how a group of companies is doing. The S&P 500 and the Nasdaq are indexes. You don’t buy them directly: you buy funds that copy them.",
    "Um número que resume como vai um grupo de empresas. S&P 500 e Nasdaq são índices. Não se compram diretamente: compram-se fundos que os copiam.",
    "Un chiffre qui résume la santé d’un groupe d’entreprises. Le S&P 500 et le Nasdaq sont des indices. On ne les achète pas directement : on achète des fonds qui les copient.",
    "Eine Zahl, die zeigt, wie es einer Gruppe von Firmen geht. S&P 500 und Nasdaq sind Indizes. Man kauft sie nicht direkt, sondern Fonds, die sie nachbilden."]},
  {id:"nasdaq",re:"nasdaq|\\bqqq\\b",t:["Nasdaq","Nasdaq","Nasdaq","Nasdaq","Nasdaq"],d:[
    "Otra lista de empresas de EE. UU., con mucha tecnología. Sube más cuando a la tecnología le va bien y cae más cuando le va mal. QQQ es un fondo que la copia.",
    "Another list of US companies, heavy on tech. It rises more when tech does well and falls more when it doesn’t. QQQ is a fund that copies it.",
    "Outra lista de empresas dos EUA, com muita tecnologia. Sobe mais quando a tecnologia vai bem e cai mais quando vai mal. O QQQ é um fundo que a copia.",
    "Une autre liste d’entreprises américaines, très technologique. Elle monte plus quand la tech va bien, baisse plus sinon. QQQ est un fonds qui la copie.",
    "Eine weitere Liste von US-Firmen mit viel Technologie. Sie steigt stärker, wenn es der Tech gut geht, und fällt stärker, wenn nicht. QQQ bildet sie nach."]},
  {id:"bolsa",re:"\\bbolsa\\b|wall street|stock market|\\bbourse\\b|\\bb[öo]rse\\b",t:["Bolsa (mercado de valores)","Stock market","Bolsa de valores","Bourse","Börse"],d:[
    "El lugar (hoy, una red de computadores) donde se compran y venden acciones. Abre de lunes a viernes en horario de oficina; los fines de semana está cerrada.",
    "The place (today, a computer network) where stocks are bought and sold. It opens Monday to Friday during office hours; it’s closed on weekends.",
    "O lugar (hoje, uma rede de computadores) onde se compram e vendem ações. Abre de segunda a sexta em horário comercial; fecha nos fins de semana.",
    "L’endroit (aujourd’hui, un réseau d’ordinateurs) où l’on achète et vend des actions. Ouverte du lundi au vendredi aux heures de bureau ; fermée le week-end.",
    "Der Ort (heute ein Computernetz), an dem Aktien gekauft und verkauft werden. Geöffnet Montag bis Freitag zu Bürozeiten, am Wochenende geschlossen."]},
  {id:"cartera",re:"\\bcartera\\b|portfolio|\\bcarteira\\b|portefeuille|\\bdepot\\b",t:["Cartera","Portfolio","Carteira","Portefeuille","Depot"],d:[
    "Todo lo que tienes invertido, junto. Py la arma con lo que anotas, aunque esté repartido en varias apps.",
    "Everything you have invested, together. Py builds it from what you log, even if it’s spread across several apps.",
    "Tudo o que você tem investido, junto. O Py monta com o que você anota, mesmo espalhado em vários apps.",
    "Tout ce que vous avez investi, réuni. Py le construit avec ce que vous notez, même réparti sur plusieurs applis.",
    "Alles, was Sie investiert haben, zusammen. Py baut es aus Ihren Einträgen, auch wenn es auf mehrere Apps verteilt ist."]},
  {id:"rent",re:"rentabilidad|rendimiento|\\breturns?\\b|rentabilidade|rendement|rendite",t:["Rentabilidad","Return","Rentabilidade","Rendement","Rendite"],d:[
    "Cuánto ganaste o perdiste, en porcentaje. Si pusiste 100 y hoy vale 110, tu rentabilidad es +10 %.",
    "How much you gained or lost, as a percentage. If you put in 100 and it’s worth 110 now, your return is +10%.",
    "Quanto você ganhou ou perdeu, em porcentagem. Se colocou 100 e hoje vale 110, a rentabilidade é +10%.",
    "Ce que vous avez gagné ou perdu, en pourcentage. Si vous avez mis 100 et que ça vaut 110, le rendement est de +10 %.",
    "Wie viel Sie gewonnen oder verloren haben, in Prozent. Aus 100 werden 110: Ihre Rendite ist +10 %."]},
  {id:"vol",re:"volatil|schwank",t:["Volatilidad","Volatility","Volatilidade","Volatilité","Volatilität"],d:[
    "Qué tanto sube y baja algo. Bitcoin es muy volátil (en un día puede moverse 10 %); un fondo del S&P 500, mucho menos.",
    "How much something swings up and down. Bitcoin is very volatile (10% in a day is possible); an S&P 500 fund, much less.",
    "Quanto algo sobe e desce. O bitcoin é muito volátil (10% num dia é possível); um fundo do S&P 500, bem menos.",
    "À quel point quelque chose monte et descend. Le bitcoin est très volatil (10 % en un jour, c’est possible) ; un fonds S&P 500, beaucoup moins.",
    "Wie stark etwas schwankt. Bitcoin ist sehr volatil (10 % an einem Tag sind möglich), ein S&P-500-Fonds viel weniger."]},
  {id:"infl",re:"inflaci[oó]n|inflation|infla[cç][aã]o",t:["Inflación","Inflation","Inflação","Inflation","Inflation"],d:[
    "Que las cosas suban de precio con el tiempo. Por eso el dinero guardado sin moverse pierde valor: con lo mismo compras menos cada año.",
    "Prices going up over time. That’s why money that just sits loses value: the same amount buys less each year.",
    "Os preços subindo com o tempo. Por isso o dinheiro parado perde valor: com o mesmo valor você compra menos a cada ano.",
    "La hausse des prix avec le temps. C’est pourquoi l’argent qui dort perd de la valeur : la même somme achète moins chaque année.",
    "Dass Preise mit der Zeit steigen. Deshalb verliert ruhendes Geld an Wert: Mit demselben Betrag kauft man jedes Jahr weniger."]},
  {id:"riesgo",re:"\\briesgos?\\b|\\brisks?\\b|\\briscos?\\b|\\brisques?\\b|\\brisiko\\b",t:["Riesgo","Risk","Risco","Risque","Risiko"],d:[
    "La posibilidad de que algo valga menos de lo que pagaste, al menos por un tiempo. Más riesgo suele venir con más posible ganancia, pero no siempre.",
    "The chance that something ends up worth less than you paid, at least for a while. More risk often comes with more possible gain, but not always.",
    "A chance de algo valer menos do que você pagou, pelo menos por um tempo. Mais risco costuma vir com mais ganho possível, mas nem sempre.",
    "La possibilité que quelque chose vaille moins que ce que vous avez payé, au moins un temps. Plus de risque va souvent avec plus de gain possible, pas toujours.",
    "Die Möglichkeit, dass etwas zumindest eine Zeit lang weniger wert ist als bezahlt. Mehr Risiko bringt oft mehr möglichen Gewinn, aber nicht immer."]},
  {id:"cripto",re:"cripto|crypto|bitcoin|\\bbtc\\b|krypto",t:["Cripto (Bitcoin)","Crypto (Bitcoin)","Cripto (Bitcoin)","Crypto (Bitcoin)","Krypto (Bitcoin)"],d:[
    "Dinero digital que no emite ningún banco. Su precio depende solo de cuánto la gente quiera pagar por él, por eso sube y baja muchísimo.",
    "Digital money no bank issues. Its price depends only on what people are willing to pay, so it swings a lot.",
    "Dinheiro digital que nenhum banco emite. O preço depende só de quanto as pessoas querem pagar, por isso sobe e desce muito.",
    "Une monnaie numérique émise par aucune banque. Son prix dépend seulement de ce que les gens veulent payer, d’où de fortes variations.",
    "Digitales Geld, das keine Bank ausgibt. Der Preis hängt nur davon ab, was Leute zahlen wollen, daher schwankt er stark."]},
  {id:"fondo",re:"\\bfondos?\\b|\\bfunds?\\b|\\bfundos?\\b|\\bfonds\\b",t:["Fondo","Fund","Fundo","Fonds","Fonds"],d:[
    "Una bolsa común donde mucha gente pone dinero y alguien (o una regla) lo invierte en muchas cosas a la vez. Comprar un fondo es comprar un pedacito de todo lo que tiene.",
    "A shared pot where many people put money and someone (or a rule) invests it in many things at once. Buying a fund means owning a slice of everything in it.",
    "Um caixa comum onde muita gente põe dinheiro e alguém (ou uma regra) investe em muitas coisas de uma vez. Comprar um fundo é ter um pedaço de tudo que ele tem.",
    "Une cagnotte commune investie (par quelqu’un ou par une règle) dans beaucoup de choses à la fois. Acheter un fonds, c’est posséder un bout de tout ce qu’il contient.",
    "Ein gemeinsamer Topf, den jemand (oder eine Regel) in viele Dinge zugleich anlegt. Wer einen Fonds kauft, besitzt ein Stück von allem darin."]},
  {id:"tasa",re:"tasas? de inter[eé]s|interest rates?|taxas? de juros|taux d.int[ée]r[êe]t|\\bzins(en|satz)?\\b|\\bfed\\b|reserva federal|federal reserve",t:["Tasa de interés (la Fed)","Interest rate (the Fed)","Taxa de juros (o Fed)","Taux d’intérêt (la Fed)","Leitzins (die Fed)"],d:[
    "Lo que cuesta pedir dinero prestado. La Fed (el banco central de EE. UU.) la sube o la baja, y eso mueve a todos los mercados del mundo.",
    "What it costs to borrow money. The Fed (the US central bank) raises or cuts it, and that moves markets worldwide.",
    "Quanto custa pegar dinheiro emprestado. O Fed (banco central dos EUA) sobe ou baixa, e isso mexe com os mercados do mundo todo.",
    "Le coût d’un emprunt. La Fed (banque centrale américaine) le monte ou le baisse, et cela fait bouger tous les marchés du monde.",
    "Was es kostet, Geld zu leihen. Die Fed (US-Notenbank) hebt oder senkt ihn, und das bewegt Märkte weltweit."]},
  {id:"bono",re:"\\bbonos?\\b|\\bbonds?\\b|\\bt[ií]tulos? p[uú]blicos?\\b|\\bobligations?\\b|\\banleihen?\\b",t:["Bono","Bond","Título (bond)","Obligation","Anleihe"],d:[
    "Le prestas dinero a un gobierno o empresa y te lo devuelve con intereses. Suele ser más tranquilo que las acciones, pero gana menos.",
    "You lend money to a government or company and get it back with interest. Usually calmer than stocks, but earns less.",
    "Você empresta dinheiro a um governo ou empresa e recebe de volta com juros. Costuma ser mais tranquilo que ações, mas rende menos.",
    "Vous prêtez à un État ou une entreprise et récupérez la somme avec intérêts. Plus calme que les actions, mais rapporte moins.",
    "Sie leihen einem Staat oder einer Firma Geld und bekommen es mit Zinsen zurück. Meist ruhiger als Aktien, bringt aber weniger."]},
  {id:"bigtech",re:"big ?tech",t:["Big Tech","Big Tech","Big Tech","Big Tech","Big Tech"],d:[
    "Las empresas de tecnología más grandes del mundo: Apple, Microsoft, Google, Amazon, Meta, Nvidia. Pesan tanto que mueven al S&P 500 casi solas.",
    "The world’s largest tech companies: Apple, Microsoft, Google, Amazon, Meta, Nvidia. They weigh so much they nearly move the S&P 500 on their own.",
    "As maiores empresas de tecnologia do mundo: Apple, Microsoft, Google, Amazon, Meta, Nvidia. Pesam tanto que movem o S&P 500 quase sozinhas.",
    "Les plus grandes entreprises tech du monde : Apple, Microsoft, Google, Amazon, Meta, Nvidia. Elles pèsent tant qu’elles font presque bouger le S&P 500 seules.",
    "Die größten Tech-Firmen der Welt: Apple, Microsoft, Google, Amazon, Meta, Nvidia. Sie wiegen so viel, dass sie den S&P 500 fast allein bewegen."]},
  {id:"papel",re:"sin vender|en papel|unrealized|on paper|n[aã]o realizad|latent|nicht realisiert|buchgewinn",t:["Ganancia “en papel”","“Paper” gain","Ganho “no papel”","Gain « latent »","Buchgewinn"],d:[
    "Lo que ganarías o perderías si vendieras hoy. Mientras no vendas, no es real: puede cambiar mañana.",
    "What you’d gain or lose if you sold today. Until you sell it isn’t real: it can change tomorrow.",
    "O que você ganharia ou perderia se vendesse hoje. Enquanto não vende, não é real: pode mudar amanhã.",
    "Ce que vous gagneriez ou perdriez en vendant aujourd’hui. Tant que vous ne vendez pas, ce n’est pas réel : ça peut changer demain.",
    "Was Sie gewinnen oder verlieren würden, wenn Sie heute verkaufen. Solange Sie nicht verkaufen, ist es nicht echt und kann sich ändern."]},
  {id:"dca",re:"cada mes|every month|a month|todo m[eê]s|por m[eê]s|chaque mois|par mois|jeden monat|pro monat|monatlich",t:["Invertir un poco cada mes","Investing a little every month","Investir um pouco todo mês","Investir un peu chaque mois","Jeden Monat ein bisschen"],d:[
    "Poner la misma cantidad cada mes, pase lo que pase. Así compras más barato cuando baja y no tienes que adivinar el mejor momento.",
    "Putting in the same amount every month, no matter what. You buy more when prices drop and don’t have to guess the best moment.",
    "Colocar o mesmo valor todo mês, aconteça o que acontecer. Você compra mais barato quando cai e não precisa adivinhar o melhor momento.",
    "Verser la même somme chaque mois, quoi qu’il arrive. Vous achetez plus quand ça baisse, sans deviner le meilleur moment.",
    "Jeden Monat denselben Betrag anlegen, egal was passiert. Fällt der Kurs, kaufen Sie mehr, ohne den besten Moment raten zu müssen."]},
  {id:"lplazo",re:"largo plazo|long term|long-term|longo prazo|long terme|langfristig",t:["Largo plazo","Long term","Longo prazo","Long terme","Langfristig"],d:[
    "Pensar en años, no en días. En un día cualquier cosa puede bajar; en 10 o 20 años, el mercado completo casi siempre ha terminado más arriba.",
    "Thinking in years, not days. Anything can drop in a day; over 10 or 20 years the whole market has almost always ended higher.",
    "Pensar em anos, não em dias. Num dia qualquer coisa pode cair; em 10 ou 20 anos, o mercado inteiro quase sempre terminou mais alto.",
    "Penser en années, pas en jours. En un jour, tout peut baisser ; sur 10 ou 20 ans, le marché entier a presque toujours fini plus haut.",
    "In Jahren denken, nicht in Tagen. An einem Tag kann alles fallen; über 10 oder 20 Jahre endete der Gesamtmarkt fast immer höher."]},
];
/* Cómo reconocer en pantalla las palabras que ya estaban en el diccionario de Aprende (mismo orden que LEARN) */
window.LEARN_RE = ["\\betfs?\\b|fondo indexado|index fund|fundo de [ií]ndice|fonds indiciel|indexfonds", "dividend", "correcci[oó]n|bajista|bear market|correction|corre[cç][aã]o|baissier|b[äa]renmarkt|korrektur", "\\bvix\\b|[ií]ndice del miedo|fear index|[ií]ndice do medo|indice de la peur|angstindex", "br[oó]ker|corretora|courtier", "precio promedio|average price|pre[cç]o m[eé]dio|prix moyen|durchschnittspreis", "diversific|diversif|streuen", "inter[eé]s compuesto|compound|juros compostos|int[ée]r[êe]ts compos[ée]s|zinseszins", "orden l[ií]mite|limit order|ordem limitada|cours limit|limit-order", "comisi[oó]n|tipo de cambio|exchange rate|\\bfees?\\b|c[aâ]mbio|taux de change|wechselkurs|geb[üu]hren"];

/* Botón de la esquina: guarda las palabras que ya aparecieron en pantalla y las explica cuando las tocas. */
const PyGlos=(()=>{const SHOTQ=/[?&]shot=/.test(location.search);
  const ALLW=[...GLOS.map(g=>({id:g.id,re:new RegExp(g.re,"i"),t:g.t,d:g.d})),...LEARN.map((x,i)=>({id:"L"+i,re:new RegExp(LEARN_RE[i]||"$^","i"),t:x.t,d:x.d}))];
  let seen=store.get("glos",[]),fresh=new Set(),btn,timer;
  const show=()=>{const onWel=!!document.querySelector(".wel,.story");const lv=store.get("nivel","mid");
    btn.hidden=!seen.length||(!onWel&&lv==="pro"&&!store.get("glosOn"));btn.classList.toggle("on-dark",onWel);
    btn.querySelector("b").textContent=seen.length;btn.classList.toggle("has-new",fresh.size>0)};
  function scan(){
    const txt=[...document.querySelectorAll(".wel,.story,.sheet,main")].filter(n=>n.offsetParent!==null||getComputedStyle(n).position==="fixed").map(n=>n.innerText).join("\n");
    let add=false;if(seen.length<ALLW.length)ALLW.forEach(w=>{if(!seen.includes(w.id)&&w.re.test(txt)){seen.push(w.id);fresh.add(w.id);add=true}});
    document.querySelectorAll(".wel .wel-stage,.story .slide").forEach(mark);
    if(add){store.set("glos",seen);btn.classList.remove("pop");void btn.offsetWidth;btn.classList.add("pop")}show()}
  function open(){const onWel=!!document.querySelector(".wel,.story");
    sheet((s,close)=>{s.classList.add("glos-sheet");s.closest?.(".sheet-wrap");
      s.append(el("h2",{},t("glos.title")),el("p",{class:"muted",style:"margin-top:-4px"},t("glos.sub")));
      const list=el("div",{class:"glos-list"});[...seen].reverse().forEach(id=>{const w=ALLW.find(x=>x.id===id);if(!w)return;
        const dd=el("details",{class:"glos-i"+(fresh.has(id)?" new":"")}),sm=el("summary");sm.append(el("b",{},L(w.t)));if(fresh.has(id))sm.append(el("span",{class:"glos-new"},t("glos.new")));
        dd.append(sm,el("p",{},L(w.d)));list.append(dd)});
      s.append(list);
      if(!onWel){const go=el("button",{class:"btn",type:"button",style:"margin-top:14px"},t("glos.all"));go.onclick=()=>{close();location.hash="#learn"};s.append(go)}
      fresh.clear();show()});
    const w=[...document.querySelectorAll(".sheet-wrap")].at(-1);if(w)w.classList.add("over-wel")}
  // En la bienvenida y en las lecciones, las palabras clave quedan subrayadas: al tocarlas se explica al momento.
  const KEY=["sp500","accion","indice","nasdaq","L0","L1","L2","L4","L6","L7","infl","cripto","vol","bigtech","bono","dca"];
  function one(w){sheet((s,close)=>{s.classList.add("glos-sheet");s.append(el("h2",{},L(w.t)),el("p",{style:"font-size:1.05rem;line-height:1.6"},L(w.d)))});const x=[...document.querySelectorAll(".sheet-wrap")].at(-1);if(x)x.classList.add("over-wel")}
  function mark(root){const done=new Set([...root.querySelectorAll(".gw")].map(b=>b.dataset.g));
    const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest("button,a,input,textarea,select,summary,.gw,h1,.wel-greet")?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}),nodes=[];
    while(tw.nextNode())nodes.push(tw.currentNode);
    nodes.forEach(n=>{KEY.forEach(id=>{if(done.has(id)||!n.parentNode)return;const w=ALLW.find(x=>x.id===id),m=w&&n.data.match(w.re);if(!m)return;
      const i=m.index,b=el("button",{type:"button",class:"gw","data-g":id},m[0]);b.onclick=e=>{e.stopPropagation();one(w)};
      const after=n.splitText(i);after.data=after.data.slice(m[0].length);n.parentNode.insertBefore(b,after);done.add(id);n=after})})}
  function init(){btn=el("button",{class:"glos-btn",type:"button",id:"glosBtn","aria-label":t("glos.title")});
    btn.innerHTML='<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M9 8h7M9 11.5h5"/></svg><span class="glos-l"></span><b></b>';
    btn.onclick=open;btn.hidden=true;document.body.append(btn);label();show();
    new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(scan,600)}).observe(document.body,{childList:true,subtree:true,characterData:true});
    setTimeout(scan,SHOTQ?150:800)}
  const label=()=>{if(btn){btn.querySelector(".glos-l").textContent=t("glos.btn");btn.setAttribute("aria-label",t("glos.title"))}};
  return{init,label,scan,reset:()=>{seen=[];fresh.clear();store.del("glos");show()}};
})();
PyGlos.init();
