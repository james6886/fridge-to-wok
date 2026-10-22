/* Fridge to Wok — clock, lunar date, weather, holiday & season picks, decorations */
(()=>{
"use strict";
const start=()=>{
const A=window.F2W, $=s=>document.querySelector(s), esc=A.esc, store=A.store;
const zh=()=>A.zhOn();
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ================= text ================= */
const TX={
 en:{lunar:"Lunar",yearOf:a=>`Year of the ${a}`,feels:"Feels",hiLo:(h,l)=>`H ${h}° · L ${l}°`,locating:"Finding your location…",change:"Change",cityPh:"Type a city…",noLoc:"Location unavailable. Tap Change to pick a city.",picks:"Today's picks",picksSub:"Chosen for your weather, the season and upcoming holidays",close:"Close",openPicks:"Today's picks",inDays:n=>n===0?"today":n===1?"tomorrow":`in ${n} days`,wasYesterday:"was yesterday",next:"Next festival",neon:"What's for dinner?",effects:"Petals & motion",foot:"吃飽沒？ Have you eaten yet?",
  wx:{clear:"Clear",pcloudy:"Partly cloudy",cloudy:"Cloudy",fog:"Foggy",drizzle:"Drizzle",rain:"Rain",snow:"Snow",storm:"Thunderstorm"},
  r:{cold:t=>`It's ${t} and cold out. Warm up with something hot and slow-simmered.`,cool:t=>`${t} and cool: a good night for braises and rice.`,mild:t=>`${t} and pleasant: quick stir-fries and fresh plates.`,hot:t=>`${t} and hot: cool, light dishes that don't heat the kitchen.`,rain:t=>`Rainy (${t}). Comfort bowls of congee and noodle soup.`,snow:t=>`Snow (${t})! Hot pot weather.`},
  season:["Winter tonic season (冬令進補): ginger and sesame oil warm you up.","Winter tonic season: rich, warming soups.","Spring greens are tender and sweet now.","Spring: Qingming spring rolls and fresh greens.","Bamboo shoots come into season.","Mango season is starting in Taiwan.","Peak mango summer: shaved ice and cold plates.","Summer heat: light, cooling dishes.","Autumn begins: Mid-Autumn barbecue season in Taiwan.","Autumn tonic season begins (秋冬進補).","Cold nights ahead: start the winter tonic soups.","Year-end feasts and warming hot pots."]},
 zh:{lunar:"農曆",yearOf:a=>`${a}年`,feels:"體感",hiLo:(h,l)=>`高 ${h}° · 低 ${l}°`,locating:"正在取得你的位置…",change:"更換",cityPh:"輸入城市…",noLoc:"無法取得位置，請點「更換」選擇城市。",picks:"今日推薦",picksSub:"依天氣、季節與節日為你挑選",close:"關閉",openPicks:"今日推薦",inDays:n=>n===0?"就是今天":n===1?"明天":`還有 ${n} 天`,wasYesterday:"昨天",next:"下一個節日",neon:"今晚吃什麼？",effects:"花瓣與動畫",foot:"吃飽沒？ Have you eaten yet?",
  wx:{clear:"晴",pcloudy:"晴時多雲",cloudy:"陰天",fog:"有霧",drizzle:"毛毛雨",rain:"下雨",snow:"下雪",storm:"雷雨"},
  r:{cold:t=>`現在 ${t}，天氣很冷，來點熱騰騰的燉湯暖暖身。`,cool:t=>`${t}，涼涼的，適合滷肉燉菜配白飯。`,mild:t=>`${t}，天氣舒服，來盤快炒或清爽料理。`,hot:t=>`${t}，天氣炎熱，吃點清涼不用久煮的料理。`,rain:t=>`下雨天（${t}），來碗暖心的粥或湯麵。`,snow:t=>`下雪了（${t}）！最適合吃火鍋。`},
  season:["冬令進補：薑母鴨、麻油雞最暖身。","冬令進補：濃郁暖身的湯品。","春天的青菜最鮮甜。","春季：清明潤餅與當令青菜。","竹筍盛產季節。","台灣芒果季開始了。","盛夏芒果季：剉冰和涼拌菜。","夏日炎炎：清爽消暑料理。","入秋了：台灣中秋烤肉季。","秋冬進補開始。","天氣轉涼：開始喝暖身補湯。","年末聚餐與暖呼呼的火鍋。"]}};
const X=()=>TX[zh()?"zh":"en"];

/* ================= lunar calendar ================= */
const ANIMALS_EN=["Rat","Ox","Tiger","Rabbit","Dragon","Snake","Horse","Goat","Monkey","Rooster","Dog","Pig"];
const ANIMALS_ZH=["鼠","牛","虎","兔","龍","蛇","馬","羊","猴","雞","狗","豬"];
const LM=["正","二","三","四","五","六","七","八","九","十","冬","臘"];
const lunarFmt=new Intl.DateTimeFormat("en-u-ca-chinese",{year:"numeric",month:"numeric",day:"numeric"});
function lunar(d){try{const p=lunarFmt.formatToParts(d);const g=t=>p.find(x=>x.type===t)?.value||"";const mRaw=g("month");return{y:+(g("relatedYear")||g("year")),m:parseInt(mRaw,10),leap:/bis|leap/i.test(mRaw),d:+g("day")}}catch(e){return null}}
const lunarDayZh=n=>n<=10?"初"+["","一","二","三","四","五","六","七","八","九","十"][n]:n<20?"十"+["","一","二","三","四","五","六","七","八","九"][n-10]:n===20?"二十":n<30?"廿"+["","一","二","三","四","五","六","七","八","九"][n-20]:"三十";

/* ================= holidays ================= */
const D=(y,m,d)=>new Date(y,m-1,d);
const nthWeekday=(y,m,wd,n)=>{const f=D(y,m,1);let day=1+((wd-f.getDay()+7)%7)+(n-1)*7;return D(y,m,day)};
const lastWeekday=(y,m,wd)=>{const l=new Date(y,m,0);return D(y,m,l.getDate()-((l.getDay()-wd+7)%7))};
function easter(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return D(y,mo,da)}
const HOL=[
 // lunar: [month, day]  (eve = day before 1/1)
 {k:"eve",lunar:"eve",en:"Lunar New Year's Eve",zh:"除夕",dish:["Pork and Cabbage Jiaozi","Steamed Fish with Ginger and Scallion","Turnip Cake","Lion's Head Meatballs","Sichuan Hot Pot"]},
 {k:"lny",lunar:[1,1],en:"Lunar New Year",zh:"春節",dish:["Pork and Cabbage Jiaozi","Turnip Cake","Black Sesame Tangyuan","Sesame Balls","Ma Lai Gao (Steamed Sponge Cake)"]},
 {k:"lantern",lunar:[1,15],en:"Lantern Festival",zh:"元宵節",dish:["Black Sesame Tangyuan","Taro Balls Dessert Soup","Red Bean Soup"]},
 {k:"dragon",lunar:[5,5],en:"Dragon Boat Festival",zh:"端午節",dish:["Southern Taiwanese Zongzi","Lo Mai Gai (Lotus Leaf Sticky Rice)","Taiwanese Oil Rice"]},
 {k:"qixi",lunar:[7,7],en:"Qixi (Chinese Valentine's Day)",zh:"七夕情人節",dish:["Tiramisu","Mango Shaved Ice","Mango Pomelo Sago","Chocolate Mousse"]},
 {k:"ghost",lunar:[7,15],en:"Ghost Festival",zh:"中元節",dish:["Taiwanese Oil Rice","Taiwanese Fried Rice Noodles","Braised Pork Rice","Pineapple Cakes"]},
 {k:"moon",lunar:[8,15],en:"Mid-Autumn Festival",zh:"中秋節",dish:["Xinjiang Cumin Lamb Skewers","Shacha Beef Stir-Fry","Cantonese Char Siu","Pineapple Cakes"]},
 {k:"ninth",lunar:[9,9],en:"Double Ninth Festival",zh:"重陽節",dish:["Steamed Egg Custard","Fish Congee","Chiayi Turkey-Style Chicken Rice"]},
 {k:"laba",lunar:[12,8],en:"Laba Festival",zh:"臘八節",dish:["Red Bean Soup","Sweet Potato Congee","Century Egg and Pork Congee"]},
 // solar Chinese / Taiwanese
 {k:"qingming",solar:y=>D(y,4,4+(y%4===0||y%4===1?0:1)),en:"Qingming Festival",zh:"清明節",dish:["Taiwanese Spring Rolls","Red Bean Soup","Fresh Spring Rolls"]},
 {k:"dongzhi",solar:y=>D(y,12,y%4===0?21:22),en:"Winter Solstice (Dongzhi)",zh:"冬至",dish:["Black Sesame Tangyuan","Ginger Duck Hot Pot","Sesame Oil Chicken Soup","Taro Balls Dessert Soup"]},
 {k:"doubleten",solar:y=>D(y,10,10),en:"Taiwan National Day",zh:"國慶日（雙十節）",dish:["Braised Beef Noodle Soup","Braised Pork Rice","Pineapple Cakes"]},
 // American
 {k:"newyear",solar:y=>D(y,1,1),en:"New Year's Day",zh:"元旦",dish:["Roast Chicken with Vegetables","New York Cheesecake","Full English Breakfast"]},
 {k:"superbowl",solar:y=>nthWeekday(y,2,0,2),en:"Super Bowl Sunday",zh:"超級盃星期天",dish:["Korean Fried Chicken","Classic Cheeseburger","Guacamole","BBQ Pulled Pork"]},
 {k:"valentine",solar:y=>D(y,2,14),en:"Valentine's Day",zh:"西洋情人節",dish:["Chocolate Mousse","Tiramisu","Spaghetti Carbonara","Crêpes"]},
 {k:"stpat",solar:y=>D(y,3,17),en:"St. Patrick's Day",zh:"聖派翠克節",dish:["Shepherd's Pie","Fish and Chips","Mashed Potatoes"]},
 {k:"easter",solar:easter,en:"Easter",zh:"復活節",dish:["Roast Chicken with Vegetables","Quiche Lorraine","Banana Bread"]},
 {k:"mother",solar:y=>nthWeekday(y,5,0,2),en:"Mother's Day",zh:"母親節",dish:["Buttermilk Pancakes","Crêpes","Avocado Toast with Egg","Fruit Yogurt Parfait"]},
 {k:"memorial",solar:y=>lastWeekday(y,5,1),en:"Memorial Day",zh:"美國陣亡將士紀念日",dish:["Classic Cheeseburger","BBQ Pulled Pork","Greek Salad"]},
 {k:"father",solar:y=>nthWeekday(y,6,0,3),en:"Father's Day",zh:"父親節（美國）",dish:["Beef Bourguignon","Classic Cheeseburger","Korean Bulgogi"]},
 {k:"july4",solar:y=>D(y,7,4),en:"Independence Day",zh:"美國獨立紀念日",dish:["Classic Cheeseburger","BBQ Pulled Pork","Southern Fried Chicken","Chocolate Chip Cookies"]},
 {k:"twdad",solar:y=>D(y,8,8),en:"Father's Day (Taiwan)",zh:"父親節（台灣 88節）",dish:["Braised Beef Noodle Soup","Three Cup Chicken","Red-Braised Pork Belly"]},
 {k:"labor",solar:y=>nthWeekday(y,9,1,1),en:"Labor Day",zh:"美國勞動節",dish:["Classic Cheeseburger","Chicken Souvlaki","Xinjiang Cumin Lamb Skewers"]},
 {k:"halloween",solar:y=>D(y,10,31),en:"Halloween",zh:"萬聖節",dish:["Sweet Potato Balls","Taro Balls Dessert Soup","Churros","Mac and Cheese"]},
 {k:"thanks",solar:y=>nthWeekday(y,11,4,4),en:"Thanksgiving",zh:"感恩節",dish:["Roast Chicken with Vegetables","Mashed Potatoes","Apple Crumble","New York Cheesecake"]},
 {k:"xmas",solar:y=>D(y,12,25),en:"Christmas",zh:"聖誕節",dish:["Roast Chicken with Vegetables","Beef Bourguignon","Lasagna","Chocolate Chip Cookies"]},
 {k:"nye",solar:y=>D(y,12,31),en:"New Year's Eve",zh:"跨年夜",dish:["Honey Walnut Shrimp","Simplified Peking Duck","New York Cheesecake"]}
];
const dayKey=d=>d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
function upcomingHolidays(from=new Date(),days=60){
  const base=D(from.getFullYear(),from.getMonth()+1,from.getDate());const out=[];
  for(let i=-1;i<=days;i++){const d=new Date(base);d.setDate(d.getDate()+i);const l=lunar(d);const nx=new Date(d);nx.setDate(nx.getDate()+1);const ln=lunar(nx);
    for(const h of HOL){let hit=false;
      if(h.lunar==="eve")hit=ln&&ln.m===1&&ln.d===1&&!ln.leap;
      else if(h.lunar)hit=l&&!l.leap&&l.m===h.lunar[0]&&l.d===h.lunar[1];
      else hit=dayKey(h.solar(d.getFullYear()))===dayKey(d);
      if(hit&&!out.some(o=>o.h.k===h.k))out.push({h,date:new Date(d),days:i})}}
  return out.sort((a,b)=>a.days-b.days);
}

/* ================= almanac card + clock ================= */
const hero=document.querySelector(".hero-photo");
const alm=document.createElement("aside");alm.className="almanac";alm.setAttribute("aria-label","Today");
alm.innerHTML=`<div class="alm-top"><span id="almYM"></span><span class="alm-rings" aria-hidden="true"><i></i><i></i></span></div>
<div class="alm-body"><div class="alm-day num" id="almDay"></div><div class="alm-wd" id="almWd"></div>
<div class="alm-lunar" id="almLunar"></div><div class="alm-clock num" id="almClock" aria-live="off"></div></div>
<div class="alm-wx" id="almWx"></div><div class="alm-next" id="almNext"></div>`;
const wrapR=document.createElement("div");wrapR.className="hero-right";hero.parentNode.insertBefore(wrapR,hero);wrapR.append(alm,hero);
const sceneEl=$("#sceneName");
function tickClock(){
  const now=new Date(),loc=zh()?"zh-TW":"en-US";
  const time=now.toLocaleTimeString(loc,{hour:"numeric",minute:"2-digit",second:"2-digit"});
  $("#almClock").textContent=time;
  const base=A.T().scenes[now.getDay()]+" · "+now.toLocaleDateString(loc,{weekday:zh()?"short":undefined,month:"short",day:"numeric"});
  sceneEl.innerHTML=`${esc(base)} · <span class="num clock-mini">${esc(time)}</span>`;
}
function renderAlmanac(){
  const now=new Date(),loc=zh()?"zh-TW":"en-US",l=lunar(now);
  $("#almYM").textContent=now.toLocaleDateString(loc,{year:"numeric",month:"long"});
  $("#almDay").textContent=now.getDate();
  $("#almWd").textContent=now.toLocaleDateString(loc,{weekday:"long"});
  if(l){const a=(l.y-4)%12;$("#almLunar").textContent=zh()?`${X().lunar} ${l.leap?"閏":""}${LM[l.m-1]}月${lunarDayZh(l.d)} · ${ANIMALS_ZH[a]}年`:`${X().lunar} ${l.m}/${l.d}${l.leap?" (leap)":""} · ${X().yearOf(ANIMALS_EN[a])}`}
  const nx=upcomingHolidays(now,120).find(o=>o.days>=0);
  $("#almNext").innerHTML=nx?`<span>${X().next}</span><b>${esc(zh()?nx.h.zh:nx.h.en)}</b><em>${X().inDays(nx.days)}</em>`:"";
  tickClock();
}
renderAlmanac();
setInterval(tickClock,1000);
setInterval(()=>{if(new Date().getHours()===0&&new Date().getMinutes()===0)renderAlmanac()},60000);

/* ================= weather ================= */
const W={loc:store.get("loc",null),data:null,unit:store.get("unit",/^en-US/.test(navigator.language)||/^America\//.test(Intl.DateTimeFormat().resolvedOptions().timeZone)?"F":"C")};
const WX_ICON={clear:"sun",pcloudy:"suncloud",cloudy:"cloud",fog:"fog",drizzle:"rain",rain:"rain",snow:"snow",storm:"storm"};
const wxKind=c=>c===0?"clear":c<=2?"pcloudy":c===3?"cloudy":c<=48?"fog":c<=57?"drizzle":c<=67||(c>=80&&c<=82)?"rain":c<=77||c===85||c===86?"snow":"storm";
const toU=c=>W.unit==="F"?Math.round(c*9/5+32):Math.round(c);
function wxIcon(kind,day){
  const sun=`<span class="wi-sun${day?"":" moon"}"></span>`,cloud=`<span class="wi-cloud"></span>`,drops=`<span class="wi-drops"><i></i><i></i><i></i></span>`,flakes=`<span class="wi-flakes"><i>❄</i><i>❄</i><i>❄</i></span>`,bolt=`<span class="wi-bolt">⚡</span>`;
  const m={sun:sun,suncloud:sun+cloud,cloud:cloud,fog:cloud+`<span class="wi-fog"></span>`,rain:cloud+drops,snow:cloud+flakes,storm:cloud+bolt+drops};
  return `<span class="wi" aria-hidden="true">${m[WX_ICON[kind]]}</span>`;
}
function renderWx(msg){
  const el=$("#almWx");const x=X();
  if(!W.data){el.innerHTML=`<div class="wx-msg">${esc(msg||x.locating)}</div><button type="button" class="wx-change" data-wx-change>${x.change}</button>`;return}
  const c=W.data.current,dd=W.data.daily,kind=wxKind(c.weather_code);
  el.innerHTML=`${wxIcon(kind,c.is_day)}<div class="wx-main"><button type="button" class="wx-temp num" data-unit title="°C / °F">${toU(c.temperature_2m)}°${W.unit}</button>
  <div class="wx-desc">${x.wx[kind]} · ${x.feels} ${toU(c.apparent_temperature)}°</div><div class="wx-hl num">${x.hiLo(toU(dd.temperature_2m_max[0]),toU(dd.temperature_2m_min[0]))}</div></div>
  <div class="wx-city">📍 ${esc(W.loc?.name||"")} <button type="button" class="wx-change" data-wx-change>${x.change}</button></div>`;
}
$("#almWx").addEventListener("click",e=>{
  if(e.target.closest("[data-unit]")){W.unit=W.unit==="F"?"C":"F";store.set("unit",W.unit);renderWx();buildRecs();return}
  if(e.target.closest("[data-wx-change]")){const el=$("#almWx");el.innerHTML=`<form class="wx-form"><input id="wxCity" type="search" placeholder="${X().cityPh}" autocomplete="off"><div id="wxRes" class="wx-res"></div></form>`;
    const inp=$("#wxCity");inp.focus();let tm;
    inp.addEventListener("input",()=>{clearTimeout(tm);tm=setTimeout(async()=>{const q=inp.value.trim();if(q.length<2)return;
      try{const j=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=${zh()?"zh":"en"}`).then(r=>r.json());
        $("#wxRes").innerHTML=(j.results||[]).map((r,i)=>`<button type="button" data-pick="${i}">${esc(r.name)}, ${esc(r.admin1||"")} ${esc(r.country_code||"")}</button>`).join("")||"—";
        $("#wxRes").onclick=ev=>{const b=ev.target.closest("[data-pick]");if(!b)return;const r=j.results[+b.dataset.pick];setLoc({lat:r.latitude,lon:r.longitude,name:r.name+(r.admin1?", "+r.admin1:""),manual:true})}}catch(err){}},300)});
    el.querySelector("form").addEventListener("submit",ev=>ev.preventDefault())}
});
async function setLoc(l){W.loc=l;store.set("loc",l);await loadWx()}
async function loadWx(){
  try{const l=W.loc;const j=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${l.lat}&longitude=${l.lon}&current=temperature_2m,apparent_temperature,weather_code,is_day,precipitation&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=1`).then(r=>r.json());
    if(!j.current)throw 0;W.data=j;store.set("wx",{t:Date.now(),j,loc:l});renderWx();buildRecs()}catch(e){renderWx(X().noLoc);buildRecs()}
}
async function reverseName(lat,lon){try{const j=await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`).then(r=>r.json());return [j.city||j.locality,j.principalSubdivisionCode?.split("-")[1]||j.principalSubdivision].filter(Boolean).join(", ")}catch(e){return""}}
async function ipLoc(){try{const j=await fetch("https://ipapi.co/json/").then(r=>r.json());if(j.latitude)return{lat:j.latitude,lon:j.longitude,name:[j.city,j.region_code].filter(Boolean).join(", ")}}catch(e){}return null}
function locate(){
  const cached=store.get("wx",null);
  if(cached&&cached.loc&&W.loc&&cached.loc.lat===W.loc.lat&&Date.now()-cached.t<30*60e3){W.data=cached.j;renderWx();buildRecs();return}
  if(W.loc?.manual){loadWx();return}
  renderWx();
  const fallback=async()=>{const l=await ipLoc();if(l)setLoc(l);else if(W.loc)loadWx();else{renderWx(X().noLoc);buildRecs()}};
  if(!navigator.geolocation){fallback();return}
  navigator.geolocation.getCurrentPosition(async p=>{const lat=+p.coords.latitude.toFixed(3),lon=+p.coords.longitude.toFixed(3);const name=await reverseName(lat,lon);setLoc({lat,lon,name})},fallback,{timeout:9000,maximumAge:30*60e3});
}

/* ================= recommendations ================= */
const SEASON_DISH=[["Ginger Duck Hot Pot","Sesame Oil Chicken Soup","Turnip Cake","Sichuan Hot Pot"],["Ginger Duck Hot Pot","Sesame Oil Chicken Soup","Braised Beef Noodle Soup"],["Garlic Bok Choy","Garlic Water Spinach","Stir-Fried Cabbage","Taiwanese Spring Rolls"],["Taiwanese Spring Rolls","Garlic Water Spinach","Stir-Fried Lotus Root"],["Bamboo Shoot Pork Rib Soup","Southern Taiwanese Zongzi","Garlic Water Spinach"],["Mango Shaved Ice","Mango Sticky Rice","Bamboo Shoot Pork Rib Soup"],["Mango Shaved Ice","Mango Sticky Rice","Douhua (Tofu Pudding)","Smashed Cucumber Salad"],["Winter Melon Soup","Sesame Paste Noodles","Smashed Cucumber Salad","Douhua (Tofu Pudding)"],["Xinjiang Cumin Lamb Skewers","Shacha Beef Stir-Fry","Pineapple Cakes"],["Sesame Oil Chicken Soup","Tea Eggs","Sweet Potato Balls","Three Cup Chicken"],["Ginger Duck Hot Pot","Sesame Oil Chicken Soup","Taiwanese Lu Wei Braise","Braised Beef Noodle Soup"],["Sichuan Hot Pot","Ginger Duck Hot Pot","Black Sesame Tangyuan","Red-Braised Pork Belly"]];
const WX_DISH={
 cold:["Sichuan Hot Pot","Ginger Duck Hot Pot","Sesame Oil Chicken Soup","Braised Beef Noodle Soup","Korean Soft Tofu Stew","French Onion Soup"],
 cool:["Braised Pork Rice","Red-Braised Pork Belly","Japanese Curry Rice","Tomato Beef Brisket Stew","Lion's Head Meatballs","Beef Bourguignon"],
 mild:["Three Cup Chicken","Kung Pao Chicken","Korean Bibimbap","Pad Thai","Chicken Tacos","Shacha Beef Stir-Fry"],
 hot:["Smashed Cucumber Salad","Sesame Paste Noodles","Bang Bang Chicken","Thai Papaya Salad","Fresh Spring Rolls","Mango Shaved Ice"],
 rain:["Century Egg and Pork Congee","Fish Congee","Oyster Vermicelli","Wonton Noodle Soup","Shoyu Ramen","Clam Chowder"],
 snow:["Sichuan Hot Pot","Ginger Duck Hot Pot","Korean Soft Tofu Stew","Chicken Noodle Soup"]};
const pickDishes=names=>names.map(A.byName).filter(Boolean);
function buildRecs(){
  const x=X(),groups=[],now=new Date();
  upcomingHolidays(now,10).filter(o=>o.days>=-1&&o.days<=10).slice(0,2).forEach(o=>{
    const nm=zh()?o.h.zh:o.h.en;const when=o.days===-1?x.wasYesterday:x.inDays(o.days);
    groups.push({icon:"🏮",title:`${nm} · ${when}`,list:pickDishes(o.h.dish)})});
  if(W.data){const c=W.data.current,k=wxKind(c.weather_code),t=c.temperature_2m,tt=toU(t)+"°"+W.unit;
    const cat=k==="snow"?"snow":/rain|drizzle|storm/.test(k)?"rain":t<8?"cold":t<18?"cool":t<28?"mild":"hot";
    groups.push({icon:cat==="hot"?"☀️":cat==="rain"?"🌧":cat==="snow"?"❄️":cat==="cold"?"🥶":"🌤",title:x.r[cat](tt)+(W.loc?.name?` (${W.loc.name})`:""),list:pickDishes(WX_DISH[cat])})}
  groups.push({icon:"🗓",title:x.season[now.getMonth()],list:pickDishes(SEASON_DISH[now.getMonth()])});
  REC=groups;renderRecs();
  const k="recShown";if(store.get(k,"")!==dayKey(now)&&(W.data||recTries++>0)){store.set(k,dayKey(now));setTimeout(()=>openRecs(true),900)}
}
let REC=[],recTries=0;
const pop=document.createElement("section");pop.className="recpop";pop.hidden=true;pop.setAttribute("aria-label","Today's picks");document.body.appendChild(pop);
const fab=document.createElement("button");fab.type="button";fab.className="rec-fab";fab.innerHTML=`<span class="fab-lantern" aria-hidden="true"></span><span class="fab-txt"></span>`;document.body.appendChild(fab);
function renderRecs(){
  const x=X();fab.querySelector(".fab-txt").textContent=x.openPicks;fab.setAttribute("aria-label",x.openPicks);
  pop.innerHTML=`<div class="rec-head"><div><h3><span class="rec-seal">薦</span> ${x.picks}</h3><p>${x.picksSub}</p></div><button type="button" class="x" data-rclose aria-label="${x.close}">✕</button></div>
  <div class="rec-body">${REC.map(g=>`<div class="rec-group"><div class="rec-title"><span>${g.icon}</span> ${esc(g.title)}</div><div class="rec-row">${g.list.slice(0,4).map(r=>`<button type="button" class="rec-dish" data-ropen="${r.id}">${r.photo?`<img src="${esc(r.photo.src)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:`<span class="rec-ph">${r.cuisine[0]}</span>`}<span>${esc(A.title(r))}</span></button>`).join("")}</div></div>`).join("")}</div>`;
}
function openRecs(auto){pop.hidden=false;pop.classList.remove("closing");void pop.offsetWidth;pop.classList.add("open");if(!auto)pop.querySelector("button")?.focus()}
function closeRecs(){pop.classList.add("closing");setTimeout(()=>{pop.hidden=true;pop.classList.remove("open","closing")},reduce?0:260)}
fab.onclick=()=>pop.hidden?openRecs():closeRecs();
pop.addEventListener("click",e=>{if(e.target.closest("[data-rclose]"))closeRecs();const b=e.target.closest("[data-ropen]");if(b){closeRecs();A.openRecipe(+b.dataset.ropen)}});
addEventListener("keydown",e=>{if(e.key==="Escape"&&!pop.hidden&&!document.querySelector(".scrim"))closeRecs()});

/* ================= decorations ================= */
// hanging lanterns across the hero
const lan=document.createElement("div");lan.className="lanterns";lan.setAttribute("aria-hidden","true");
lan.innerHTML=["福","食","樂","飽","喜"].map((c,i)=>`<div class="lantern l${i}" style="--d:${i*.35}s"><span class="cord"></span><span class="body"><b>${c}</b></span><span class="tassel"></span></div>`).join("");
document.querySelector(".hero").appendChild(lan);
// fret (回紋) bands
const band=cls=>{const d=document.createElement("div");d.className="fret "+cls;d.setAttribute("aria-hidden","true");return d};
document.querySelector(".hero").after(band("fret-hero"));
document.querySelector(".site-foot").before(band("fret-foot"));
// waves in the footer
const waves=document.createElement("div");waves.className="waves";waves.setAttribute("aria-hidden","true");document.querySelector(".site-foot").prepend(waves);
// neon night-market sign by the results count
const neon=document.createElement("span");neon.className="neon";$("#resultN").after(neon);
// steam on cards
document.getElementById("grid").addEventListener("mouseover",e=>{const a=e.target.closest(".card .art");if(a&&!a.querySelector(".steam")){const s=document.createElement("span");s.className="steam";s.setAttribute("aria-hidden","true");s.innerHTML="<i></i><i></i><i></i>";a.appendChild(s)}});
// petals toggle
const fx=document.createElement("button");fx.type="button";fx.className="fx-toggle";fx.textContent="✿";document.querySelector(".topbtns").prepend(fx);
let fxOn=store.get("fx",!reduce);
const setFx=()=>{fx.setAttribute("aria-pressed",fxOn);fx.title=X().effects;fx.setAttribute("aria-label",X().effects);document.documentElement.classList.toggle("fx-off",!fxOn);if(fxOn)petals.start();else petals.stop()};
fx.onclick=()=>{fxOn=!fxOn;store.set("fx",fxOn);setFx()};
// plum blossom (梅花) petals
const petals=(()=>{const c=document.createElement("canvas");c.className="petals";c.setAttribute("aria-hidden","true");document.body.appendChild(c);const ctx=c.getContext("2d");let raf=0,P=[];
  const mk=()=>({x:Math.random(),y:-Math.random()*0.4,s:6+Math.random()*7,vy:.15+Math.random()*.35,vx:-.15+Math.random()*.3,rot:Math.random()*6,vr:(Math.random()-.5)*.03,sw:Math.random()*6,flower:Math.random()<.35,hue:Math.random()<.5?"#F4A7B9":"#FBD3DC"});
  const draw=(p,w,h)=>{ctx.save();ctx.translate(p.x*w,p.y*h);ctx.rotate(p.rot);ctx.fillStyle=p.hue;ctx.globalAlpha=.75;
    if(p.flower){for(let k=0;k<5;k++){ctx.rotate(Math.PI*2/5);ctx.beginPath();ctx.ellipse(0,-p.s*.55,p.s*.42,p.s*.55,0,0,Math.PI*2);ctx.fill()}ctx.fillStyle="#E0A526";ctx.beginPath();ctx.arc(0,0,p.s*.22,0,7);ctx.fill()}
    else{ctx.beginPath();ctx.ellipse(0,0,p.s*.45,p.s*.7,0,0,Math.PI*2);ctx.fill()}ctx.restore()};
  const frame=()=>{const w=innerWidth,h=innerHeight,dpr=devicePixelRatio||1;if(c.width!==Math.round(w*dpr)){c.width=w*dpr;c.height=h*dpr}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    for(const p of P){p.y+=p.vy/h*3;p.sw+=.02;p.x+=(p.vx+Math.sin(p.sw)*.4)/w*2;p.rot+=p.vr;if(p.y>1.05||p.x<-.05||p.x>1.05)Object.assign(p,mk(),{y:-.05});draw(p,w,h)}
    raf=requestAnimationFrame(frame)};
  return{start(){if(raf)return;const n=innerWidth<600?10:18;P=Array.from({length:n},()=>{const p=mk();p.y=Math.random();return p});raf=requestAnimationFrame(frame);c.hidden=false},stop(){cancelAnimationFrame(raf);raf=0;ctx.clearRect(0,0,c.width,c.height);c.hidden=true}}})();
// firecracker confetti when a cook-mode session finishes
const burst=()=>{if(reduce||!fxOn)return;const c=document.createElement("canvas");c.className="burst";document.body.appendChild(c);const ctx=c.getContext("2d");const w=c.width=innerWidth,h=c.height=innerHeight;
  const P=Array.from({length:90},()=>({x:w/2,y:h*.55,vx:(Math.random()-.5)*14,vy:-Math.random()*14-4,r:4+Math.random()*6,c:["#D7261E","#F2C14E","#E0574B","#FFE08A"][Math.floor(Math.random()*4)],a:1,rot:Math.random()*6}));
  let t=0;const f=()=>{ctx.clearRect(0,0,w,h);P.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.45;p.a-=.012;p.rot+=.2;ctx.save();ctx.globalAlpha=Math.max(0,p.a);ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.c;ctx.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);ctx.restore()});if(++t<110)requestAnimationFrame(f);else c.remove()};f()};
document.addEventListener("click",e=>{const b=e.target.closest(".cook [data-next]");if(b&&/🎉/.test(b.textContent))setTimeout(burst,30)},true);
// cook mode: steaming bowl above the timer
new MutationObserver(()=>{const st=document.querySelector(".cook .stage > div");if(st&&!st.querySelector(".bowl")){const b=document.createElement("div");b.className="bowl";b.setAttribute("aria-hidden","true");b.innerHTML='<span class="steam big"><i></i><i></i><i></i></span><span class="bowl-body"></span><span class="chop"></span>';st.prepend(b)}}).observe(document.body,{childList:true,subtree:true});

/* ================= language refresh ================= */
function relabel(){neon.textContent=X().neon;$(".site-foot .wrap").dataset.foot=X().foot;renderAlmanac();renderWx(W.data?undefined:undefined);buildRecsSilently();setFx()}
function buildRecsSilently(){const s=store.get("recShown","");store.set("recShown",dayKey(new Date()));buildRecs();store.set("recShown",s||dayKey(new Date()))}
document.addEventListener("f2w:lang",relabel);
neon.textContent=X().neon;$(".site-foot .wrap").dataset.foot=X().foot;
setFx();locate();
setTimeout(()=>{if(!REC.length){recTries=1;buildRecs()}},6000);
};
if(window.F2W)start();else document.addEventListener("f2w:ready",start,{once:true});
})();
