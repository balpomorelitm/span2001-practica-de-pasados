/** Pure grading and progress functions. No browser or network dependencies. */
export const CONTENT_VERSION = 1;
export const STORAGE_KEY = 'perspectiva.progress.v1';
export const tenseNames = { imperfect: 'Imperfecto', preterite: 'Indefinido', present: 'Presente', perfect: 'Pretérito perfecto', imperative: 'Imperativo afirmativo', narrative: 'Narrative language' };
const contentRevisions = { 'story-02': 2, 'story-03': 2, 'story-07': 2, 'story-08': 2, 'story-10': 2, 'story-11': 2, 'story-15': 2 };
// Only the goals whose required language has changed are cleared. The rest of
// the learner's answers, and every unaffected activity, remain available.
const revisedGaps = {
  'story-02': ['s02g1'], 'story-03': ['s03g4','s03g8'],
  'story-07': ['s07g5','s07g10'], 'story-08': ['s08g7'],
  'story-10': ['s10g7','s10g8'], 'story-11': ['s11g2'], 'story-15': ['s15g7']
};
function contentRevisionFor(id) { return Object.hasOwn(contentRevisions, id) ? contentRevisions[id] : 1; }

export function normalize(value) {
  return String(value ?? '').normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('es');
}
function withoutAcute(value) {
  return value.replace(/[áéíóú]/g, letter => ({ á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' })[letter]);
}
export function gradeGap(gap, value) {
  const input = normalize(value);
  if (!input) return { status: 'empty', points: 0, label: 'Not answered · incorrect', feedback: `No answer: this counts as incorrect (0 points). The expected answer is ${gap.answers[0].form}. ${gap.answers[0].feedback}`, answer: gap.answers[0] };
  const exact = gap.answers.find(answer => normalize(answer.form) === input);
  if (exact) return { status: 'correct', points: 1, label: gap.answers.length > 1 ? 'Correct · a valid reading' : 'Correct', feedback: exact.feedback, answer: exact };
  const accent = !gap.options && gap.answers.find(answer => withoutAcute(normalize(answer.form)) === withoutAcute(input));
  if (accent) return { status: 'accent', points: 0.5, label: 'Almost · check the accent', feedback: `The expected spelling is ${accent.form}. This is an accent-only error (½ point). ${accent.feedback}`, answer: accent };
  const known = gap.wrongAnswers?.find(answer => normalize(answer.form) === input);
  return { status: 'incorrect', points: 0, label: known ? ({ tense: 'Reconsider the tense', person: 'Check the person', form: 'Check the conjugation', meaning: 'Check the meaning' }[known.kind] || 'Try again') : 'Revisit this answer', feedback: known?.feedback || gap.answers[0].feedback, answer: gap.answers[0] };
}
export function activityGaps(activity) {
  return activity.gaps || (activity.items || []).flatMap(item => item.gaps || []);
}
export function gradeActivity(activity, answers) {
  const gaps = activityGaps(activity);
  const results = Object.fromEntries(gaps.map(gap => [gap.id, gradeGap(gap, answers[gap.id])]));
  const points = Object.values(results).reduce((sum, result) => sum + result.points, 0);
  return { complete: gaps.every(gap => normalize(answers[gap.id])), points, total: gaps.length, percent: gaps.length ? Math.round(points / gaps.length * 1000) / 10 : 0, results };
}
export function emptyProgress() { return { version: CONTENT_VERSION, activities: {} }; }
export function parseProgress(raw) {
  try {
    const saved = JSON.parse(raw);
    if (saved?.version !== CONTENT_VERSION || !saved.activities || typeof saved.activities !== 'object' || Array.isArray(saved.activities)) return emptyProgress();
    // Keep only known state shapes. Stored answer text is never rendered as HTML.
    for (const [id, entry] of Object.entries(saved.activities)) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) { delete saved.activities[id]; continue; }
      entry.answers = Object.fromEntries(Object.entries(entry.answers || {}).filter(([, value]) => typeof value === 'string'));
      entry.self = entry.self && typeof entry.self === 'object' && !Array.isArray(entry.self) ? entry.self : {};
      for (const field of ['first', 'best', 'latest']) {
        const score = entry[field];
        if (score && (!Number.isFinite(score.points) || !Number.isFinite(score.total) || score.points < 0 || score.points > score.total || score.total <= 0)) delete entry[field];
        else if (score) entry[field] = { points: score.points, total: score.total, percent: Math.round(score.points / score.total * 1000) / 10 };
      }
      entry.attempts = Number.isSafeInteger(entry.attempts) && entry.attempts >= 0 ? entry.attempts : 0;
      // Earlier versions only recorded a score after every gap was answered.
      // An explicit false now distinguishes a partial check from that legacy state.
      entry.completed = Object.hasOwn(entry, 'completed') ? entry.completed === true : Boolean(entry.first);
      entry.submittedNonempty = Object.hasOwn(entry, 'submittedNonempty') ? entry.submittedNonempty === true : Boolean(entry.first) && (entry.completed || Object.values(entry.answers).some(normalize));
      for (const flag of ['checked','dirty','revealed','everRevealed','contentUpdated']) entry[flag] = entry[flag] === true;
      const previousRevision = Number.isSafeInteger(entry.contentRevision) && entry.contentRevision > 0 ? entry.contentRevision : 1;
      if (Object.hasOwn(revisedGaps, id) && previousRevision < contentRevisionFor(id)) {
        // Revised tense or progressive targets need a new score, without
        // invalidating work against questions that have stayed the same.
        for (const gapId of revisedGaps[id]) delete entry.answers[gapId];
        for (const field of ['first', 'best', 'latest']) entry[field] = null;
        entry.attempts = 0;
        for (const flag of ['checked','dirty','revealed','everRevealed','completed','submittedNonempty']) entry[flag] = false;
        entry.contentUpdated = true;
      }
      entry.contentRevision = contentRevisionFor(id);
    }
    return saved;
  } catch { return emptyProgress(); }
}
export function entryFor(progress, id) {
  if (!Object.hasOwn(progress.activities, id)) progress.activities[id] = { answers: {}, self: {}, first: null, best: null, latest: null, revealed: false, attempts: 0, completed: false, submittedNonempty: false, contentRevision: contentRevisionFor(id), contentUpdated: false };
  return progress.activities[id];
}
export function recordAttempt(previous, grade) {
  const score = { points: grade.points, total: grade.total, percent: grade.percent };
  return { ...previous, first: previous.first || score, best: !previous.best || score.points > previous.best.points ? score : previous.best, latest: score, attempts: (previous.attempts || 0) + 1, checked: true, completed: previous.completed === true || grade.complete === true, submittedNonempty: previous.submittedNonempty === true || grade.complete === true || Object.values(grade.results || {}).some(result => result.status !== 'empty'), contentUpdated: false };
}
export function assessWriting(items, self) {
  const total = items.length * 2;
  const points = items.reduce((sum, item) => sum + (self[item.id + ':form'] === true ? 1 : 0) + (self[item.id + ':meaning'] === true ? 1 : 0), 0);
  return { points, total, percent: total ? Math.round(points / total * 100) : 0 };
}
export function fillTokens(text, gaps) {
  return text.replace(/\{\{([^}]+)\}\}/g, (_, id, offset, source) => {
    const form = gaps.find(gap => gap.id === id)?.answers[0].form || '';
    const prefix = source.slice(0, offset).trimEnd();
    const beforeOpeningQuote = prefix.replace(/[«“"']$/, '').trimEnd();
    const startsQuotation = /[«“"']$/.test(prefix) && (!beforeOpeningQuote || /[:.!?]$/.test(beforeOpeningQuote));
    return !prefix || /[.!?][»”"']?$/.test(prefix) || startsQuotation ? form.charAt(0).toLocaleUpperCase('es') + form.slice(1) : form;
  });
}
