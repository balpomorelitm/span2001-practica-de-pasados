import test from 'node:test';
import assert from 'node:assert/strict';
import { exercises } from '../dist/content/exercises.js';
import { stories } from '../dist/content/stories.js';
import { activityGaps, emptyProgress, gradeActivity, parseProgress, recordAttempt } from '../dist/engine.js';
import { achievementDefinitions, achievementMetrics, calculateAchievements, isWritingComplete } from '../dist/achievements.js';

const writing = exercises.find(activity => activity.kind === 'writing');
const automaticMain = [...exercises.filter(activity => activity.kind !== 'writing'), ...stories];
const extras = stories.filter(activity => activity.extra).map(activity => ({ ...activity.extra, id: activity.id + '-extra' }));
const courseTotal=exercises.length+stories.length;
const badge = (progress, id) => calculateAchievements(progress).achievements.find(item => item.id === id);

function checked(activity, { correct = false } = {}) {
  const answers = Object.fromEntries(activityGaps(activity).map(gap => [gap.id, correct ? gap.answers[0].form : 'respuesta incorrecta']));
  return recordAttempt({ answers, self: {} }, gradeActivity(activity, answers));
}
function completedWriting() {
  return {
    answers: Object.fromEntries(writing.items.map(item => [item.id, item.model])),
    self: Object.fromEntries(writing.items.map(item => [item.id + ':open', false]))
  };
}

test('the collection has 20 distinct badges and a completion-based final award', () => {
  const result = calculateAchievements(emptyProgress());
  assert.equal(achievementDefinitions.length, 20);
  assert.equal(new Set(achievementDefinitions.map(item => item.id)).size, 20);
  assert.deepEqual(achievementDefinitions.map(item => item.asset), Array.from({ length: 20 }, (_, i) => `assets/achievements/badge${String(i + 1).padStart(2, '0')}.png`));
  assert.equal(result.summary.mainTotal, courseTotal);
  assert.equal(result.summary.automaticTotal, automaticMain.length);
  assert.equal(result.summary.optionalTotal, extras.length);
  assert.equal(result.summary.earnedCount, 0);
  assert.equal(result.achievements.at(-1).title, 'Listo para la prueba de progreso 2');
  assert.equal(result.achievements.at(-1).target, courseTotal);
  assert.ok(result.achievements.every(item => item.description && item.current === 0 && item.earned === false));
});

test('checking all blanks earns neither submission, completion nor accuracy awards', () => {
  const progress = emptyProgress();
  const activity = automaticMain[0];
  const answers = Object.fromEntries(activityGaps(activity).map(gap => [gap.id, '   ']));
  progress.activities[activity.id] = recordAttempt({ answers }, gradeActivity(activity, answers));
  const result = calculateAchievements(progress);
  assert.equal(result.summary.submittedActivities, 0);
  assert.equal(result.summary.mainCompleted, 0);
  assert.equal(result.summary.perfectActivities, 0);
  assert.equal(result.summary.earnedCount, 0);
});

test('one checked answer earns first submission without completing the activity', () => {
  const progress = emptyProgress();
  const activity = automaticMain[0];
  const gap = activityGaps(activity)[0];
  const answers = { [gap.id]: 'respuesta incorrecta' };
  progress.activities[activity.id] = recordAttempt({ answers }, gradeActivity(activity, answers));
  assert.equal(badge(progress, 'first-check').earned, true);
  assert.equal(badge(progress, 'first-complete').earned, false);
  assert.equal(badge(progress, 'first-perfect').earned, false);
  assert.equal(achievementMetrics(progress).mainCompleted, 0);
  progress.activities[activity.id].answers = {};
  assert.equal(badge(progress, 'first-check').earned, true, 'the first submission remains earned after draft edits');
});

test('an unchecked draft after a blank check cannot earn the first submission medal', () => {
  const progress = emptyProgress();
  const activity = automaticMain[0];
  const gap = activityGaps(activity)[0];
  progress.activities[activity.id] = recordAttempt({ answers: {} }, gradeActivity(activity, {}));
  assert.equal(progress.activities[activity.id].submittedNonempty, false);
  progress.activities[activity.id].answers[gap.id] = gap.answers[0].form;
  assert.equal(badge(progress, 'first-check').earned, false, 'typing is not a scored submission');
  const restored = parseProgress(JSON.stringify(progress));
  assert.equal(badge(restored, 'first-check').earned, false, 'reloading preserves the explicit unchecked state');
  const state = restored.activities[activity.id];
  restored.activities[activity.id] = recordAttempt(state, gradeActivity(activity, state.answers));
  assert.equal(badge(restored, 'first-check').earned, true, 'checking the drafted answer now earns the medal');
  assert.equal(badge(restored, 'first-complete').earned, false);
});

test('filling every gap without checking does not mark an automatic activity complete', () => {
  const progress = emptyProgress();
  const activity = automaticMain[0];
  progress.activities[activity.id] = { answers: Object.fromEntries(activityGaps(activity).map(gap => [gap.id, gap.answers[0].form])) };
  assert.equal(achievementMetrics(progress).mainCompleted, 0);
  assert.equal(badge(progress, 'first-check').earned, false);
});

test('a fully answered zero-point attempt completes practice without an accuracy award', () => {
  const progress = emptyProgress();
  const activity = automaticMain[0];
  progress.activities[activity.id] = checked(activity);
  const result = calculateAchievements(progress);
  assert.equal(result.summary.practiceCompleted, 1);
  assert.equal(badge(progress, 'first-complete').earned, true);
  assert.equal(badge(progress, 'first-practice').earned, true);
  assert.equal(badge(progress, 'first-perfect').earned, false);
});

test('writing completion needs all six nonempty answers and all six model comparisons', () => {
  const state = completedWriting();
  assert.equal(isWritingComplete(writing, state), true, 'closed comparison keys still count');
  assert.equal(Object.keys(state.self).some(key => key.endsWith(':form') || key.endsWith(':meaning')), false);
  state.answers[writing.items[0].id] = '  ';
  assert.equal(isWritingComplete(writing, state), false);
  state.answers[writing.items[0].id] = writing.items[0].model;
  delete state.self[writing.items[5].id + ':open'];
  assert.equal(isWritingComplete(writing, state), false);
  assert.equal(isWritingComplete(automaticMain[0], state), false);
});

test('writing with honest zero self-assessment earns completion and model comparison badges', () => {
  const progress = emptyProgress();
  progress.activities[writing.id] = completedWriting();
  const result = calculateAchievements(progress);
  assert.equal(result.summary.writingCompleted, true);
  assert.equal(result.summary.mainCompleted, 1);
  assert.equal(result.summary.writingAnswers, 6);
  assert.equal(result.summary.writingModelsCompared, 6);
  assert.equal(badge(progress, 'writing-models').earned, true);
  assert.equal(badge(progress, 'first-practice').earned, true);
  assert.equal(badge(progress, 'first-perfect').earned, false);
});

test('persisted writing completion survives later edits to answers and model panels', () => {
  const progress = emptyProgress();
  const state = { ...completedWriting(), completed: true };
  progress.activities[writing.id] = state;
  state.answers = {};
  state.self = {};
  assert.equal(isWritingComplete(writing, state), true);
  assert.equal(achievementMetrics(progress).writingCompleted, true);
  assert.equal(achievementMetrics(progress).practiceCompleted, 1);
  assert.equal(badge(progress, 'writing-models').earned, true, 'completed writing certifies that all six models were already compared');
  assert.equal(isWritingComplete(automaticMain[0], state), false, 'automatic activities still use their own completion rule');
});

test('all automatic main activities still need guided writing for complete course coverage', () => {
  const progress = emptyProgress();
  for (const activity of automaticMain) progress.activities[activity.id] = checked(activity);
  assert.equal(achievementMetrics(progress).mainCompleted, automaticMain.length);
  assert.equal(badge(progress, 'progress-test-ready').earned, false);
  assert.equal(badge(progress, 'all-practice').earned, false);
  progress.activities[writing.id] = completedWriting();
  const result = calculateAchievements(progress);
  assert.equal(result.summary.mainCompleted, courseTotal);
  assert.equal(result.summary.mainPercent, 100);
  assert.equal(result.summary.optionalCompleted, 0);
  assert.equal(badge(progress, 'progress-test-ready').earned, true);
  assert.equal(badge(progress, 'all-practice').earned, true);
  assert.equal(badge(progress, 'all-stories').earned, true);
  assert.equal(badge(progress, 'all-optional').earned, false);
  assert.equal(badge(progress, 'first-perfect').earned, false, '100% completion does not mean 100% accuracy');
});

test('optional challenges have separate milestones and cannot advance main completion', () => {
  const progress = emptyProgress();
  for (const activity of extras) progress.activities[activity.id] = checked(activity, { correct: true });
  const result = calculateAchievements(progress);
  assert.equal(result.summary.optionalCompleted, extras.length);
  assert.equal(result.summary.mainCompleted, 0);
  assert.equal(result.summary.mainPercent, 0);
  assert.equal(result.summary.storiesCompleted, 0);
  assert.equal(badge(progress, 'first-optional').earned, true);
  assert.equal(badge(progress, 'all-optional').earned, true);
  assert.equal(badge(progress, 'five-perfect').earned, true);
  assert.equal(badge(progress, 'progress-test-ready').earned, false);
});

test('Start, Build and Stretch group awards require every story in their own group', () => {
  const progress = emptyProgress();
  for (const activity of stories.filter(item => item.level === 'Build')) progress.activities[activity.id] = checked(activity);
  assert.equal(badge(progress, 'build-stories').earned, true);
  assert.equal(badge(progress, 'start-stories').earned, false);
  assert.equal(badge(progress, 'stretch-stories').earned, false);
  assert.equal(badge(progress, 'five-stories').earned, true);
  assert.equal(badge(progress, 'ten-stories').earned, false);
});

test('accuracy awards require exact full totals and completed automatic work', () => {
  const progress = emptyProgress();
  const activity = automaticMain[0];
  const total = activityGaps(activity).length;
  progress.activities[activity.id] = { completed: false, best: { points: total, total, percent: 100 } };
  assert.equal(badge(progress, 'first-perfect').earned, false);
  progress.activities[activity.id].completed = true;
  assert.equal(badge(progress, 'first-perfect').earned, true);
  progress.activities[activity.id].best = { points: 1, total: 1, percent: 100 };
  assert.equal(badge(progress, 'first-perfect').earned, false, 'a mismatched denominator cannot produce a perfect-activity award');
  progress.activities[activity.id].best = { points: total - 0.5, total, percent: 100 };
  assert.equal(badge(progress, 'first-perfect').earned, false, 'a rounded percentage is not a perfect score');
});

test('historical completion and a best perfect score survive a later partial revision', () => {
  const progress = emptyProgress();
  const activity = automaticMain[0];
  const first = checked(activity, { correct: true });
  const answers = {};
  progress.activities[activity.id] = recordAttempt({ ...first, answers }, gradeActivity(activity, answers));
  assert.equal(badge(progress, 'first-complete').earned, true);
  assert.equal(badge(progress, 'first-perfect').earned, true);
});

test('parsed legacy scores migrate as complete while explicit partial completion stays false', () => {
  const first = automaticMain[0];
  const second = automaticMain[1];
  const score = activity => ({ points: 0, total: activityGaps(activity).length, percent: 0 });
  const progress = parseProgress(JSON.stringify({ version: 1, activities: {
    [first.id]: { first: score(first), answers: {}, attempts: 1 },
    [second.id]: { first: score(second), answers: {}, attempts: 1, completed: false, submittedNonempty: false }
  } }));
  assert.equal(achievementMetrics(progress).mainCompleted, 1);
  assert.equal(progress.activities[first.id].completed, true);
  assert.equal(progress.activities[second.id].completed, false);
});

test('numeric milestones use distinct completed activities rather than attempt counts', () => {
  const progress = emptyProgress();
  const halfwayTarget = Math.ceil(courseTotal / 2);
  const chosen = [...exercises.filter(item => item.kind !== 'writing').slice(0, 5), ...stories.slice(0, halfwayTarget - 5)];
  for (const activity of chosen) progress.activities[activity.id] = { ...checked(activity), attempts: 50 };
  assert.equal(badge(progress, 'three-complete').earned, true);
  assert.equal(badge(progress, 'five-practice').earned, true);
  assert.equal(badge(progress, 'halfway').earned, true);
  assert.equal(achievementMetrics(progress).mainCompleted, halfwayTarget);
  delete progress.activities[chosen.at(-1).id];
  assert.equal(badge(progress, 'halfway').earned, false);
});

test('calculation leaves the saved answers and score history unchanged', () => {
  const progress = emptyProgress();
  progress.activities[stories[0].id] = checked(stories[0], { correct: true });
  progress.activities[writing.id] = completedWriting();
  const before = JSON.stringify(progress);
  calculateAchievements(progress);
  assert.equal(JSON.stringify(progress), before);
});
