import { exercises } from './content/exercises.js';
import { stories } from './content/stories.js';
import { activityGaps, normalize } from './engine.js';

const writing = exercises.find(activity => activity.kind === 'writing');
const automaticPractice = exercises.filter(activity => activity.kind !== 'writing');
const automaticMain = [...automaticPractice, ...stories];
const optionalActivities = stories.filter(activity => activity.extra).map(activity => ({
  ...activity.extra, id: activity.id + '-extra'
}));
const allAutomatic = [...automaticMain, ...optionalActivities];

/** A closed comparison still counts: the learner may honestly award themselves zero. */
export function isWritingComplete(activity, state = {}) {
  if (activity?.kind !== 'writing' || !activity.items?.length) return false;
  if (state.completed === true) return true;
  return activity.items.every(item => normalize(state.answers?.[item.id]) &&
    Object.hasOwn(state.self || {}, item.id + ':open'));
}

function entry(progress, id) {
  const state = progress?.activities?.[id];
  return state && typeof state === 'object' && !Array.isArray(state) ? state : {};
}
function complete(progress, activity) {
  const state = entry(progress, activity.id);
  return activity.kind === 'writing' ? isWritingComplete(activity, state) : state.completed === true;
}
function submitted(state) {
  if (state.submittedNonempty === true || state.completed === true) return true;
  // An explicit flag records what was actually checked. A later unsubmitted
  // draft must not turn a previous blank check into a nonempty submission.
  if (Object.hasOwn(state, 'submittedNonempty')) return false;
  // Older saved scores may predate the persistent submission flag. A blank,
  // zero-point check is deliberately insufficient evidence of a submission.
  if (['first', 'best', 'latest'].some(key => Number.isFinite(state[key]?.points) && state[key].points > 0)) return true;
  const wasChecked = state.attempts > 0 || state.checked === true || Boolean(state.first || state.latest);
  return wasChecked && Object.values(state.answers || {}).some(value => normalize(value));
}
function perfect(progress, activity) {
  const state = entry(progress, activity.id);
  const total = activityGaps(activity).length;
  return state.completed === true && total > 0 && state.best?.total === total && state.best?.points === total;
}

/** Use progress returned by parseProgress so legacy completion is migrated once. */
export function achievementMetrics(progress) {
  const practiceCompleted = exercises.filter(activity => complete(progress, activity)).length;
  const storiesCompleted = stories.filter(activity => complete(progress, activity)).length;
  const writingState = entry(progress, writing.id);
  const mainCompleted = practiceCompleted + storiesCompleted;
  const mainTotal = exercises.length + stories.length;
  return {
    mainTotal,
    mainCompleted,
    mainPercent: Math.round(mainCompleted / mainTotal * 100),
    automaticTotal: automaticMain.length,
    automaticCompleted: automaticMain.filter(activity => complete(progress, activity)).length,
    practiceTotal: exercises.length,
    practiceCompleted,
    storyTotal: stories.length,
    storiesCompleted,
    startStoriesCompleted: stories.filter(activity => activity.level === 'Start' && complete(progress, activity)).length,
    buildStoriesCompleted: stories.filter(activity => activity.level === 'Build' && complete(progress, activity)).length,
    stretchStoriesCompleted: stories.filter(activity => activity.level === 'Stretch' && complete(progress, activity)).length,
    writingCompleted: isWritingComplete(writing, writingState),
    writingAnswers: writing.items.filter(item => normalize(writingState.answers?.[item.id])).length,
    writingModelsCompared: writingState.completed === true ? writing.items.length : writing.items.filter(item => Object.hasOwn(writingState.self || {}, item.id + ':open')).length,
    optionalTotal: optionalActivities.length,
    optionalCompleted: optionalActivities.filter(activity => complete(progress, activity)).length,
    submittedActivities: allAutomatic.filter(activity => submitted(entry(progress, activity.id))).length,
    perfectActivities: allAutomatic.filter(activity => perfect(progress, activity)).length
  };
}

const definitions = [
  ['first-check', 'First answer checked', 'Check at least one non-empty answer in an automatically marked activity.', 'submittedActivities', 1],
  ['first-complete', 'First activity completed', 'Answer every gap and check one main automatically marked activity. Accuracy is scored separately.', 'automaticCompleted', 1],
  ['three-complete', 'Three activities completed', 'Complete three of the 25 main activities. The guided writing block counts when all six answers have been compared with their models.', 'mainCompleted', 3],
  ['first-practice', 'First practice block completed', 'Complete one practice block, including all its answers. Guided writing also counts.', 'practiceCompleted', 1],
  ['five-practice', 'Five practice blocks completed', 'Complete five of the ten practice blocks.', 'practiceCompleted', 5],
  ['all-practice', 'Practice collection completed', 'Complete all ten practice blocks, including six written answers and their model comparisons.', 'practiceCompleted', 10],
  ['first-story', 'First story completed', 'Answer every main gap in one story and check your answers. Optional challenges have separate scores.', 'storiesCompleted', 1],
  ['start-stories', 'Start stories completed', 'Complete all five stories in the Start group.', 'startStoriesCompleted', 5],
  ['build-stories', 'Build stories completed', 'Complete all five stories in the Build group.', 'buildStoriesCompleted', 5],
  ['stretch-stories', 'Stretch stories completed', 'Complete all five stories in the Stretch group. Their optional challenges are not required.', 'stretchStoriesCompleted', 5],
  ['five-stories', 'Five stories completed', 'Complete the main gaps in any five stories.', 'storiesCompleted', 5],
  ['ten-stories', 'Ten stories completed', 'Complete the main gaps in any ten stories.', 'storiesCompleted', 10],
  ['all-stories', 'Story collection completed', 'Complete the main gaps in all 15 stories.', 'storiesCompleted', 15],
  ['writing-models', 'Six writing models compared', 'Open the model comparison for all six guided writing prompts after writing your answers. Your self-assessed score remains separate.', 'writingModelsCompared', 6],
  ['first-perfect', 'First score of 100%', 'Earn 100% in one fully answered, automatically marked activity. Optional challenges also count; self-assessed writing does not.', 'perfectActivities', 1],
  ['five-perfect', 'Five scores of 100%', 'Earn 100% in five fully answered, automatically marked activities. Optional challenges also count; your best review scores count.', 'perfectActivities', 5],
  ['first-optional', 'First optional challenge completed', 'Answer both gaps and check one optional story challenge. It has its own score.', 'optionalCompleted', 1],
  ['all-optional', 'Optional challenges completed', 'Complete all five optional story challenges. They are additional practice and do not affect the main completion percentage.', 'optionalCompleted', 5],
  ['halfway', 'More than halfway', 'Complete at least 13 of the 25 main activities.', 'mainCompleted', 13],
  ['progress-test-ready', 'Listo para la prueba de progreso 2', 'Complete 100% of the 25 main activities: all ten practice blocks and 15 stories. Accuracy is shown separately; optional challenges are not required.', 'mainCompleted', 25]
];

export const achievementDefinitions = Object.freeze(definitions.map(([id, title, description, metric, target], position) => Object.freeze({
  id, title, description, metric, target, index: position + 1,
  asset: 'assets/achievements/badge' + String(position + 1).padStart(2, '0') + '.png'
})));

/** Completion and accuracy are independent; partial and blank checks cannot complete an activity. */
export function calculateAchievements(progress) {
  const summary = achievementMetrics(progress);
  const achievements = achievementDefinitions.map(({ metric, ...definition }) => {
    const current = summary[metric];
    return { ...definition, current, earned: current >= definition.target };
  });
  return {
    achievements,
    summary: { ...summary, earnedCount: achievements.filter(achievement => achievement.earned).length, achievementTotal: achievements.length }
  };
}
