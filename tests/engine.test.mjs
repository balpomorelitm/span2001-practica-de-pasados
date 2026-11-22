import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize, gradeGap, gradeActivity, emptyProgress, parseProgress, entryFor, recordAttempt, assessWriting, fillTokens, CONTENT_VERSION } from '../dist/engine.js';
import { stories } from '../dist/content/stories.js';
import { exercises } from '../dist/content/exercises.js';
import { validateContent } from '../scripts/check-content.mjs';

const gap = { id: 'test', cue: 'hablar · él', answers: [{ form:'habló',tense:'preterite',feedback:'Preterite: this is a complete speech event.' }], wrongAnswers:[{form:'hablaron',kind:'person',feedback:'The singular subject requires habló.'},{form:'hablaba',kind:'tense',feedback:'The requested whole-event view uses habló.'}] };

test('all curriculum content is complete, linked and within the word ranges', () => assert.deepEqual(validateContent().errors, []));
test('spaces, case and Unicode NFC do not cause false errors', () => {
  assert.equal(normalize('  HABLO\u0301   '),'habló');
  assert.equal(gradeGap(gap,'  HABLO\u0301  ').points,1);
  assert.equal(normalize(' se  RIÓ '),'se rió');
});
test('accent-only errors receive half a point without claiming full correctness', () => {
  const result = gradeGap(gap,'hablo');
  assert.equal(result.points,0.5); assert.equal(result.status,'accent'); assert.match(result.feedback,/accent-only/);
});
test('ñ and ü are not reduced to n or u', () => {
  const ownGap={...gap,answers:[{...gap.answers[0],form:'enseñó'}]};
  assert.equal(gradeGap(ownGap,'enseno').points,0);
  assert.equal(gradeGap(ownGap,'enseño').points,0.5);
  assert.notEqual(normalize('argüí'),normalize('argui'));
});
test('tense and person receive separate diagnoses for known wrong forms', () => {
  assert.equal(gradeGap(gap,'hablaron').label,'Check the person');
  assert.equal(gradeGap(gap,'hablaba').label,'Reconsider the tense');
  assert.equal(gradeGap(gap,'invented').status,'incorrect');
});
test('every authored accepted form earns full credit and its own feedback', () => {
  const gaps=[...stories.flatMap(s=>[...s.gaps,...(s.extra?.gaps||[])]),...exercises.flatMap(e=>e.items.flatMap(i=>i.gaps||[]))];
  for (const item of gaps) for (const answer of item.answers) {
    const result=gradeGap(item,answer.form); assert.equal(result.points,1,item.id+' '+answer.form); assert.equal(result.feedback,answer.feedback);
  }
});
test('an exact alternative takes priority over accent-only matching', () => {
  const ownGap={...gap,answers:[...gap.answers,{form:'hablo',tense:'present',feedback:'Present: I speak now.'}]};
  assert.equal(gradeGap(ownGap,'hablo').points,1); assert.equal(gradeGap(ownGap,'hablo').answer.tense,'present');
});
test('alternatives are specific to a gap and not accepted globally', () => {
  const open=exercises.find(e=>e.id==='alternatives').items[0].gaps[0];
  assert.equal(gradeGap(open,'sabía').points,1); assert.equal(gradeGap(open,'supe').points,1);
  assert.notEqual(gradeGap(open,'sabía').feedback,gradeGap(open,'supe').feedback);
  assert.equal(gradeGap(open,'supo').points,0);
});
test('a whole multiword perfect is one answer and normalises internal whitespace', () => {
  const extra=stories[13].extra; const values=Object.fromEntries(extra.gaps.map(g=>[g.id,g.answers[0].form]));
  values[extra.gaps[0].id]=' HA   GRABADO ';
  const grade=gradeActivity(extra,values); assert.equal(grade.total,2); assert.equal(grade.points,2);
});
test('checking a blank answer counts it as an error with the expected form and its explanation', () => {
  const result=gradeGap(gap,'   ');
  assert.equal(result.status,'empty'); assert.equal(result.points,0);
  assert.equal(result.label,'Not answered · incorrect');
  assert.match(result.feedback,/No answer: this counts as incorrect \(0 points\)/);
  assert.match(result.feedback,/expected answer is habló/);
  assert.ok(result.feedback.endsWith(gap.answers[0].feedback));
  assert.equal(result.answer,gap.answers[0]);
});
test('an entirely blank submission records a zero first attempt that survives storage', () => {
  const activity={gaps:[gap,{...gap,id:'second'}]};
  const grade=gradeActivity(activity,{});
  assert.equal(grade.complete,false); assert.equal(grade.points,0); assert.equal(grade.total,2); assert.equal(grade.percent,0);
  const progress=emptyProgress();
  progress.activities.example=recordAttempt(entryFor(progress,'example'),grade);
  const saved=parseProgress(JSON.stringify(progress)).activities.example;
  assert.deepEqual(saved.first,{points:0,total:2,percent:0});
  assert.deepEqual(saved.best,saved.first); assert.deepEqual(saved.latest,saved.first);
  assert.equal(saved.attempts,1); assert.equal(saved.checked,true); assert.equal(saved.completed,false); assert.equal(saved.submittedNonempty,false);
});
test('a partial submission uses every gap in the denominator and preserves its first score on revision', () => {
  const activity={gaps:[gap,{...gap,id:'choice',options:['habló','hablaba']},{...gap,id:'blank'}]};
  const partial=gradeActivity(activity,{test:'hablo',choice:'habló'});
  assert.equal(partial.complete,false); assert.equal(partial.points,1.5); assert.equal(partial.total,3); assert.equal(partial.percent,50);
  assert.equal(partial.results.test.status,'accent'); assert.equal(partial.results.choice.status,'correct'); assert.equal(partial.results.blank.points,0);
  let state=recordAttempt({answers:{test:'hablo',choice:'habló'},self:{},attempts:0},partial);
  assert.equal(state.completed,false); assert.equal(state.submittedNonempty,true);
  const restored=parseProgress(JSON.stringify({version:CONTENT_VERSION,activities:{partial:state}}));
  assert.equal(restored.activities.partial.completed,false);
  const full=gradeActivity(activity,{test:'habló',choice:'habló',blank:'habló'});
  state=recordAttempt(state,full);
  assert.deepEqual(state.first,{points:1.5,total:3,percent:50});
  assert.deepEqual(state.best,{points:3,total:3,percent:100}); assert.deepEqual(state.latest,state.best);
  assert.equal(state.attempts,2); assert.equal(state.completed,true);
  state=recordAttempt(state,gradeActivity(activity,{}));
  assert.equal(state.first.points,1.5); assert.equal(state.best.points,3); assert.equal(state.latest.points,0); assert.equal(state.attempts,3);
  assert.equal(state.completed,true);
});
test('a nonempty check remains recorded after all answers are cleared', () => {
  const activity={gaps:[gap,{...gap,id:'blank'}]};
  let state=recordAttempt({answers:{test:'wrong'},self:{},attempts:0},gradeActivity(activity,{test:'wrong'}));
  assert.equal(state.submittedNonempty,true); assert.equal(state.completed,false); assert.equal(state.first.points,0);
  state=recordAttempt({...state,answers:{}},gradeActivity(activity,{}));
  assert.equal(state.submittedNonempty,true); assert.equal(state.completed,false);
  const restored=parseProgress(JSON.stringify({version:CONTENT_VERSION,activities:{example:state}})).activities.example;
  assert.equal(restored.submittedNonempty,true);
});
test('partial points are included in the percentage', () => {
  const result=gradeActivity({gaps:[gap]},{test:'hablo'});
  assert.equal(result.points,0.5); assert.equal(result.percent,50);
});
test('the first score survives retries and a viewed solution', () => {
  const activity={gaps:[gap]};
  let state={answers:{test:'wrong'},self:{},revealed:false,attempts:0};
  state=recordAttempt(state,gradeActivity(activity,state.answers));
  state={...state,revealed:true,answers:{test:'habló'}};
  state=recordAttempt(state,gradeActivity(activity,state.answers));
  assert.equal(state.first.points,0); assert.equal(state.best.points,1); assert.equal(state.latest.points,1); assert.equal(state.attempts,2); assert.equal(state.revealed,true);
  state=recordAttempt(state,gradeActivity(activity,{test:'wrong'}));
  assert.equal(state.best.points,1); assert.equal(state.latest.points,0); assert.equal(state.first.points,0);
});
test('saved progress round-trips and broken or outdated data resets safely', () => {
  const progress=emptyProgress(); entryFor(progress,'story-01').answers.example='habló';
  assert.equal(parseProgress(JSON.stringify(progress)).activities['story-01'].answers.example,'habló');
  assert.deepEqual(parseProgress('bad json'),emptyProgress());
  assert.deepEqual(parseProgress(JSON.stringify({version:CONTENT_VERSION+1,activities:{}})),emptyProgress());
  assert.deepEqual(parseProgress(JSON.stringify({version:CONTENT_VERSION,activities:[]})),emptyProgress());
  assert.doesNotThrow(()=>parseProgress(JSON.stringify({version:CONTENT_VERSION,activities:{a:null,b:42,c:{answers:{x:3},first:{points:99,total:1}}}})));
});
test('new entries have the current activity revision without a completed milestone', () => {
  const progress=emptyProgress();
  assert.equal(entryFor(progress,'story-11').contentRevision,2);
  assert.equal(entryFor(progress,'story-12').contentRevision,1);
  assert.equal(entryFor(progress,'story-11').completed,false);
  assert.equal(entryFor(progress,'story-11').submittedNonempty,false);
  assert.equal(entryFor(progress,'story-11').contentUpdated,false);
});
test('legacy full checks remain completed while an explicit partial state stays incomplete', () => {
  const score={points:0.5,total:1,percent:50};
  const saved=parseProgress(JSON.stringify({version:CONTENT_VERSION,activities:{
    legacy:{answers:{test:'hablo'},first:score},
    partial:{answers:{},first:{points:0,total:1},completed:false},
    invalid:{answers:{},first:{points:9,total:1}},
    untouched:{answers:{test:'habló'}}
  }}));
  assert.equal(saved.activities.legacy.completed,true);
  assert.equal(saved.activities.legacy.submittedNonempty,true);
  assert.equal(saved.activities.partial.completed,false);
  assert.equal(saved.activities.invalid.completed,false);
  assert.equal(saved.activities.untouched.completed,false);
});
test('the corrected kitchen gap migrates once without erasing other answers or activities', () => {
  const score={points:12,total:12,percent:100};
  const oldEntry={answers:{s11g1:'pasaba',s11g2:'era',s11g3:'había'},self:{},first:score,best:score,latest:score,attempts:3,checked:true,dirty:true,revealed:true,everRevealed:true};
  const otherEntry={answers:{s12g1:'esperaba'},self:{},first:{points:8,total:12},attempts:2,checked:true};
  const saved=parseProgress(JSON.stringify({version:CONTENT_VERSION,activities:{'story-11':oldEntry,'story-12':otherEntry}}));
  const corrected=saved.activities['story-11'];
  assert.deepEqual(corrected.answers,{s11g1:'pasaba',s11g3:'había'});
  assert.equal(corrected.contentRevision,2); assert.equal(corrected.contentUpdated,true);
  for(const field of ['first','best','latest']) assert.equal(corrected[field],null);
  for(const flag of ['checked','dirty','revealed','everRevealed','completed','submittedNonempty']) assert.equal(corrected[flag],false);
  assert.equal(corrected.attempts,0);
  assert.deepEqual(saved.activities['story-12'].answers,otherEntry.answers);
  assert.equal(saved.activities['story-12'].first.points,8); assert.equal(saved.activities['story-12'].attempts,2); assert.equal(saved.activities['story-12'].completed,true);
  assert.deepEqual(parseProgress(JSON.stringify(saved)),saved);
  corrected.answers.s11g2='estaba';
  const correctedAttempt=recordAttempt(corrected,{complete:false,points:1,total:12,percent:8.3});
  assert.equal(correctedAttempt.contentUpdated,false); assert.equal(correctedAttempt.completed,false);
  const reloaded=parseProgress(JSON.stringify({version:CONTENT_VERSION,activities:{'story-11':correctedAttempt}})).activities['story-11'];
  assert.equal(reloaded.answers.s11g2,'estaba'); assert.equal(reloaded.first.points,1); assert.equal(reloaded.attempts,1); assert.equal(reloaded.contentUpdated,false);
});
test('writing self-assessment is explicit and does not grade word order', () => {
  const items=exercises.find(e=>e.kind==='writing').items;
  const self={[items[0].id+':form']:true,[items[0].id+':meaning']:true};
  const grade=assessWriting(items,self); assert.equal(grade.points,2); assert.equal(grade.total,12);
  assert.equal(assessWriting(items,{}).points,0);
});
test('model texts capitalise answers at sentence boundaries without altering the accepted form', () => {
  assert.equal(fillTokens('{{test}}. Luego {{test}}.',[gap]),'Habló. Luego habló.');
  assert.equal(gap.answers[0].form,'habló');
});
test('restoring progress derives numeric percentages instead of trusting stored markup', () => {
  const restored=parseProgress(JSON.stringify({version:CONTENT_VERSION,activities:{x:{answers:{},first:{points:0.5,total:1,percent:'<img>'},attempts:'<img>',checked:'yes'}}}));
  assert.equal(restored.activities.x.first.percent,50);
  assert.equal(restored.activities.x.attempts,0);
  assert.equal(restored.activities.x.checked,false);
});
