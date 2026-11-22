// Render every route without a browser and check its local assets and links.
// This catches template errors; it does not replace responsive visual review.
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { diagramArt, diagramData, heroArt, storyArt } from '../dist/visuals.js';
import { exercises } from '../dist/content/exercises.js';
import { stories } from '../dist/content/stories.js';
import { guideSections } from '../dist/content/guide.js';

const main = { innerHTML:'', focus(){} };
const windowEvents = new Map();
const documentEvents = new Map();
globalThis.scrollY=0;
globalThis.location={hash:'#/'};
globalThis.localStorage={getItem:()=>null,setItem(){}};
globalThis.window={scrollTo(){},addEventListener:(name,handler)=>windowEvents.set(name,handler)};
globalThis.document={title:'',querySelector:selector=>selector==='#main'?main:null,querySelectorAll:()=>[],addEventListener:(name,handler)=>{
 const handlers=documentEvents.get(name)||[]; handlers.push(handler); documentEvents.set(name,handlers);
}};
await import('../dist/app.js');

const routes=['#/','#/guide','#/practice','#/stories','#/progress',
 ...guideSections.map(s=>'#/guide/'+s.id),
 ...exercises.map(s=>'#/practice/'+s.id),
 ...stories.map(s=>'#/stories/'+s.id),
 ...stories.filter(s=>s.extra).map(s=>'#/stories/'+s.id+'/extra')];
const assets=new Set();
const gatherAssets=html=>{
 for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const reference=match[1];
  if (/^(?:https?:|mailto:|#|data:)/.test(reference)) continue;
  assert.ok(reference.startsWith('./'),`Local assets must be project-Pages-relative: ${reference}`);
  assets.add(reference);
 }
};
gatherAssets(await readFile(new URL('../dist/index.html',import.meta.url),'utf8'));
for(const route of routes){
 location.hash=route;
 windowEvents.get('hashchange')();
 assert.match(main.innerHTML,/<h1[ >]/,`${route}: missing heading`);
 assert.doesNotMatch(main.innerHTML,/undefined|\[missing answer\]|content-error/,`${route}: broken template`);
 assert.match(document.title,/SPAN2001/,`${route}: missing course identity`);
 gatherAssets(main.innerHTML);
 for(const link of main.innerHTML.matchAll(/href="(#\/[^"#]*)"/g)){
  assert.ok(routes.includes(link[1]),`${route}: unknown route ${link[1]}`);
 }
}

// Exercise both states through the application's event handler. Route rendering
// alone only sees the initial state, so missing alternative images go unnoticed.
assert.deepEqual(Object.keys(diagramData).sort(),['duration','habits','perspective','scene']);
const generatedGuideAssets=new Set();
for(const [type,data] of Object.entries(diagramData)){
 assert.equal(data.labels.length,2,`${type}: two comparison labels required`);
 assert.equal(data.sentences.length,2,`${type}: two Spanish examples required`);
 assert.equal(data.captions.length,2,`${type}: two explanations required`);
 const fields={'.diagram-art':{innerHTML:''},'.diagram-spanish':{textContent:''},'.diagram-explanation':{textContent:''}};
 const container={dataset:{diagram:type},querySelector:selector=>fields[selector],querySelectorAll:()=>buttons};
 const buttons=[0,1].map(mode=>({dataset:{mode:String(mode)},selected:false,pressed:'',
  classList:{toggle(name,on){buttons[mode].selected=on;}},
  setAttribute(name,value){if(name==='aria-pressed')this.pressed=value;},
  closest(selector){return selector==='[data-diagram]'?container:null;}
 }));
 const rendered=[];
 for(const mode of [1,0]){
  const button=buttons[mode];
  const target={closest:selector=>selector==='[data-mode]'?button:null};
  for(const handler of documentEvents.get('click')||[])handler({target});
  assert.equal(fields['.diagram-art'].innerHTML,diagramArt(type,mode),`${type}/${mode}: diagram did not change`);
  assert.equal(fields['.diagram-spanish'].textContent,data.sentences[mode],`${type}/${mode}: Spanish example did not change`);
  assert.equal(fields['.diagram-explanation'].textContent,data.captions[mode],`${type}/${mode}: explanation did not change`);
  buttons.forEach((item,index)=>{
   assert.equal(item.pressed,String(index===mode),`${type}/${mode}: accessible selected state`);
   assert.equal(item.selected,index===mode,`${type}/${mode}: visible selected state`);
  });
  const art=fields['.diagram-art'].innerHTML;
  rendered.push(art); gatherAssets(art);
  if(type==='habits'){
   assert.match(art,/<svg[ >]/,'Keep the interactive calendar as a vector diagram');
   assert.equal([...art.matchAll(/<circle\b/g)].length,20,'Calendar must retain its twenty day markers');
  }else{
   assert.match(art,/<img\b/ig,`${type}/${mode}: generated illustration required`);
   const images=[...art.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(match=>match[1]);
   assert.ok(images.length>0,`${type}/${mode}: missing image source`);
   images.forEach(image=>generatedGuideAssets.add(image));
  }
 }
 assert.notEqual(rendered[0],rendered[1],`${type}: the two modes must have different visual states`);
}
assert.equal(generatedGuideAssets.size,6,'Three illustrated comparisons need six distinct image states');

const storyImages=new Set();
for(let index=0;index<15;index++){
 const art=storyArt(index); gatherAssets(art);
 const source=art.match(/<img\b[^>]*src="([^"]+)"/)?.[1];
 assert.ok(source,`Story ${index+1}: illustration required`); storyImages.add(source);
}
assert.equal(storyImages.size,15,'Each story needs its own illustration');
gatherAssets(heroArt());
const heroSource=heroArt().match(/<img\b[^>]*src="([^"]+)"/)?.[1];
assert.ok(heroSource&&!storyImages.has(heroSource),'The course cover needs a separate illustration');

const distRoot=fileURLToPath(new URL('../dist/',import.meta.url));
for(const asset of assets){
 const file=path.resolve(distRoot,asset);
 assert.ok(!path.relative(distRoot,file).startsWith('..'),'Assets must stay inside the published directory: '+asset);
 assert.ok((await stat(file)).isFile(),`Missing asset: ${asset}`);
 const extension=path.extname(file).toLowerCase();
 if(['.png','.jpg','.jpeg','.webp'].includes(extension)){
  const bytes=await readFile(file);
  const valid=extension==='.png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):
   extension==='.webp'?bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP':
   bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  assert.ok(valid,`Invalid ${extension} signature: ${asset}`);
 }
}
console.log(`${routes.length} routes rendered; ${assets.size} local assets resolved; all eight diagram states respond, including six generated guide images and the original calendar. Visual browser review is a separate check.`);
