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
import { activityGaps } from '../dist/engine.js';
import { connectorReference } from '../dist/content/connector-reference.js';
import { formatEnglish, spanishTerm } from '../dist/formatting.js';

const main = { innerHTML:'', focus(){} };
const windowEvents = new Map();
const documentEvents = new Map();
const domNodes = new Map([
 ['#main', main],
 ['#announcer', { textContent:'' }],
 ['#answer-feedback', { focus(){}, scrollIntoView(){} }],
 ['#answer-form', { after(node){domNodes.set('.edited-notice',node);} }]
]);
let savedProgress=null;
globalThis.scrollY=0;
globalThis.location={hash:'#/'};
globalThis.localStorage={getItem:()=>savedProgress,setItem(key,value){savedProgress=value;}};
globalThis.matchMedia=()=>({matches:true});
globalThis.window={scrollTo(){},addEventListener:(name,handler)=>windowEvents.set(name,handler)};
globalThis.document={title:'',querySelector:selector=>domNodes.get(selector)||null,getElementById:id=>domNodes.get('#'+id)||null,querySelectorAll:()=>[],createElement:()=>({}),addEventListener:(name,handler)=>{
 const handlers=documentEvents.get(name)||[]; handlers.push(handler); documentEvents.set(name,handlers);
}};
await import('../dist/app.js');

const routes=['#/','#/guide','#/practice','#/stories','#/progress',
 ...guideSections.map(s=>'#/guide/'+s.id),
 ...exercises.map(s=>'#/practice/'+s.id),
 ...stories.map(s=>'#/stories/'+s.id),
 ...stories.filter(s=>s.extra).map(s=>'#/stories/'+s.id+'/extra')];
const assets=new Set();
const noLanguageMarkup=(html,label)=>assert.doesNotMatch(html,/\{\/?es\}/,`${label}: authored language markers must not leak into the interface`);
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
 noLanguageMarkup(main.innerHTML,route);
 noLanguageMarkup(document.title,route+' browser title');
 gatherAssets(main.innerHTML);
 for(const link of main.innerHTML.matchAll(/href="(#\/[^"#]*)"/g)){
  assert.ok(routes.includes(link[1]),`${route}: unknown route ${link[1]}`);
 }
}

// Check through the application's real input and submit handlers. A learner
// can submit one verb, see all unanswered gaps marked incorrect, and improve
// the review score without replacing the first score or completing a partial.
function openRoute(route){
 location.hash=route;
 windowEvents.get('hashchange')();
}
function typeAnswer(id,value){
 const input={dataset:{answer:id},value,removeAttribute(){},closest(selector){return selector==='[data-answer]'?this:null;}};
 for(const handler of documentEvents.get('input')||[])handler({target:input});
}
function checkAnswers(){
 let prevented=false;
 for(const handler of documentEvents.get('submit')||[])handler({target:{id:'answer-form'},preventDefault(){prevented=true;}});
 assert.equal(prevented,true,'Answer checks must use the form handler');
 noLanguageMarkup(main.innerHTML,location.hash+' feedback');
 noLanguageMarkup(domNodes.get('#announcer').textContent,location.hash+' accessible announcement');
 return JSON.parse(savedProgress);
}

// Put the complete bilingual reference before the developed explanations,
// retaining useful table semantics and a direct keyboard-accessible route on.
openRoute('#/guide/story-tools');
const markersArticle=main.innerHTML.match(/<article class="guide-article" id="chapter-story-tools">([\s\S]*?)<\/article>/)?.[1];
assert.ok(markersArticle,'The marker chapter must render its own article');
assert.match(markersArticle,/<\/header><section class="connector-reference"/,'The reference must be the first content after the chapter heading');
const markerTable=markersArticle.match(/<table class="connector-table">([\s\S]*?)<\/table>/)?.[1];
assert.ok(markerTable,'The marker chapter needs the bilingual quick-reference table');
assert.match(markerTable,/<caption id="connector-reference-caption">/,'The table needs an accessible caption');
assert.equal([...markerTable.matchAll(/<tbody data-connector-group=/g)].length,9,'The reference must expose all nine functional groups');
assert.equal([...markerTable.matchAll(/<th scope="row" /g)].length,45,'The reference must expose all 45 expression rows');
assert.equal([...markerTable.matchAll(/<th scope="col">/g)].length,4,'The table must explain expression, meaning, purpose and usage');
for(const row of connectorReference.rows){
 assert.ok(markerTable.includes(spanishTerm(row.spanish)),row.spanish+': identify the expression as Spanish');
 assert.ok(markerTable.includes(spanishTerm(row.useEs)),row.spanish+': provide a concise Spanish purpose');
 assert.ok(markerTable.includes(formatEnglish(row.useEn)),row.spanish+': provide an English purpose');
 assert.ok(markerTable.includes(spanishTerm(row.pattern)),row.spanish+': show the Spanish construction');
 assert.ok(markerTable.includes(spanishTerm(row.example)),row.spanish+': show the Spanish example');
}
assert.ok(markersArticle.indexOf('</table>')<markersArticle.indexOf('id="chapter-story-tools-explanations"'),'Developed explanations must follow the complete quick reference');
assert.match(markersArticle,/<p class="article-lead" id="chapter-story-tools-explanations" tabindex="-1">/,'The explanations need an accessible focus target');
assert.ok(markersArticle.includes(spanishTerm('Una vez'))&&markersArticle.includes(spanishTerm('un día')),'The opening explanation must distinguish both Spanish markers from English');
let guideFocused=false,guideScrolled=false;
domNodes.set('#chapter-story-tools-explanations',{focus(){guideFocused=true;},scrollIntoView(){guideScrolled=true;}});
const jumpButton={dataset:{guideJump:'chapter-story-tools-explanations'}};
for(const handler of documentEvents.get('click')||[])handler({target:{closest:selector=>selector==='[data-guide-jump]'?jumpButton:null}});
assert.equal(guideFocused,true,'Continue to explanations must move keyboard focus');
assert.equal(guideScrolled,true,'Continue to explanations must scroll to the developed explanation');
assert.equal(location.hash,'#/guide/story-tools','The in-chapter jump must not change the shared route');
openRoute('#/guide/past-progressive');
for(const type of ['progressive-conversation','progressive-painting'])assert.ok(main.innerHTML.includes(`data-diagram="${type}"`),`The progressive chapter must render ${type}`);

const train=stories.find(story=>story.id==='story-12');
openRoute('#/stories/'+train.id);
typeAnswer('s12g3','tenía');
let stored=checkAnswers();
let trainState=stored.activities[train.id];
assert.equal(trainState.first.points,1,'Checking one valid answer must score it immediately');
assert.equal(trainState.first.total,12,'Unanswered gaps must remain in the denominator');
assert.equal(trainState.best.points,1);
assert.equal(trainState.completed,false,'A partial check is not a completed activity');
assert.equal(trainState.submittedNonempty,true);
assert.deepEqual(stored.achievementNotified,['first-check'],'The partial answer earns only the first-submission medal');
assert.equal([...main.innerHTML.matchAll(/class="feedback-card empty"/g)].length,11,'Every blank needs its own incorrect feedback');
assert.equal([...main.innerHTML.matchAll(/aria-invalid="true"/g)].length,11,'Unanswered verb fields must expose their invalid state');
assert.match(main.innerHTML,/Not answered · incorrect/,'Blank answers must be labelled incorrect');
assert.match(main.innerHTML,/No answer: this counts as incorrect \(0 points\)/,'Blank feedback must explain the zero');
const thirdFeedback=main.innerHTML.match(/<article class="feedback-card correct" id="feedback-s12g3">([\s\S]*?)<\/article>/)?.[1];
assert.ok(thirdFeedback,'The submitted alternative needs its own correct feedback');
assert.match(thirdFeedback,/<section class="accepted-readings" aria-label="Other valid readings">/,'Other readings must be an expanded section');
assert.match(thirdFeedback,/<b lang="es">tuvo<\/b>/,'The other reading must remain visible beside the selected form');
assert.ok(thirdFeedback.includes(spanishTerm('tenía que mudarse')),'The chosen explanation must highlight its complete Spanish construction');
assert.doesNotMatch(thirdFeedback,/<details\b|<summary\b|\shidden(?:[=>\s])/,'Accepted readings must not be collapsed or hidden');
assert.match(domNodes.get('#announcer').textContent,/Checked: 1 out of 12/,'The partial score must be announced accessibly');
gatherAssets(main.innerHTML);
for(const gap of train.gaps)typeAnswer(gap.id,gap.id==='s12g3'?'tenía':gap.answers[0].form);
stored=checkAnswers(); trainState=stored.activities[train.id];
assert.equal(trainState.first.points,1,'Review must preserve the first partial score');
assert.equal(trainState.best.points,12,'The best review score must improve');
assert.equal(trainState.latest.points,12);
assert.equal(trainState.attempts,2);
assert.equal(trainState.completed,true,'The fully answered check now completes the activity');
assert.ok(stored.achievementNotified.includes('first-complete'));
assert.ok(stored.achievementNotified.includes('first-story'));
assert.ok(stored.achievementNotified.includes('first-perfect'));
assert.doesNotMatch(main.innerHTML,/<details\b[^>]*>[\s\S]*?Other valid reading/,'Other readings must not be inside any disclosure');

const emptyStory=stories[0];
openRoute('#/stories/'+emptyStory.id);
stored=checkAnswers();
assert.equal(stored.activities[emptyStory.id].first.points,0,'An entirely blank check is still scored');
assert.equal(stored.activities[emptyStory.id].first.total,8);
assert.equal(stored.activities[emptyStory.id].completed,false);
assert.equal(stored.activities[emptyStory.id].submittedNonempty,false);
assert.equal([...main.innerHTML.matchAll(/class="feedback-card empty"/g)].length,8);

openRoute('#/progress');
assert.equal([...main.innerHTML.matchAll(/<article class="achievement-card /g)].length,20,'Progress needs all 20 medal cards');
const badgeSources=[...main.innerHTML.matchAll(/<img\b[^>]*src="(\.\/assets\/achievements\/badge\d{2}\.png)"/g)].map(match=>match[1]);
assert.deepEqual(badgeSources,Array.from({length:20},(_,index)=>`./assets/achievements/badge${String(index+1).padStart(2,'0')}.png`));
assert.match(main.innerHTML,/Listo para la prueba de progreso 2/,'The final medal must have the requested title');
assert.ok(main.innerHTML.includes(`<progress value="1" max="${exercises.length + stories.length}"`),'A full story plus a blank check completes only one main activity');
gatherAssets(main.innerHTML);

// The course extension mixes radio choices with typed multiword answers.
// Exercise the same input/submit path used above rather than rendering only
// the fresh routes: a chosen alternative, a meaningful distractor and a later
// full revision must retain the first score and expose every explanation.
function answerGap(gap, form = gap.answers[0].form){
 if(gap.options){
  assert.ok(gap.options.includes(form),`${gap.id}: the selected expression must be offered`);
  assert.ok(main.innerHTML.includes(`type="radio" name="${gap.id}"`),`${gap.id}: choices must be real radio controls`);
 }
 typeAnswer(gap.id,form);
}
function feedbackFor(id){
 const card=main.innerHTML.match(new RegExp(`<article class="feedback-card [^"]+" id="feedback-${id}">([\\s\\S]*?)<\\/article>`))?.[1];
 assert.ok(card,`${id}: individual feedback is required after checking`);
 return card;
}
const newBlockIds=['story-connectors','time-and-change','progressive-past','voices-and-reactions'];
for(const id of newBlockIds){
 const block=exercises.find(item=>item.id===id);
 assert.ok(block,`Missing new unit block: ${id}`);
 const gaps=activityGaps(block);
 openRoute('#/practice/'+id);
 if(id==='story-connectors'){
  answerGap(gaps.find(gap=>gap.id==='e11g10'),'Entonces');
  answerGap(gaps.find(gap=>gap.id==='e11g4'),'poco después');
 }else answerGap(gaps[0]);
 stored=checkAnswers();
 let state=stored.activities[id];
 assert.equal(state.first.points,1,`${id}: a partial check must credit its one correct answer`);
 assert.equal(state.first.total,gaps.length);
 assert.equal(state.completed,false,`${id}: unfilled answers prevent completion, not checking`);
 if(id==='story-connectors'){
  const accepted=feedbackFor('e11g10');
  assert.match(accepted,/at that moment|arrival/,'The chosen Entonces reading needs its explanation');
  assert.match(accepted,/<section class="accepted-readings"/,'The other interpretation must remain visible');
  assert.doesNotMatch(accepted,/<details\b|<summary\b|\shidden(?:[=>\s])/);
  const rejected=feedbackFor('e11g4');
  assert.match(rejected,/Check the meaning/,'A timing distractor needs a meaning diagnosis');
  assert.match(rejected,/does not express the unexpected onset/,'Feedback must explain sequence versus surprise');
  assert.ok(main.innerHTML.includes('value="Entonces" checked'),'The selected valid radio alternative must remain checked');
 }
 for(const gap of gaps)answerGap(gap);
 stored=checkAnswers(); state=stored.activities[id];
 assert.equal(state.first.points,1,`${id}: full review must preserve the partial first score`);
 assert.equal(state.best.points,gaps.length,`${id}: all canonical answers must earn the full review score`);
 assert.equal(state.latest.points,gaps.length);
 assert.equal(state.completed,true);
 assert.equal(state.attempts,2);
 assert.equal([...main.innerHTML.matchAll(/class="feedback-card correct"/g)].length,gaps.length,`${id}: every answer needs correct feedback`);
 gatherAssets(main.innerHTML);
}

for(const number of [16,17,18,19,20,21]){
 const story=stories.find(item=>item.id==='story-'+number);
 openRoute('#/stories/'+story.id);
 answerGap(story.gaps[0]);
 stored=checkAnswers();
 assert.equal(stored.activities[story.id].first.points,1,`${story.id}: a single verb must be checkable`);
 assert.equal(stored.activities[story.id].first.total,12);
 assert.equal(stored.activities[story.id].completed,false);
 for(const gap of story.gaps)answerGap(gap);
 stored=checkAnswers();
 assert.equal(stored.activities[story.id].first.points,1);
 assert.equal(stored.activities[story.id].best.points,12);
 assert.equal(stored.activities[story.id].completed,true);
 assert.equal([...main.innerHTML.matchAll(/class="feedback-card correct"/g)].length,12);
 gatherAssets(main.innerHTML);
 openRoute('#/stories/'+story.id+'/extra');
 answerGap(story.extra.gaps[0]);
 stored=checkAnswers();
 const optionalId=story.id+'-extra';
 assert.ok(stored.activities[optionalId],`${story.id}: the optional challenge must use a separate saved entry`);
 assert.equal(stored.activities[optionalId].first.points,1);
 assert.equal(stored.activities[optionalId].first.total,2);
 assert.equal(stored.activities[optionalId].completed,false);
 assert.match(feedbackFor(story.extra.gaps[1].id),/0 points/,'An unanswered optional field must also be an explicit zero');
 for(const gap of story.extra.gaps)answerGap(gap);
 stored=checkAnswers();
 assert.equal(stored.activities[optionalId].first.points,1);
 assert.equal(stored.activities[optionalId].best.points,2);
 assert.equal(stored.activities[optionalId].completed,true);
 assert.equal(stored.activities[story.id].first.points,1,'The optional score must leave the main first attempt alone');
 assert.equal(stored.activities[story.id].best.points,12,'The optional score must leave the main review score alone');
 gatherAssets(main.innerHTML);
}

// Every authored explanation is also rendered after checking, including the
// alternatives which fresh routes do not display. This catches escaping the
// marker literally in feedback, cues, optional challenges or the models.
const automaticActivities=[...exercises.filter(activity=>activity.kind!=='writing'),...stories,
 ...stories.filter(story=>story.extra).map(story=>({...story.extra,id:story.id+'-extra',parentId:story.id}))];
let checkedFeedbackAnswers=0;
for(const activity of automaticActivities){
 const route=activity.parentId?'#/stories/'+activity.parentId+'/extra':
  '#/'+(activity.id.startsWith('story-')&&/^story-\d+$/.test(activity.id)?'stories':'practice')+'/'+activity.id;
 openRoute(route);
 const gaps=activityGaps(activity);
 for(const gap of gaps)answerGap(gap);
 checkAnswers();
 for(const gap of gaps){
  const html=feedbackFor(gap.id);
  for(const answer of gap.answers){
   assert.ok(html.includes(formatEnglish(answer.feedback)),gap.id+': render each accepted reading with its Spanish language markup');
   checkedFeedbackAnswers++;
  }
 }
 gatherAssets(main.innerHTML);
}

// Exercise both states through the application's event handler. Route rendering
// alone only sees the initial state, so missing alternative images go unnoticed.
assert.deepEqual(Object.keys(diagramData).sort(),['duration','habits','perspective','progressive-conversation','progressive-painting','scene']);
const generatedGuideAssets=new Set();
for(const [type,data] of Object.entries(diagramData)){
 assert.equal(data.labels.length,2,`${type}: two comparison labels required`);
 assert.equal(data.sentences.length,2,`${type}: two Spanish examples required`);
 assert.equal(data.captions.length,2,`${type}: two explanations required`);
 const fields={'.diagram-art':{innerHTML:''},'.diagram-spanish':{textContent:''},'.diagram-explanation':{innerHTML:''}};
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
  assert.equal(fields['.diagram-explanation'].innerHTML,formatEnglish(data.captions[mode]),`${type}/${mode}: formatted explanation did not change`);
  noLanguageMarkup(fields['.diagram-explanation'].innerHTML,`${type}/${mode} caption`);
  buttons.forEach((item,index)=>{
   assert.equal(item.pressed,String(index===mode),`${type}/${mode}: accessible selected state`);
   assert.equal(item.selected,index===mode,`${type}/${mode}: visible selected state`);
  });
  const art=fields['.diagram-art'].innerHTML;
  noLanguageMarkup(art,`${type}/${mode} art`);
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
assert.equal(generatedGuideAssets.size,10,'Five illustrated comparisons need ten distinct generated image states');

const storyImages=new Set();
for(let index=0;index<stories.length;index++){
 const art=storyArt(index); gatherAssets(art);
 const source=art.match(/<img\b[^>]*src="([^"]+)"/)?.[1];
 assert.ok(source,`Story ${index+1}: illustration required`); storyImages.add(source);
}
assert.equal(storyImages.size,stories.length,'Each story needs its own illustration');
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
console.log(`${routes.length} routes rendered; ${assets.size} local assets resolved; a 45-row bilingual reference in nine groups precedes its explanations; ${checkedFeedbackAnswers} accepted-answer explanations render without language-marker leaks; partial/blank submission, visible alternatives, score history and 20 medal cards verified; all twelve diagram states respond, including ten generated guide images and the original calendar. Visual browser review is a separate check.`);
