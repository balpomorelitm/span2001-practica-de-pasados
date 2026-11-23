import test from 'node:test';
import assert from 'node:assert/strict';
import { activityGaps, CONTENT_VERSION, emptyProgress, entryFor, gradeActivity, gradeGap, parseProgress, recordAttempt } from '../dist/engine.js';
import { exercises } from '../dist/content/exercises.js';
import { stories } from '../dist/content/stories.js';
import { plainText } from '../dist/formatting.js';

const activity = id => [...exercises, ...stories].find(item => item.id === id);
const gap = (id, gapId) => activityGaps(activity(id)).find(item => item.id === gapId);
const score = (points, total) => ({ points, total, percent: Math.round(points / total * 1000) / 10 });
function legacyEntry(id, answers, points) {
  const total = activityGaps(activity(id)).length;
  return { ...entryFor(emptyProgress(), id), answers, contentRevision: 1, first: score(points, total), best: score(total, total), latest: score(total - 1, total), attempts: 3, completed: true, submittedNonempty: true, checked: true, dirty: false, revealed: true, everRevealed: true };
}

test('returning learners retain unchanged work when their old verb targets become progressive auxiliaries', () => {
  const saved = { version: CONTENT_VERSION, achievementNotified: ['first-check', 'first-story'], activities: {
    'story-03': legacyEntry('story-03', { s03g1: 'queríamos', s03g3: 'puso', s03g4: 'esperábamos', s03g8: 'reímos' }, 7),
    'story-10': legacyEntry('story-10', { s10g1: 'estábamos', s10g2: 'se apagaron', s10g7: 'contaba', s10g8: 'esperaban', s10g9: 'volvió' }, 10),
    'story-06': legacyEntry('story-06', { s06g1: 'éramos', s06g10: 'vimos' }, 9),
    'story-13': legacyEntry('story-13', { s13g1: 'ocupaba', s13g8: 'dio' }, 10)
  } };
  const restored = parseProgress(JSON.stringify(saved));
  assert.deepEqual(restored.activities['story-03'].answers, { s03g1: 'queríamos', s03g3: 'puso' });
  assert.deepEqual(restored.activities['story-10'].answers, { s10g1: 'estábamos', s10g2: 'se apagaron', s10g9: 'volvió' });
  for (const id of ['story-03', 'story-10']) {
    const state = restored.activities[id];
    assert.equal(state.contentRevision, 2);
    assert.equal(state.contentUpdated, true);
    assert.equal(state.completed, false, 'Changed targets need a fresh completion check');
    assert.equal(state.checked, false);
    assert.equal(state.revealed, false);
    assert.equal(state.attempts, 0);
    assert.equal(state.first, null);
    assert.equal(state.best, null);
    assert.equal(state.latest, null);
  }
  for (const id of ['story-06', 'story-13']) {
    assert.deepEqual(restored.activities[id], saved.activities[id], 'New context and glosses must not erase an unchanged target or its score');
  }
  assert.deepEqual(restored.achievementNotified, saved.achievementNotified);
  assert.deepEqual(parseProgress(JSON.stringify(restored)), restored, 'Reloading must not apply the migration twice');

  const revised = restored.activities['story-03'];
  revised.answers.s03g4 = 'estábamos';
  restored.activities['story-03'] = recordAttempt(revised, gradeActivity(activity('story-03'), revised.answers));
  const reloaded = parseProgress(JSON.stringify(restored)).activities['story-03'];
  assert.equal(reloaded.answers.s03g4, 'estábamos', 'An answer to the new target must survive the next reload');
  assert.equal(reloaded.first.points, 3);
  assert.equal(reloaded.first.total, 8);
  assert.equal(reloaded.contentUpdated, false);
  assert.equal(reloaded.completed, false);
});

test('a narrative choice grades the requested relationship, accepts its alternative and explains the distractor', () => {
  const question = gap('story-connectors', 'e11g10');
  const first = gradeGap(question, 'En ese momento');
  const alternative = gradeGap(question, 'Entonces');
  assert.equal(first.points, 1);
  assert.equal(alternative.points, 1);
  assert.notEqual(first.feedback, alternative.feedback, 'Two readings need their own explanations');
  assert.match(alternative.feedback, /at that moment|arrival/i);
  const wrong = gradeGap(question, 'En aquella época');
  assert.equal(wrong.points, 0);
  assert.equal(wrong.label, 'Check the meaning');
  assert.match(wrong.feedback, /broader past period|particular arrival/i);
  const partial = gradeActivity(activity('story-connectors'), { e11g10: 'Entonces' });
  assert.equal(partial.points, 1);
  assert.equal(partial.total, 12);
  assert.equal(partial.complete, false);
  assert.equal(partial.results.e11g1.points, 0);
  assert.equal(partial.results.e11g1.status, 'empty');
  assert.match(partial.results.e11g1.feedback, /0 points/);
});

test('a full progressive answer accepts both pronoun positions and gives half credit only for a missing accent', () => {
  const inside = gap('progressive-past', 'e13g11');
  assert.equal(gradeGap(inside, 'se estaban riendo').points, 1);
  assert.equal(gradeGap(inside, 'estaban riéndose').points, 1);
  const accent = gradeGap(inside, 'estaban riendose');
  assert.equal(accent.points, 0.5);
  assert.equal(accent.status, 'accent');
  assert.match(accent.feedback, /riéndose/);
  const missingPronoun = gradeGap(inside, 'estaban riendo');
  assert.equal(missingPronoun.points, 0);
  assert.equal(missingPronoun.label, 'Check the conjugation');
  assert.match(plainText(missingPronoun.feedback), /include se/i);
  const whole = gap('progressive-past', 'e13g2');
  assert.equal(gradeGap(whole, 'estuve preparando').points, 1);
  assert.match(gradeGap(whole, 'estuve preparando').feedback, /does not say.*finished/i);
});

test('affirmative commands require the addressed person, attached pronoun and appropriate accent', () => {
  const respectful = gap('voices-and-reactions', 'e14g4');
  assert.equal(gradeGap(respectful, 'dígame').points, 1);
  assert.equal(gradeGap(respectful, 'digame').points, 0.5);
  assert.equal(gradeGap(respectful, 'dime').label, 'Check the person');
  assert.equal(gradeGap(respectful, 'me diga').label, 'Check the conjugation');
  assert.match(gradeGap(respectful, 'me diga').feedback, /attaches to the verb/i);
  const group = gap('voices-and-reactions', 'e14g5');
  assert.equal(gradeGap(group, 'lavaos').points, 1);
  assert.equal(gradeGap(group, 'lavados').points, 0);
  assert.match(gradeGap(group, 'lavados').feedback, /d.*drops|d.*drop/i);
});

test('every new story and its optional challenge has a separate, usable score', () => {
  const progress = emptyProgress();
  for (const number of [16, 17, 18, 19, 20, 21]) {
    const story = activity('story-' + number);
    const values = Object.fromEntries(story.gaps.map(item => [item.id, item.answers[0].form]));
    const mainGrade = gradeActivity(story, values);
    assert.equal(mainGrade.points, 12, story.id);
    assert.equal(mainGrade.total, 12);
    assert.equal(mainGrade.complete, true);
    const main = recordAttempt({ ...entryFor(progress, story.id), answers: values }, mainGrade);
    progress.activities[story.id] = main;
    const optionalId = story.id + '-extra';
    const optionalValues = Object.fromEntries(story.extra.gaps.map(item => [item.id, item.answers[0].form]));
    const optional = recordAttempt({ ...entryFor(progress, optionalId), answers: optionalValues }, gradeActivity(story.extra, optionalValues));
    assert.equal(optional.first.points, 2);
    assert.equal(optional.first.total, 2);
    assert.deepEqual(progress.activities[story.id], main, 'Optional work must not replace the main story score');
  }
});
