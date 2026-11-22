import { fileURLToPath } from 'node:url';
import { stories } from '../dist/content/stories.js';
import { exercises } from '../dist/content/exercises.js';
import { guideSections } from '../dist/content/guide.js';
import { activityGaps, fillTokens } from '../dist/engine.js';

export function wordCount(story) {
  return fillTokens(story.text, story.gaps).replace(/\[\[([^|]+)\|[^\]]+\]\]/g, '$1').trim().split(/\s+/u).length;
}
export function validateContent() {
  const errors = [];
  const assert = (test, message) => { if (!test) errors.push(message); };
  assert(stories.length === 15, 'Exactly 15 stories are required.');
  assert(exercises.length === 10, 'Exactly 10 exercise blocks are required.');
  assert(exercises.filter(item => item.kind === 'writing').flatMap(item => item.items).length === 6, 'Exactly six writing prompts are required.');
  assert(exercises.filter(item => item.kind !== 'writing').flatMap(activityGaps).length === 80, 'Exactly 80 objective exercise answers are required.');
  assert(stories.flatMap(activityGaps).length === 150, 'Exactly 150 core story gaps are required.');
  const guideIds = new Set(guideSections.map(section => section.id));
  const exerciseIds = new Set(exercises.map(item => item.id));
  const used = new Set();
  const feedbackUsed = new Set();
  function checkActivity(activity, label, isCore = false) {
    assert(guideIds.has(activity.guide), label + ': unknown guide chapter.');
    const gaps = activityGaps(activity);
    const texts = activity.text ? [activity.text] : (activity.items || []).map(item => item.text);
    const ids = texts.flatMap(text => [...text.matchAll(/\{\{([^}]+)\}\}/g)].map(match => match[1]));
    assert(ids.length === gaps.length && new Set(ids).size === ids.length, label + ': tokens must match gaps one-to-one.');
    for (const gap of gaps) {
      assert(!used.has(gap.id), 'Duplicate gap ID: ' + gap.id); used.add(gap.id);
      assert(ids.includes(gap.id), label + ': missing token ' + gap.id);
      assert(typeof gap.cue === 'string' && gap.cue.length > 3, gap.id + ': missing accessible cue.');
      assert(gap.answers?.length > 0, gap.id + ': missing accepted answer.');
      for (const answer of gap.answers || []) {
        assert(typeof answer.form === 'string' && answer.form.length > 0, gap.id + ': missing form.');
        assert(['imperfect','preterite','present','perfect','imperative'].includes(answer.tense), gap.id + ': invalid tense.');
        if (isCore) assert(['imperfect','preterite'].includes(answer.tense), gap.id + ': core stories must practise the two past tenses.');
        assert(typeof answer.feedback === 'string' && answer.feedback.length >= 45, gap.id + ': feedback must explain the context.');
        assert(!feedbackUsed.has(answer.feedback), gap.id + ': repeated feedback needs a contextual explanation.'); feedbackUsed.add(answer.feedback);
        if (gap.options) assert(gap.options.includes(answer.form), gap.id + ': answer is not one of the options.');
      }
      for (const text of texts) {
        const stripped = text.replace(/\[\[[^|]+\|[^\]]+\]\]/g, '');
        assert(!stripped.includes('[['), label + ': malformed glossary markup.');
      }
    }
  }
  exercises.filter(item => item.kind !== 'writing').forEach(item => checkActivity(item, item.id));
  stories.forEach((story, index) => {
    const expected = index < 5 ? 8 : index < 10 ? 10 : 12;
    const [min, max] = index < 5 ? [70,100] : index < 10 ? [100,140] : [140,180];
    assert(story.gaps.length === expected, story.id + ': incorrect number of gaps.');
    const count = wordCount(story);
    assert(count >= min && count <= max, `${story.id}: ${count} words; expected ${min}–${max}.`);
    checkActivity(story, story.id, true);
    if (index >= 10) {
      assert(story.extra?.gaps.length === 2, story.id + ': two optional answers required.');
      if (story.extra) checkActivity({ ...story.extra, guide: 'forms' }, story.id + '-extra');
    } else assert(!story.extra, story.id + ': optional extensions belong to the final five stories.');
    if (index >= 13) assert(story.note?.includes('fictional') && story.sources?.length > 0, story.id + ': distinguish history from fiction and supply sources.');
  });
  guideSections.forEach(section => {
    assert(section.blocks.length >= 3, section.id + ': chapter needs developed explanations.');
    section.practice.forEach(id => assert(exerciseIds.has(id), section.id + ': broken practice link ' + id));
  });
  assert(guideSections.filter(section => section.diagram).length === 4, 'Four interactive guide diagrams are required.');
  return { errors, storyWords: stories.map(story => ({ id: story.id, words: wordCount(story) })), objectiveGaps: used.size };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const report = validateContent();
  console.log(`Content: 8 guide chapters · 10 blocks · 15 stories · ${report.objectiveGaps} objective answers (including 10 optional).`);
  console.log(report.storyWords.map(item => `${item.id}: ${item.words} words`).join('\n'));
  if (report.errors.length) { console.error(report.errors.join('\n')); process.exitCode = 1; }
  else console.log('All content checks passed.');
}
