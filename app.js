(()=>{
"use strict";
const $=s=>document.querySelector(s), esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const store={get(k,d){try{const v=localStorage.getItem("f2w:"+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem("f2w:"+k,JSON.stringify(v))}catch(e){}}};

/* ---------- data model ---------- */
const TYPE_FIX={"sweet potato starch":"o","flour":"o","fish cake":"p"};
const CHINESE=["Sichuan","Cantonese","Shanghainese","Northern Chinese","Hunan","Yunnan"];
const EAST=["Taiwanese",...CHINESE,"Japanese","Korean","Thai","Vietnamese","Singaporean","Malaysian","Indian"];
const STAMP={Taiwanese:"台",Sichuan:"川",Cantonese:"粵",Shanghainese:"滬","Northern Chinese":"京",Hunan:"湘",Yunnan:"滇",Japanese:"和",Korean:"韓",Thai:"泰",Vietnamese:"越",Singaporean:"星",Malaysian:"馬",Indian:"印",Italian:"意",American:"美",French:"法",Mexican:"墨",British:"英",Mediterranean:"希",European:"歐"};
const PALETTE={Taiwanese:["#F4C9A8","#E9895F"],Sichuan:["#F3B0A0","#C8402E"],Cantonese:["#F6E2B3","#D9A441"],Shanghainese:["#E8C2B5","#9C4A3A"],"Northern Chinese":["#EED9B8","#B07B3D"],Hunan:["#F5B7A6","#D2503B"],Yunnan:["#D7E8C4","#7BA05B"],Japanese:["#E6E0F0","#8E7BB8"],Korean:["#F3C4C4","#C9504F"],Thai:["#CDEBD5","#4E9F6A"],Vietnamese:["#D3EBE4","#4A9A86"],Singaporean:["#F2E3C6","#C99A4B"],Malaysian:["#F5D3B3","#D27D3A"],Indian:["#F6D59B","#D98C1F"],Italian:["#D8ECD5","#C14B3A"],American:["#D6E3F2","#3E6FB0"],French:["#E0E4F2","#4D5D9E"],Mexican:["#F4E3A1","#D8582C"],British:["#DCE1E6","#4F6170"],Mediterranean:["#D2E8EE","#2F8AA6"],European:["#E7E3D6","#8A7A52"]};
const MEATY=/dried shrimp|fish sauce|oyster sauce|shacha|pork floss|fish cake|gelatin|pork skin|dried scallop|worcestershire|laksa paste|curry roux|bonito/;
const ANIMAL=/^(eggs|milk|butter|cream|yogurt|honey|mayonnaise|egg noodles|ladyfingers|condensed milk|milk powder|buttermilk|sour cream|pie crust|ghee)$|cheese|mozzarella|parmesan|ricotta|mascarpone|cheddar|feta|gruyere|ice cream/;
const VEGP=/^(eggs|tofu|silken tofu|dried tofu|tofu puffs)$/;
const PASSIVE=/soak|marinat|rest|chill|rise|proof|overnight|steep|refrigerat|freeze|cool|let it|purge|air-dry/i;
const LONGCOOK=/simmer|braise|bake|roast|steam|slow cook|stew|poach|boil|steep|rest|chill|soak|marinat/i;
const isPassive=(text,min)=>PASSIVE.test(text.split(/[,.]/)[0])||min>=60||(min>=20&&LONGCOOK.test(text));
const FAMILY=[[/^chicken|whole chicken/,"chicken"],[/^beef|^ground beef/,"beef"],[/^pork(?! skin)|^ground pork/,"pork"],[/tofu(?! skin)/,"tofu"],[/^(wheat noodles|egg noodles|ramen noodles|shanghai noodles|yi mein noodles)$/,"wheat noodle"],[/^(rice noodles|rice vermicelli|fresh rice noodles)$/,"rice noodle"],[/^(cabbage|napa cabbage)$/,"cabbage"],[/^(mushrooms|shiitake|king oyster mushroom|enoki)$/,"mushroom"],[/^(pasta|macaroni)$/,"pasta"],[/^(onion|shallot)$/,"onion"],[/^(lemon|lime)$/,"citrus"],[/^(cheddar|mozzarella|gruyere)$/,"melting cheese"],[/^(fish fillet|whole fish|salmon)$/,"fish"]];
const famOf=n=>{for(const[re,f]of FAMILY)if(re.test(n))return f;return null};

const RECIPES=RAW.map((a,i)=>{
  const [en,zh,cuisine,tagstr,diff,serv,kcal,ingstr,stepstr]=a;
  const z=ZRAW[i]||["",""];
  const ings=ingstr.split(";").map(x=>{const m=x.match(/^([pvos]):([^=]+)=(.+)$/);const name=m[2].trim();return{t:TYPE_FIX[name]||m[1],name,qty:m[3].trim()}});
  const zsteps=z[1]?z[1].split("|"):[];
  const steps=stepstr.split("|").map((s,k)=>{const j=s.indexOf("=");const text=s.slice(j+1).trim();return{min:+s.slice(0,j),text,zh:zsteps[k]||text,passive:isPassive(text,+s.slice(0,j))}});
  const total=steps.reduce((t,s)=>t+s.min,0), active=steps.filter(s=>!s.passive).reduce((t,s)=>t+s.min,0);
  const tags=new Set(tagstr.split(/\s+/));
  ["quickfix","veg","vegan","lowfat"].forEach(t=>tags.delete(t));
  if(tags.has("pasta"))tags.add("noodle");
  const vegetarian=ings.every(g=>g.t!=="p"||VEGP.test(g.name))&&!ings.some(g=>MEATY.test(g.name));
  const vegan=vegetarian&&!ings.some(g=>ANIMAL.test(g.name)||g.name==="eggs");
  if(vegetarian)tags.add("veg");if(vegan)tags.add("vegan");
  if(total<=30)tags.add("quick");
  if(kcal<=400&&!tags.has("dessert")&&!tags.has("drink"))tags.add("lowcal");
  if(diff===1&&ings.filter(g=>g.t!=="s").length<=5)tags.add("fewing");
  const ph=PHOTOS[i];
  return{id:i,en,zh:z[0]||zh,cuisine,tags,diff,serv,kcal,ings,steps,total,active,east:EAST.includes(cuisine),chinese:CHINESE.includes(cuisine),need:ings.filter(g=>g.t!=="s"),photo:ph?{src:ph[0],by:ph[1],lic:ph[2],page:ph[3]}:null};
});

/* ---------- language ---------- */
const S={lang:store.get("lang",/^zh/i.test(navigator.language||"")?"zh":"en")};
const T=()=>UI[S.lang], zhOn=()=>S.lang==="zh";
const ingName=n=>zhOn()?(ING_ZH[n]||n):n;
const cuiName=c=>zhOn()?(CUISINE_ZH[c]||c):c;
const title=r=>zhOn()?r.zh||r.en:r.en, subtitle=r=>zhOn()?r.en:r.zh;
const stepText=s=>zhOn()?s.zh:s.text;
const catLabel=k=>zhOn()?CAT_ZH[k]:(CATS.find(c=>c[0]===k)||[0,k])[1];
const fmt=m=>{const h=Math.floor(m/60),mm=m%60;if(zhOn())return m<60?m+" 分鐘":h+" 小時"+(mm?" "+mm+" 分":"");return m<60?m+" min":h+" h"+(mm?" "+mm+" m":"")};
const diffHTML=d=>`<span class="diff d${d}" title="${T().diffLabel[d]}"><span aria-hidden="true">${"●".repeat(d)}${"○".repeat(3-d)}</span> ${T().diffLabel[d]}</span>`;

/* ---------- illustration fallback + photo ---------- */
const DISH_EMO=[[/ramen|pho|laksa|noodle soup|vermicelli|beef noodle|danzai|wonton noodle|bridge/i,"🍜"],[/spaghetti|pasta|lasagna|mac and/i,"🍝"],[/noodle|chow fun|pad thai|japchae|mian/i,"🍜"],[/onigiri|zongzi|rice roll|sticky rice|lo mai/i,"🍙"],[/dumpling|jiaozi|potsticker|wonton|xiaolongbao|har gow|siu mai|ba-wan|buns|bao/i,"🥟"],[/pizza/i,"🍕"],[/burger/i,"🍔"],[/taco|burrito|quesadilla|enchilada/i,"🌮"],[/salad|caprese/i,"🥗"],[/curry|masala|butter chicken/i,"🍛"],[/egg tart|quiche|pie\b|pineapple cake/i,"🥧"],[/pancake|egg crepe/i,"🥞"],[/cookie/i,"🍪"],[/cake|cheesecake|banana bread|ma lai/i,"🍰"],[/milk tea/i,"🧋"],[/smoothie|sago/i,"🥤"],[/lemonade/i,"🍋"],[/soy milk/i,"🥛"],[/shaved ice/i,"🍧"],[/ice cream/i,"🍨"],[/mochi|tangyuan|taro balls|sesame balls|sweet potato balls/i,"🍡"],[/pudding|douhua|custard|mousse|tiramisu|crumble|parfait/i,"🍮"],[/congee|soup|stew|chowder|hot pot|chili|bourguignon/i,"🍲"],[/rice|don\b|bibimbap/i,"🍚"],[/chicken/i,"🍗"],[/fish|salmon/i,"🐟"],[/shrimp/i,"🍤"],[/squid/i,"🦑"],[/clam|oyster/i,"🦪"],[/egg/i,"🍳"],[/lamb|beef|steak/i,"🥩"],[/pork|ribs/i,"🍖"],[/tofu/i,"🥢"]];
const ING_EMO=[[/chicken/,"🍗"],[/duck/,"🦆"],[/beef|steak|brisket|chuck/,"🥩"],[/lamb/,"🍖"],[/bacon/,"🥓"],[/pork|ham|sausage/,"🍖"],[/shrimp/,"🦐"],[/salmon|fish/,"🐟"],[/squid/,"🦑"],[/clam|oyster|scallop/,"🦪"],[/egg/,"🥚"],[/tofu|soy/,"🫘"],[/turkey/,"🦃"],[/scallion|leek|celery|basil|cilantro|lemongrass/,"🌿"],[/ginger/,"🫚"],[/garlic/,"🧄"],[/onion|shallot/,"🧅"],[/cabbage|bok choy|spinach|lettuce|water spinach|broccoli|mustard/,"🥬"],[/carrot/,"🥕"],[/sweet potato/,"🍠"],[/potato|taro/,"🥔"],[/tomato/,"🍅"],[/cucumber|zucchini|bitter melon|winter melon/,"🥒"],[/eggplant/,"🍆"],[/pepper|chili/,"🌶️"],[/corn/,"🌽"],[/mushroom|shiitake|enoki|wood ear/,"🍄"],[/bean sprout|green beans|peas/,"🫛"],[/avocado/,"🥑"],[/lemon|lime|orange|pomelo/,"🍋"],[/apple/,"🍎"],[/banana/,"🍌"],[/mango|papaya|pineapple/,"🥭"],[/strawberr/,"🍓"],[/rice(?! wine| paper| flour)/,"🍚"],[/noodle|pasta|macaroni|vermicelli|lasagna/,"🍝"],[/flour|bread|bun|baguette|tortilla|pita|wrapper|panko/,"🍞"],[/milk|cream|yogurt/,"🥛"],[/cheese|mozzarella|parmesan|cheddar|feta|ricotta|gruyere|mascarpone/,"🧀"],[/butter/,"🧈"],[/peanut|walnut|pine nut/,"🥜"],[/chocolate|cocoa/,"🍫"],[/honey/,"🍯"],[/tea|matcha|espresso/,"🍵"],[/coconut/,"🥥"],[/bean|chickpea/,"🫘"],[/salt|sugar/,"🧂"],[/oil|sauce|vinegar|wine/,"🫙"]];
const emoOf=(n,list,fb)=>{for(const[re,e]of list)if(re.test(n))return e;return fb};
function illustration(r){
  const [a,b]=PALETTE[r.cuisine]||["#E3E6E1","#7F8C86"];const main=emoOf(r.en,DISH_EMO,"🥘");
  return `<div class="illus" style="background:linear-gradient(160deg,${a},${b})"><div class="plate"><span>${main}</span></div></div>`;
}
function artHTML(r,big){
  const p=r.photo,alt=esc(title(r));
  const credit=p&&big?`<a class="credit" href="${esc(p.page)}" target="_blank" rel="noopener">📷 ${esc(p.by||"Wikimedia Commons")} · ${esc(p.lic||"")}</a>`:"";
  return `<div class="art${big?" big":""}">${p?`<img src="${esc(p.src)}" alt="${alt}" loading="${big?"eager":"lazy"}" decoding="async" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('div'),{innerHTML:this.dataset.fb}).firstChild)" data-fb="${esc(illustration(r))}">`:illustration(r)}
   <span class="stamp">${STAMP[r.cuisine]||"食"}</span>${credit}</div>`;
}

/* ---------- state ---------- */
Object.assign(S,{q:"",cats:new Set(),cuisines:new Set(),region:"all",maxTime:600,maxKcal:900,diff:0,mode:"any",sort:"match",staples:true,smart:true,
  have:new Set(store.get("have",["eggs","garlic","scallion","ginger","rice","tomato","chicken thigh","bok choy","onion","tofu"])),
  fav:new Set(store.get("fav",[])),shop:store.get("shop",[]),skin:store.get("skin","celadon")});
const CATS=[["healthy","🥗 Healthy"],["lowcal","🔥 Low calorie"],["dessert","🍮 Dessert"],["kids","🧸 Kids meal"],["quick","⏱ 30 min or less"],["veg","🌱 Vegetarian"],["vegan","🌿 Vegan"],["protein","💪 High protein"],["breakfast","🌅 Breakfast"],["soup","🍲 Soup"],["noodle","🍜 Noodles & pasta"],["rice","🍚 Rice"],["dumpling","🥟 Dumplings & buns"],["street","🏮 Night market / street"],["seafood","🦐 Seafood"],["spicy","🌶 Spicy"],["comfort","🛋 Comfort food"],["onepot","🫕 One pot"],["mealprep","📦 Meal prep"],["festive","🧧 Festive"],["snack","🥨 Snacks"],["drink","🧋 Drinks"],["fewing","🧺 5 ingredients or fewer"]];
const CUIS_ORDER=["Taiwanese",...CHINESE,"Japanese","Korean","Thai","Vietnamese","Singaporean","Malaysian","Indian","Italian","American","French","Mexican","Mediterranean","British","European"];
const ALL_ING=(()=>{const m=new Map();RECIPES.forEach(r=>r.ings.forEach(g=>{if(!m.has(g.name))m.set(g.name,{name:g.name,t:g.t,n:0});m.get(g.name).n++}));return[...m.values()]})();

function haveIt(name){if(S.have.has(name))return true;if(S.smart){const f=famOf(name);if(f)for(const h of S.have)if(famOf(h)===f)return true}return false}
function matchOf(r){const req=S.staples?r.need:r.ings;const missing=req.filter(g=>!haveIt(g.name));return{req:req.length,have:req.length-missing.length,missing}}

/* ---------- static text ---------- */
function renderStatic(){
  const t=T();document.documentElement.lang=zhOn()?"zh-Hant-TW":"en";
  document.title=zhOn()?"冰箱到炒鍋 Fridge to Wok":"Fridge to Wok";
  $("#brandName").textContent=zhOn()?"冰箱到炒鍋":"Fridge to Wok";
  $("#tagline").textContent=t.tagline;$("#q").placeholder=t.search;
  $("#savedLbl").textContent=t.saved;$("#shopLbl").textContent=t.shopping;
  $("#h1a").textContent=t.h1a;$("#h1b").textContent=t.h1b;$("#lede").textContent=t.lede;
  $("#lblRecipes").textContent=t.recipes;$("#lblAsian").textContent=t.asian;$("#lblNow").textContent=t.readyNow;
  $("#openFridge").textContent=t.pick;$("#surprise").textContent=t.surprise;
  $("#fridgeLbl").textContent=t.fridge;$("#editFridge").textContent=t.edit;$("#toggleFilters").textContent=t.filters;
  $("#sortLbl").textContent=t.sort;
  $("#sort").innerHTML=[["match",t.sBest],["time",t.sTime],["kcal",t.sKcal],["easy",t.sEasy],["az",t.sAz]].map(([v,l])=>`<option value="${v}" ${S.sort===v?"selected":""}>${l}</option>`).join("");
  $("#credits").textContent=t.credits;
  $("#langBtn").innerHTML=zhOn()?`<b>中文</b> / EN`:`<b>EN</b> / 中文`;
  $("#langBtn").setAttribute("aria-label",zhOn()?"Switch to English":"切換為繁體中文");
}
$("#langBtn").onclick=()=>{S.lang=zhOn()?"en":"zh";store.set("lang",S.lang);renderStatic();applySkin();renderRail();renderAll()};

/* ---------- filters rail ---------- */
function renderRail(){
  const t=T();const counts={};RECIPES.forEach(r=>r.tags.forEach(x=>counts[x]=(counts[x]||0)+1));
  const cc={};RECIPES.forEach(r=>cc[r.cuisine]=(cc[r.cuisine]||0)+1);
  $("#rail").innerHTML=`
  <div class="group"><h4>${t.region}</h4><div class="seg" id="regionSeg">${[["all",t.rAll],["east",t.rEast],["chinese",t.rCn],["west",t.rWest]].map(([k,l])=>`<button type="button" data-region="${k}" aria-pressed="${S.region===k}">${l}</button>`).join("")}</div></div>
  <div class="group"><h4>${t.menu}</h4><div class="chips">${CATS.map(([k])=>`<button type="button" class="chip" data-cat="${k}" aria-pressed="${S.cats.has(k)}">${catLabel(k)} <small>${counts[k]||0}</small></button>`).join("")}</div></div>
  <div class="group"><h4>${t.cuisine}</h4><div class="chips">${CUIS_ORDER.filter(c=>cc[c]).map(c=>`<button type="button" class="chip" data-cui="${c}" aria-pressed="${S.cuisines.has(c)}"><span class="zh">${STAMP[c]}</span> ${cuiName(c)} <small>${cc[c]}</small></button>`).join("")}</div></div>
  <div class="group range"><label for="tRange">${t.totalTime} <span class="num" id="tVal"></span></label><input id="tRange" type="range" min="10" max="600" step="5" value="${S.maxTime}"></div>
  <div class="group range"><label for="kRange">${t.kcalServ} <span class="num" id="kVal"></span></label><input id="kRange" type="range" min="100" max="900" step="25" value="${S.maxKcal}"></div>
  <div class="group"><h4>${t.difficulty}</h4><div class="seg" id="diffSeg">${[[0,t.dAny],[1,"● "+t.d1],[2,"●● "+t.d2],[3,"●●● "+t.d3]].map(([k,l])=>`<button type="button" data-diff="${k}" aria-pressed="${S.diff===k}">${l}</button>`).join("")}</div></div>
  <div class="group"><h4>${t.matching}</h4>
    <label class="check"><input type="checkbox" id="stapleBox" ${S.staples?"checked":""}> ${t.staples}</label>
    <label class="check"><input type="checkbox" id="smartBox" ${S.smart?"checked":""}> ${t.smart}</label></div>
  <button class="clear" id="clearAll" type="button">${t.reset}</button>`;
  const lab=()=>{$("#tVal").textContent=S.maxTime>=600?t.any:"≤ "+fmt(S.maxTime);$("#kVal").textContent=S.maxKcal>=900?t.any:"≤ "+S.maxKcal+" kcal"};lab();
  $("#rail").onclick=e=>{const b=e.target.closest("button");if(!b)return;
    if(b.dataset.cat){S.cats.has(b.dataset.cat)?S.cats.delete(b.dataset.cat):S.cats.add(b.dataset.cat)}
    else if(b.dataset.cui){S.cuisines.has(b.dataset.cui)?S.cuisines.delete(b.dataset.cui):S.cuisines.add(b.dataset.cui)}
    else if(b.dataset.region)S.region=b.dataset.region;
    else if(b.dataset.diff!=null)S.diff=+b.dataset.diff;
    else if(b.id==="clearAll"){S.cats.clear();S.cuisines.clear();S.region="all";S.maxTime=600;S.maxKcal=900;S.diff=0;S.q="";$("#q").value=""}
    else return;renderRail();renderGrid()};
  $("#tRange").oninput=e=>{S.maxTime=+e.target.value;lab();renderGrid()};
  $("#kRange").oninput=e=>{S.maxKcal=+e.target.value;lab();renderGrid()};
  $("#stapleBox").onchange=e=>{S.staples=e.target.checked;renderAll()};
  $("#smartBox").onchange=e=>{S.smart=e.target.checked;renderAll()};
}

/* ---------- grid ---------- */
function filtered(){
  const q=S.q.trim().toLowerCase();
  return RECIPES.filter(r=>{
    if(q&&!(r.en.toLowerCase().includes(q)||r.zh.includes(q)||r.cuisine.toLowerCase().includes(q)||(CUISINE_ZH[r.cuisine]||"").includes(q)||r.ings.some(g=>g.name.includes(q)||(ING_ZH[g.name]||"").includes(q))))return false;
    if(S.region==="east"&&!r.east||S.region==="west"&&r.east||S.region==="chinese"&&!(r.chinese||r.cuisine==="Taiwanese"))return false;
    for(const c of S.cats)if(!r.tags.has(c))return false;
    if(S.cuisines.size&&!S.cuisines.has(r.cuisine))return false;
    if(S.maxTime<600&&r.total>S.maxTime)return false;
    if(S.maxKcal<900&&r.kcal>S.maxKcal)return false;
    if(S.diff&&r.diff!==S.diff)return false;
    if(S.mode!=="any"){const m=matchOf(r);const lim={now:0,one:1,two:2}[S.mode];if(m.missing.length>lim)return false}
    return true});
}
const SHOW_TAGS=["healthy","kids","dessert","spicy","vegan","veg","quick"];
function renderGrid(){
  const t=T();const list=filtered().map(r=>({r,m:matchOf(r)}));
  const sorters={match:(a,b)=>a.m.missing.length-b.m.missing.length||b.m.have/b.m.req-a.m.have/a.m.req||(b.r.east-a.r.east)||a.r.total-b.r.total,time:(a,b)=>a.r.total-b.r.total,kcal:(a,b)=>a.r.kcal-b.r.kcal,easy:(a,b)=>a.r.diff-b.r.diff||a.r.total-b.r.total,az:(a,b)=>title(a.r).localeCompare(title(b.r),zhOn()?"zh-Hant":"en")};
  list.sort(sorters[S.sort]);
  $("#resultN").textContent=t.nRecipes(list.length);
  $("#grid").innerHTML=list.length?list.map(({r,m},i)=>{
    const pct=Math.round(m.have/m.req*100),miss=m.missing.length;
    const tone=miss===0?"ok":miss<=2?"warn":"miss";
    const msg=miss===0?t.canNow:miss<=2?t.missing(m.missing.map(g=>ingName(g.name)).join(zhOn()?"、":", ")):t.haveOf(m.have,m.req);
    return `<div class="cardwrap"><button class="fav" type="button" data-fav="${r.id}" aria-label="${t.save}: ${esc(title(r))}">${S.fav.has(r.id)?"♥":"♡"}</button>
    <button class="card" type="button" data-open="${r.id}" style="animation-delay:${Math.min(i,24)*18}ms">${artHTML(r)}
    <div class="body"><h3>${esc(title(r))}</h3>${subtitle(r)?`<div class="zhn${zhOn()?"":" zh"}">${esc(subtitle(r))}</div>`:""}
    <div class="meta num"><span>⏱ ${fmt(r.total)}</span><span>🔥 ${r.kcal} kcal</span>${diffHTML(r.diff)}</div>
    <div class="tagrow"><span class="tag">${cuiName(r.cuisine)}</span>${[...r.tags].filter(x=>SHOW_TAGS.includes(x)).slice(0,3).map(x=>`<span class="tag">${catLabel(x).replace(/^\S+\s/,"")}</span>`).join("")}</div>
    <div class="match"><div class="bar"><i style="width:${pct}%;background:var(--${tone})"></i></div><small class="st-${tone}">${esc(msg.length>60?msg.slice(0,58)+"…":msg)}</small></div>
    </div></button></div>`}).join(""):`<div class="fridge empty"><h3>${t.noMatch}</h3><p class="empty-hint">${t.noMatchHint}</p></div>`;
}
$("#grid").onclick=e=>{const f=e.target.closest("[data-fav]");if(f){toggleFav(+f.dataset.fav);return}const c=e.target.closest("[data-open]");if(c)openRecipe(+c.dataset.open)};

/* ---------- fridge ---------- */
function renderFridge(){
  const t=T();const items=[...S.have];
  $("#haveN").textContent=t.items(items.length);
  $("#haveList").innerHTML=items.length?items.map(n=>`<span class="chip">${emoOf(n,ING_EMO,"•")} ${esc(ingName(n))}<button type="button" data-rm="${esc(n)}" aria-label="✕ ${esc(ingName(n))}">✕</button></span>`).join(""):`<span class="empty-hint">${t.emptyFridge}</span>`;
  $("#matchSeg").innerHTML=[["any",t.showAll],["now",t.canMake],["one",t.miss1],["two",t.miss2]].map(([k,l])=>`<button type="button" data-mode="${k}" aria-pressed="${S.mode===k}">${l}</button>`).join("");
  $("#sNow").textContent=RECIPES.filter(r=>matchOf(r).missing.length===0).length;
  store.set("have",items);
}
$("#haveList").onclick=e=>{const b=e.target.closest("[data-rm]");if(b){S.have.delete(b.dataset.rm);renderAll()}};
$("#matchSeg").onclick=e=>{const b=e.target.closest("[data-mode]");if(b){S.mode=b.dataset.mode;renderFridge();renderGrid()}};

function openPicker(){
  const t=T();
  const groups=[["p",t.gP],["v",t.gV],["o",t.gO],["s",t.gS]];
  const presets=[[t.p1,["eggs","garlic","ginger","scallion","rice","tofu","bok choy"]],[t.p2,["eggs","butter","milk","flour","onion","potato","cheddar","pasta"]],[t.p3,["eggs","milk","flour","bread","banana","oats","yogurt"]]];
  const draw=()=>{const q=($("#psearch")?.value||"").toLowerCase();
    $("#pbody").innerHTML=groups.map(([k,l])=>{const items=ALL_ING.filter(g=>g.t===k&&(!q||g.name.includes(q)||(ING_ZH[g.name]||"").includes(q))).sort((a,b)=>b.n-a.n||a.name.localeCompare(b.name));if(!items.length)return"";
      return `<div class="pgroup"><h4><span class="dot d-${k}"></span>${l} <small class="tag num">${items.length}</small>${k==="s"&&S.staples?`<small class="empty-hint" style="font-weight:500">${t.assumed}</small>`:""}</h4><div class="chips">${items.map(g=>`<button type="button" class="chip" data-ing="${esc(g.name)}" aria-pressed="${S.have.has(g.name)}">${emoOf(g.name,ING_EMO,"")} ${esc(ingName(g.name))} <small>${g.n}</small></button>`).join("")}</div></div>`}).join("")};
  modal(`<div class="modal-head"><h2 style="font-size:22px">${t.pickerTitle}</h2><button class="x" type="button" data-close aria-label="Close">✕</button></div>
  <div class="picker"><input id="psearch" class="psearch" type="search" placeholder="${t.filterIng}" autocomplete="off">
  <div class="quick"><strong style="font-size:13px;align-self:center">${t.quickAdd}</strong>${presets.map(([l],i)=>`<button type="button" class="chip" data-preset="${i}">${l}</button>`).join("")}<button type="button" class="chip" data-clearhave>${t.clearAll}</button></div>
  <div id="pbody" style="display:grid;gap:18px"></div>
  <div class="actions sticky-actions"><button class="btn primary" type="button" data-close id="pgo"></button></div></div>`,m=>{
    draw();const cnt=()=>{$("#pgo").textContent=t.showN(RECIPES.filter(r=>matchOf(r).missing.length===0).length)};cnt();
    $("#psearch").oninput=draw;
    m.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
      if(b.dataset.ing){const n=b.dataset.ing;S.have.has(n)?S.have.delete(n):S.have.add(n);b.setAttribute("aria-pressed",S.have.has(n))}
      else if(b.dataset.preset){presets[+b.dataset.preset][1].forEach(n=>S.have.add(n));draw()}
      else if(b.hasAttribute("data-clearhave")){S.have.clear();draw()}
      else return;cnt();renderAll()});
    $("#pgo").addEventListener("click",()=>{S.mode="now";renderAll()},{once:true});
  });
}
$("#openFridge").onclick=openPicker;$("#editFridge").onclick=openPicker;

/* ---------- recipe detail ---------- */
const FR={"1/4":.25,"1/3":1/3,"1/2":.5,"2/3":2/3,"3/4":.75};
function scaleQty(q,f){
  const m=q.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)\s*(.*)$/);if(!m)return zhOn()?(UNIT_ZH[q]||q):q;
  let v=m[1].includes("/")?(FR[m[1]]??m[1].split("/").reduce((a,b)=>a/b)):+m[1];v*=f;
  const whole=Math.floor(v),rem=v-whole;let fr="";for(const[k,x]of Object.entries(FR))if(Math.abs(rem-x)<.06)fr=k;
  let s=rem<.06?String(whole):fr?(whole?whole+" ":"")+fr:(Math.round(v*10)/10).toString();if(s==="0")s=zhOn()?"少許":"a pinch";
  const unit=m[2];return s+" "+(zhOn()?(UNIT_ZH[unit]??unit):unit);
}
const TCOL=["var(--accent)","var(--jade)","var(--gold)","#8C6FB0","#3E8FB0","#C26A3D","#6A8F3C","#B0466B"];
function openRecipe(id){
  const r=RECIPES[id];let f=1;const sep=zhOn()?"、":", ";
  const draw=()=>{const t=T();const serv=Math.max(1,Math.round(r.serv*f));const m=matchOf(r);const missing=new Set(m.missing.map(g=>g.name));
    let acc=0;const stepsHTML=r.steps.map((s,i)=>{const start=acc;acc+=s.min;return `<li class="${s.passive?"passive":""}"><div><div>${esc(stepText(s))}</div><div class="when num">${s.passive?t.handsOff:""}${t.startsAt(fmt(start))}</div></div><span class="t num" style="border-left:4px solid ${TCOL[i%8]}">${fmt(s.min)}</span></li>`}).join("");
    const groups=[["p",t.tP],["v",t.tV],["o",t.tO],["s",t.tS]];
    return `<div class="modal-head"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="tag">${cuiName(r.cuisine)}</span>${diffHTML(r.diff)}</div><div class="actions"><button class="pill" type="button" data-favm>${S.fav.has(r.id)?t.savedBtn:t.save}</button><button class="x" type="button" data-close aria-label="Close">✕</button></div></div>
    <div class="detail"><div class="left">${artHTML(r,true)}
      <div><h2>${esc(title(r))}</h2>${subtitle(r)?`<div class="zhbig${zhOn()?"":" zh"}">${esc(subtitle(r))}</div>`:""}</div>
      <div class="kv num"><div><b>${fmt(r.total)}</b><span>${t.total}</span></div><div><b>${fmt(r.active)}</b><span>${t.handsOn}</span></div><div><b>${r.kcal}</b><span>${t.kcalPer}</span></div><div><b>${r.steps.length}</b><span>${t.steps}</span></div></div>
      <div class="tagrow">${[...r.tags].map(x=>`<span class="tag">${catLabel(x)}</span>`).join("")}</div>
      <div class="ingsec"><div class="ing-head"><h3 style="font-size:20px">${t.ingredients}</h3><div class="serv num"><button type="button" data-sv="-1" aria-label="−">−</button><span>${t.servings(serv)}</span><button type="button" data-sv="1" aria-label="+">+</button></div></div>
      <p class="${m.missing.length?"st-warn":"st-ok"}" style="margin:6px 0 0;font-weight:700;font-size:14px">${m.missing.length?esc(t.youMiss(m.missing.length,m.missing.map(g=>ingName(g.name)).join(sep))):t.haveAll}</p>
      ${groups.map(([k,l])=>{const gs=r.ings.filter(g=>g.t===k);if(!gs.length)return"";return `<h4><span class="dot d-${k}"></span>${l}</h4><ul>${gs.map(g=>`<li class="${missing.has(g.name)?"missing":haveIt(g.name)?"haveit":""}"><span class="n">${emoOf(g.name,ING_EMO,"")} ${esc(ingName(g.name))}${zhOn()&&ING_ZH[g.name]?` <small class="en-sub">${esc(g.name)}</small>`:""}</span><span class="q">${esc(scaleQty(g.qty,f))}</span></li>`).join("")}</ul>`}).join("")}
      </div>
      <div class="actions">${m.missing.length?`<button class="btn soft" type="button" data-addshop>${t.addMissing(m.missing.length)}</button>`:""}<button class="btn soft" type="button" data-addall>${t.addAll}</button></div>
    </div>
    <div class="right">
      <div class="steps-head"><h3 style="font-size:22px">${t.stepByStep}</h3><button class="btn primary" type="button" data-cook>${t.cook}</button></div>
      <div><div class="timeline" aria-hidden="true">${r.steps.map((s,i)=>`<i title="${i+1}: ${fmt(s.min)}" style="flex:${Math.max(s.min,2)};background:${s.passive?"repeating-linear-gradient(45deg,var(--line) 0 4px,transparent 4px 8px)":TCOL[i%8]}"></i>`).join("")}</div>
      <div class="tl-legend"><span>${t.active}</span><span>${t.passive}</span></div></div>
      <ol class="steps">${stepsHTML}</ol>
      <p class="empty-hint" style="margin:0">${t.disclaimer}</p>
    </div></div>`};
  modal(draw(),m=>{m.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
    if(b.dataset.sv){const ns=Math.max(1,Math.round(r.serv*f)+ +b.dataset.sv);f=ns/r.serv;m.innerHTML=draw()}
    else if(b.hasAttribute("data-favm")){toggleFav(r.id);m.innerHTML=draw()}
    else if(b.hasAttribute("data-addshop")||b.hasAttribute("data-addall")){const items=(b.hasAttribute("data-addall")?r.ings:matchOf(r).missing).map(g=>({n:g.name,q:g.qty,f,from:r.id,done:false}));
      items.forEach(it=>{if(!S.shop.some(x=>x.n===it.n&&!x.done))S.shop.push(it)});saveShop();toast(T().added(items.length))}
    else if(b.hasAttribute("data-cook"))cookMode(r)})});
}

/* ---------- cook mode ---------- */
function cookMode(r){
  let i=0,left=r.steps[0].min*60,run=false,tick=null,wake=null;
  const el=document.createElement("div");el.className="cook";document.body.appendChild(el);
  try{navigator.wakeLock?.request("screen").then(w=>wake=w).catch(()=>{})}catch(e){}
  const beep=()=>{try{const a=new (window.AudioContext||window.webkitAudioContext)();[0,.25,.5].forEach(x=>{const o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=880;g.gain.setValueAtTime(.2,a.currentTime+x);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+x+.2);o.start(a.currentTime+x);o.stop(a.currentTime+x+.22)})}catch(e){}};
  const mm=s=>String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
  const draw=()=>{const t=T(),s=r.steps[i];el.innerHTML=`<header><div><strong>${esc(title(r))}</strong> <span style="color:var(--accent)">${esc(subtitle(r)||"")}</span></div><div class="progress">${r.steps.map((_,k)=>`<i class="${k<=i?"on":""}"></i>`).join("")}</div><button class="x" type="button" data-exit aria-label="Close">✕</button></header>
  <div class="stage"><div><div class="k">${t.stepOf(i+1,r.steps.length)}${s.passive?t.hoff:""}</div><p>${esc(stepText(s))}</p><div class="clock" id="clock">${mm(left)}</div>
  <div class="actions" style="justify-content:center;margin-top:16px"><button class="btn primary" type="button" data-run>${run?t.pause:t.startTimer}</button><button class="btn soft" type="button" data-reset>${t.resetT}</button><button class="btn soft" type="button" data-plus>${t.plus1}</button></div></div></div>
  <footer><button class="btn soft" type="button" data-prev ${i===0?"disabled":""}>${t.prev}</button><span class="num empty-hint">${t.remaining(r.steps.slice(i+1).reduce((a,x)=>a+x.min,0)?fmt(r.steps.slice(i+1).reduce((a,x)=>a+x.min,0)):t.done)}</span><button class="btn primary" type="button" data-next>${i===r.steps.length-1?t.finish:t.next}</button></footer>`};
  const stop=()=>{clearInterval(tick);tick=null;run=false};
  const go=k=>{stop();i=k;left=r.steps[i].min*60;draw()};
  el.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
    if(b.hasAttribute("data-exit")){stop();try{wake?.release()}catch(e){}el.remove()}
    else if(b.hasAttribute("data-run")){if(run){stop()}else{run=true;tick=setInterval(()=>{left--;const c=$("#clock");if(c)c.textContent=mm(Math.max(0,left));if(left<=0){stop();beep();toast(T().timerDone(i+1));draw()}},1000)}draw()}
    else if(b.hasAttribute("data-reset")){stop();left=r.steps[i].min*60;draw()}
    else if(b.hasAttribute("data-plus")){left+=60;const c=$("#clock");if(c)c.textContent=mm(left)}
    else if(b.hasAttribute("data-prev")&&i>0)go(i-1);
    else if(b.hasAttribute("data-next")){if(i<r.steps.length-1)go(i+1);else{stop();el.remove();toast(T().enjoy(title(r)))}}});
  draw();
}

/* ---------- favorites & shopping ---------- */
function toggleFav(id){S.fav.has(id)?S.fav.delete(id):S.fav.add(id);store.set("fav",[...S.fav]);$("#favCount").textContent=S.fav.size;renderGrid()}
function saveShop(){store.set("shop",S.shop);$("#shopCount").textContent=S.shop.filter(x=>!x.done).length}
const shopQty=x=>typeof x.f==="number"?scaleQty(x.q,x.f):x.q;
const shopFrom=x=>typeof x.from==="number"&&RECIPES[x.from]?title(RECIPES[x.from]):x.from;
$("#openShop").onclick=()=>{const draw=()=>{const t=T();return `<div class="modal-head"><h2 style="font-size:22px">${t.shopTitle}</h2><button class="x" type="button" data-close aria-label="Close">✕</button></div>
  <div class="list">${S.shop.length?`<ul>${S.shop.map((x,i)=>`<li class="${x.done?"done":""}"><label style="display:flex;gap:10px;align-items:center;flex:1;min-width:0"><input type="checkbox" data-i="${i}" ${x.done?"checked":""}><span class="n">${emoOf(x.n,ING_EMO,"")} <strong>${esc(ingName(x.n))}</strong> <span class="empty-hint">${esc(shopQty(x))} · ${t.forR} ${esc(shopFrom(x))}</span></span></label><button class="x" type="button" data-del="${i}" aria-label="✕">✕</button></li>`).join("")}</ul>
  <div class="actions"><button class="btn soft" type="button" data-bought>${t.moveFridge}</button><button class="btn soft" type="button" data-copy>${t.copy}</button><button class="btn soft" type="button" data-empty>${t.clearList}</button></div>`:`<p class="empty-hint">${t.shopEmpty}</p>`}</div>`};
  modal(draw(),m=>{m.addEventListener("change",e=>{const c=e.target.closest("[data-i]");if(c){S.shop[+c.dataset.i].done=c.checked;saveShop();m.innerHTML=draw()}});
    m.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
      if(b.dataset.del){S.shop.splice(+b.dataset.del,1)}
      else if(b.hasAttribute("data-empty"))S.shop=[];
      else if(b.hasAttribute("data-bought")){S.shop.filter(x=>x.done).forEach(x=>S.have.add(x.n));S.shop=S.shop.filter(x=>!x.done);renderAll();toast(T().toFridge)}
      else if(b.hasAttribute("data-copy")){const txt=S.shop.map(x=>`- ${ingName(x.n)} (${shopQty(x)})`).join("\n");(navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>toast(T().copied),()=>toast(T().copyFail));return}
      else return;saveShop();m.innerHTML=draw()})})};
$("#openFav").onclick=()=>{const t=T();const favs=RECIPES.filter(r=>S.fav.has(r.id));
  modal(`<div class="modal-head"><h2 style="font-size:22px">${t.savedTitle}</h2><button class="x" type="button" data-close aria-label="Close">✕</button></div>
  <div class="list">${favs.length?`<ul>${favs.map(r=>`<li><button type="button" class="clear favrow" data-go="${r.id}">${r.photo?`<img src="${esc(r.photo.src)}" alt="" referrerpolicy="no-referrer">`:""}<span><strong>${esc(title(r))}</strong> <span class="empty-hint">${esc(subtitle(r)||"")}</span></span></button><span class="empty-hint num">${fmt(r.total)}</span></li>`).join("")}</ul>`:`<p class="empty-hint">${t.savedEmpty}</p>`}</div>`,m=>m.addEventListener("click",e=>{const b=e.target.closest("[data-go]");if(b){closeModal();openRecipe(+b.dataset.go)}}))};

/* ---------- modal plumbing ---------- */
let lastFocus=null;
function modal(html,init){closeModal();lastFocus=document.activeElement;
  const sc=document.createElement("div");sc.className="scrim";sc.innerHTML=`<div class="modal" role="dialog" aria-modal="true">${html}</div>`;$("#layer").appendChild(sc);
  const m=sc.firstChild;sc.addEventListener("click",e=>{if(e.target===sc||e.target.closest("[data-close]"))closeModal()});init&&init(m);m.querySelector("button")?.focus();document.body.style.overflow="hidden"}
function closeModal(){$("#layer").innerHTML="";document.body.style.overflow="";lastFocus?.focus?.()}
addEventListener("keydown",e=>{if(e.key==="Escape"&&!$(".cook"))closeModal()});
let tt;function toast(x){document.querySelector(".toast")?.remove();const d=document.createElement("div");d.className="toast";d.textContent=x;document.body.appendChild(d);clearTimeout(tt);tt=setTimeout(()=>d.remove(),2200)}

/* ---------- skins + daily hero ---------- */
const SKINS=[["celadon","#2D6B5A"],["night","#C9302C"],["matcha","#5E8C31"],["porcelain","#1F4FA3"]];
function applySkin(){document.documentElement.dataset.skin=S.skin;$("#skins").innerHTML=SKINS.map(([k,c],i)=>`<button type="button" data-skin="${k}" title="${T().themes[i]}" aria-label="${T().themes[i]}" aria-pressed="${S.skin===k}" style="background:${c}"></button>`).join("");store.set("skin",S.skin);drawHero()}
$("#skins").onclick=e=>{const b=e.target.closest("[data-skin]");if(b){S.skin=b.dataset.skin;applySkin()}};
const SCENE_EMO=[["🏮","🍢","🧋","🥟","🍗","🍡"],["🥟","🍵","🥢","🍤","🥮","🫖"],["🍜","🥢","🌶️","🧄","🥚","🌿"],["🥬","🥕","🍅","🧅","🌽","🍆"],["🍵","🍡","🫖","🍘","🌸","🍮"],["🐟","🦐","🦪","🦑","🍋","🌊"],["🍰","🥐","🍪","🥞","🍓","🧁"]];
/* Daily hero photo: one of the dishes, rotating by day of year */
function heroPhoto(){
  const d=new Date(),doy=Math.floor((d-new Date(d.getFullYear(),0,0))/864e5);
  const pool=RECIPES.filter(r=>r.photo&&r.east);const r=pool[(doy*37)%pool.length];
  const img=$("#heroImg");img.src=r.photo.src.replace("/500px-","/960px-");img.alt=title(r);
  img.onerror=()=>{img.onerror=null;img.src=r.photo.src};
  $("#heroCap").innerHTML=`${zhOn()?"今日料理":"Today's dish"}: <button type="button" class="linkish" data-open="${r.id}">${esc(title(r))}</button> · <a href="${esc(r.photo.page)}" target="_blank" rel="noopener">📷 ${esc(r.photo.by||"Wikimedia Commons")}</a>`;
  $("#heroCap").onclick=e=>{const b=e.target.closest("[data-open]");if(b)openRecipe(+b.dataset.open)};
}
let heroRAF;
function drawHero(){
  const c=$("#heroCanvas"),ctx=c.getContext("2d"),day=new Date();
  $("#sceneName").textContent=T().scenes[day.getDay()]+" · "+day.toLocaleDateString(zhOn()?"zh-TW":undefined,{month:"short",day:"numeric"});
  heroPhoto();
  let seed=day.getFullYear()*1000+Math.floor((day-new Date(day.getFullYear(),0,0))/864e5);const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const emo=SCENE_EMO[day.getDay()];
  const parts=Array.from({length:18},()=>({x:rnd(),y:rnd(),s:18+rnd()*22,e:emo[Math.floor(rnd()*emo.length)],sp:.2+rnd()*.5,ph:rnd()*6.28,r:(rnd()-.5)*.6}));
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;cancelAnimationFrame(heroRAF);
  const frame=t=>{const w=c.clientWidth,h=c.clientHeight,dpr=devicePixelRatio||1;if(c.width!==Math.round(w*dpr)){c.width=w*dpr;c.height=h*dpr}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    ctx.globalAlpha=.22;ctx.textAlign="center";ctx.textBaseline="middle";
    for(const p of parts){const y=(p.y*h+(reduce?0:Math.sin(t/1400*p.sp+p.ph)*8));ctx.save();ctx.translate(p.x*w,y);ctx.rotate(p.r+(reduce?0:Math.sin(t/2000+p.ph)*.08));ctx.font=p.s+"px serif";ctx.fillText(p.e,0,0);ctx.restore()}
    ctx.globalAlpha=1;if(!reduce)heroRAF=requestAnimationFrame(frame)};
  heroRAF=requestAnimationFrame(frame);
}
addEventListener("resize",()=>drawHero());

/* ---------- wiring ---------- */
$("#q").oninput=e=>{S.q=e.target.value;renderGrid()};
$("#sort").onchange=e=>{S.sort=e.target.value;renderGrid()};
$("#toggleFilters").onclick=()=>$("#rail").classList.toggle("open");
$("#surprise").onclick=()=>{const pool=filtered();const list=pool.length?pool:RECIPES;const ready=list.filter(r=>matchOf(r).missing.length===0);const src=ready.length?ready:list;openRecipe(src[Math.floor(Math.random()*src.length)].id)};
function renderAll(){renderFridge();renderGrid()}
$("#sTotal").textContent=RECIPES.length;$("#sEast").textContent=RECIPES.filter(r=>r.east).length;
$("#favCount").textContent=S.fav.size;saveShop();
renderStatic();applySkin();renderRail();renderAll();
})();
