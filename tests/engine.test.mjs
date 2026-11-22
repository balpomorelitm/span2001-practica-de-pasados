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
test('blanks do not create a first attempt', () => {
  const state={answers:{},self:{},first:null}; const activity={gaps:[gap]};
  const incomplete=gradeActivity(activity,{});
  assert.equal(incomplete.complete,false); assert.equal(recordAttempt(state,incomplete),state);
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
