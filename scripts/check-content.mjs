import { fileURLToPath } from 'node:url';
import { stories } from '../dist/content/stories.js';
import { exercises } from '../dist/content/exercises.js';
import { guideSections } from '../dist/content/guide.js';
import { activityGaps, fillTokens } from '../dist/engine.js';
import { diagramData } from '../dist/visuals.js';
import { connectorReference } from '../dist/content/connector-reference.js';
import { plainText } from '../dist/formatting.js';

export function wordCount(story) {
  return fillTokens(story.text, story.gaps).replace(/\[\[([^|]+)\|[^\]]+\]\]/g, '$1').trim().split(/\s+/u).length;
}
export function validateContent() {
  const errors = [];
  const assert = (test, message) => { if (!test) errors.push(message); };
  assert(stories.length === 21, 'The expanded collection requires 21 stories.');
  assert(exercises.length === 14, 'The expanded collection requires 14 exercise blocks.');
  assert(guideSections.length === 10, 'The expanded collection requires ten guide chapters.');
  assert(exercises.filter(item => item.kind === 'writing').flatMap(item => item.items).length === 6, 'Exactly six writing prompts are required.');
  assert(exercises.filter(item => item.kind !== 'writing').flatMap(activityGaps).length === 124, 'The exercise blocks require 124 objective answers.');
  assert(stories.flatMap(activityGaps).length === 222, 'The stories require 222 core past-tense gaps.');
  const guideIds = new Set(guideSections.map(section => section.id));
  const exerciseIds = new Set(exercises.map(item => item.id));
  const used = new Set();
  const feedbackUsed = new Set();
  // Authoring markers are allowed only around language mentioned in English.
  // They must never change the forms compared by the grader or Spanish texts.
  function checkLanguageMarkup(value, label, key = '') {
    if (typeof value === 'string' && /\{\/?es\}/.test(value)) {
      assert(!['form','text','spanish','options','model','variants','target'].includes(key), label + ': language markers must not alter Spanish answer data.');
      let open = false;
      let from = 0;
      for (const match of value.matchAll(/\{\/?es\}/g)) {
        if (match[0] === '{es}') {
          assert(!open, label + ': nested Spanish language marker.');
          open = true;
          from = match.index + match[0].length;
        } else {
          assert(open, label + ': unmatched closing language marker.');
          assert(value.slice(from, match.index).trim().length > 0, label + ': empty Spanish language marker.');
          open = false;
        }
      }
      assert(!open, label + ': unclosed Spanish language marker.');
    } else if (Array.isArray(value)) value.forEach((item, index) => checkLanguageMarkup(item, `${label}[${index}]`, key));
    else if (value && typeof value === 'object') for (const [childKey, child] of Object.entries(value)) checkLanguageMarkup(child, label + '.' + childKey, childKey);
  }
  checkLanguageMarkup({ exercises, stories, guideSections, connectorReference, diagramData }, 'Content');
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
        assert(['imperfect','preterite','present','perfect','imperative','narrative'].includes(answer.tense), gap.id + ': invalid language target.');
        if (isCore) assert(['imperfect','preterite'].includes(answer.tense), gap.id + ': core stories must practise the two past tenses.');
        assert(typeof answer.feedback === 'string' && plainText(answer.feedback).length >= 45, gap.id + ': feedback must explain the context.');
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
    const [min, max] = story.wordRange || (index < 5 ? [70,100] : index < 10 ? [100,140] : [140,180]);
    assert(story.gaps.length === expected, story.id + ': incorrect number of gaps.');
    const count = wordCount(story);
    assert(count >= min && count <= max, `${story.id}: ${count} words; expected ${min}–${max}.`);
    checkActivity(story, story.id, true);
    if (index >= 10) {
      assert(story.extra?.gaps.length === 2, story.id + ': two optional answers required.');
      if (story.extra) checkActivity({ ...story.extra, guide: 'forms' }, story.id + '-extra');
    } else assert(!story.extra, story.id + ': optional extensions start with the Stretch stories.');
    if (['story-14','story-15','story-19','story-20'].includes(story.id)) assert(story.note?.toLowerCase().includes('fictional') && story.sources?.length > 0, story.id + ': distinguish history from fiction and supply sources.');
    if (index >= 15) {
      assert(story.units?.length > 0 && story.units.every(unit => [8,9,10].includes(unit)), story.id + ': declare course-unit alignment.');
      assert(story.focus?.length >= 3, story.id + ': declare its language objectives.');
      assert(story.text.includes('[['), story.id + ': include contextual support for less familiar vocabulary.');
    }
  });
  guideSections.forEach(section => {
    assert(section.blocks.length >= 3, section.id + ': chapter needs developed explanations.');
    section.practice.forEach(id => assert(exerciseIds.has(id), section.id + ': broken practice link ' + id));
  });
  const guideDiagrams = guideSections.flatMap(section => [...(section.diagram ? [section.diagram] : []), ...(section.diagrams || [])]);
  assert(guideDiagrams.length === 6 && new Set(guideDiagrams).size === 6, 'Six distinct interactive guide diagrams are required.');
  for (const id of guideDiagrams) assert(Boolean(diagramData[id]), 'Unknown guide diagram: ' + id);
  const progressiveGuide = guideSections.find(section => section.id === 'past-progressive');
  assert(progressiveGuide?.diagrams?.includes('progressive-conversation') && progressiveGuide?.diagrams?.includes('progressive-painting'), 'The progressive chapter needs both new illustrated comparisons.');
  assert(connectorReference.groups.length === 9, 'The quick reference requires nine connector groups.');
  assert(connectorReference.rows.length === 45, 'The quick reference requires 45 connector rows.');
  assert(connectorReference.columns.length === 4, 'The reference needs expression, meaning, purpose and usage columns.');
  const connectorGroups = new Set(connectorReference.groups.map(group => group.id));
  assert(connectorGroups.size === connectorReference.groups.length, 'Connector group identifiers must be unique.');
  assert(new Set(connectorReference.rows.map(row => row.spanish)).size === connectorReference.rows.length, 'Connector expressions must not be repeated in separate rows.');
  for (const group of connectorReference.groups) {
    assert(Boolean(group.spanish && group.english), group.id + ': bilingual group headings required.');
    assert(connectorReference.rows.some(row => row.group === group.id), group.id + ': empty connector group.');
  }
  for (const row of connectorReference.rows) {
    assert(connectorGroups.has(row.group), row.spanish + ': unknown connector group.');
    for (const field of ['spanish','english','useEs','useEn','pattern','example']) assert(typeof row[field] === 'string' && row[field].trim().length > 0, row.spanish + ': missing reference field ' + field);
  }
  const anecdoteExplanation = guideSections.find(section => section.id === 'story-tools')?.blocks[0].body || '';
  assert(anecdoteExplanation.includes('{es}Una vez{/es}') && anecdoteExplanation.includes('{es}un día{/es}'), 'The opening explanation must identify both Spanish occasion markers explicitly.');
  for (const [id, count] of [['story-connectors',12],['time-and-change',10],['progressive-past',12],['voices-and-reactions',10]]) {
    const activity = exercises.find(item => item.id === id);
    assert(activityGaps(activity || {}).length === count, id + ': incorrect revision-block size.');
    assert(activity?.units?.length > 0, id + ': declare course-unit alignment.');
    for (const gap of activityGaps(activity || {})) {
      if (gap.options) for (const option of gap.options) assert(gap.answers.some(answer => answer.form === option) || gap.wrongAnswers?.some(answer => answer.form === option && plainText(answer.feedback).length >= 35), gap.id + ': each distractor needs its own meaning-based feedback.');
    }
  }
  return { errors, storyWords: stories.map(story => ({ id: story.id, words: wordCount(story) })), objectiveGaps: used.size };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const report = validateContent();
  console.log(`Content: ${guideSections.length} guide chapters · ${exercises.length} blocks · ${stories.length} stories · ${report.objectiveGaps} objective answers (including ${stories.flatMap(story => story.extra?.gaps || []).length} optional).`);
  console.log(report.storyWords.map(item => `${item.id}: ${item.words} words`).join('\n'));
  if (report.errors.length) { console.error(report.errors.join('\n')); process.exitCode = 1; }
  else console.log('All content checks passed.');
}
