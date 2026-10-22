// Usage: node scripts/validate.js   (run from the repo root; exits 1 on any problem)
const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..');
const RAW=[],ZRAW=[],PQ={},W_IDX=[];
global.R=(...a)=>RAW.push(a);global.Z=(...a)=>ZRAW.push(a);
global.W=(en,zh,c,t,d,s,k,i,st,zs,pq)=>{W_IDX.push(RAW.length);RAW.push([en,zh,c,t,d,s,k,i,st]);ZRAW.push(["",zs]);if(pq)PQ[RAW.length-1]=pq};
const load=f=>new Function('R','Z','W','ZING',fs.readFileSync(path.join(root,'data',f),'utf8').replace(/^const (\w+)=/gm,'globalThis.$1='))(R,Z,W,m=>Object.assign(globalThis.ING_ZH,m));
['d1_taiwanese.js','d2_chinese.js','d3_asian.js','d4_western.js','z1_taiwanese.js','z2_chinese.js','z3_asian.js','z4_western.js','i18n.js','weekly.js'].forEach(load);
const CUIS=Object.keys(globalThis.CUISINE_ZH);
const TAGS=new Set(["healthy","dessert","kids","protein","breakfast","soup","noodle","pasta","rice","dumpling","street","seafood","spicy","comfort","onepot","mealprep","festive","snack","quickfix","veg","vegan","lowfat","drink"]);
const errs=[];const names=new Set();
RAW.forEach((r,i)=>{const [en,zh,c,tags,diff,serv,kcal,ings,steps]=r;const tag=`#${i} ${en}`;
  if(names.has(en.toLowerCase()))errs.push(tag+': duplicate English name');names.add(en.toLowerCase());
  if(!CUIS.includes(c))errs.push(tag+': unknown cuisine '+c);
  if(![1,2,3].includes(diff))errs.push(tag+': difficulty must be 1-3');
  if(!(serv>0)||!(kcal>0))errs.push(tag+': servings/kcal must be numbers');
  tags.split(/\s+/).forEach(t=>{if(!TAGS.has(t))errs.push(tag+': unknown tag '+t)});
  const isNew=W_IDX.includes(i);
  if(isNew&&/\bdrink\b/.test(tags))errs.push(tag+': no beverage recipes');
  ings.split(';').forEach(x=>{const m=x.match(/^([pvos]):([^=]+)=(.+)$/);if(!m){errs.push(tag+': bad ingredient "'+x+'"');return}
    if(isNew&&!globalThis.ING_ZH[m[2].trim()])errs.push(tag+': no Chinese name for ingredient "'+m[2].trim()+'" (add it with ZING)')});
  const st=steps.split('|');st.forEach(s=>{if(!/^\d+=\S/.test(s))errs.push(tag+': bad step "'+s.slice(0,40)+'"')});
  const z=ZRAW[i];if(!z)errs.push(tag+': missing Chinese translation');else if(z[1].split('|').length!==st.length)errs.push(tag+`: ${st.length} English steps but ${z[1].split('|').length} Chinese steps`);
  if(isNew&&!zh)errs.push(tag+': missing Chinese dish name');
});
if(ZRAW.length!==RAW.length)errs.push(`recipes ${RAW.length} vs translations ${ZRAW.length}`);
console.log(`${RAW.length} recipes total, ${W_IDX.length} from weekly.js`);
if(errs.length){console.log(errs.join('\n'));process.exit(1)}else console.log('OK');
