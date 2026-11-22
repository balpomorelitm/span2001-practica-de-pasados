import { exercises } from './content/exercises.js';
import { stories } from './content/stories.js';
import { guideSections } from './content/guide.js';
import { icon, heroArt, storyArt, diagramArt, diagramData } from './visuals.js';
import { calculateAchievements, isWritingComplete } from './achievements.js';
import { STORAGE_KEY, tenseNames, parseProgress, entryFor, activityGaps, gradeActivity, recordAttempt, assessWriting, normalize, fillTokens } from './engine.js';

const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
let progress;
let storageAvailable = true;
try { progress = parseProgress(localStorage.getItem(STORAGE_KEY)); } catch { progress = parseProgress(null); storageAvailable = false; }
let active = null;
let activeId = '';
let filter = 'All';
let focusedInput = null;
let glossNumber = 0;

let badgeToastTimer;
function checkpointAchievements() {
  const writing = exercises.find(activity => activity.kind === 'writing');
  const writingState = progress.activities[writing.id];
  if (writingState && isWritingComplete(writing, writingState)) writingState.completed = true;
  const collection = calculateAchievements(progress);
  const seen = new Set(Array.isArray(progress.achievementNotified) ? progress.achievementNotified : []);
  const fresh = collection.achievements.filter(badge => badge.earned && !seen.has(badge.id));
  fresh.forEach(badge => seen.add(badge.id));
  progress.achievementNotified = [...seen].filter(id => collection.achievements.some(badge => badge.id === id));
  if (fresh.length) showAchievementToast(fresh);
}
function showAchievementToast(badges) {
  const toast = $('#achievement-toast');
  if (!toast) return;
  const featured = badges.find(badge => badge.id === 'progress-test-ready') || badges.at(-1);
  toast.innerHTML = `<img src="./${featured.asset}" alt="" width="82" height="82"><div><span class="achievement-toast-label">${badges.length === 1 ? 'Achievement unlocked' : badges.length + ' achievements unlocked'}</span><strong ${featured.id === 'progress-test-ready' ? 'lang="es"' : ''}>${esc(featured.title)}</strong>${badges.length > 1 ? `<p>${badges.filter(badge => badge !== featured).slice(0, 2).map(badge => esc(badge.title)).join(' · ')}${badges.length > 3 ? ' · and ' + (badges.length - 3) + ' more' : ''}</p>` : ''}<a href="#/progress">View your medals</a></div><button type="button" data-action="dismiss-achievement" aria-label="Dismiss achievement notification">${icon('close', 17)}</button>`;
  toast.hidden = false;
  clearTimeout(badgeToastTimer);
  badgeToastTimer = setTimeout(() => { if (!toast.contains(document.activeElement)) toast.hidden = true; }, 12000);
}
function achievementCollection(collection) {
  const { achievements, summary } = collection;
  return `<section class="achievement-collection" id="achievements"><div class="section-heading"><div><h2>Your achievements</h2><p>${summary.earnedCount} of 20 medals earned. Each card explains how to unlock it.</p></div><span class="achievement-count">${summary.earnedCount} / 20</span></div><div class="course-completion"><div><strong>Main course completion</strong><span>${summary.mainCompleted} / ${summary.mainTotal} activities · ${summary.mainPercent}%</span></div><progress value="${summary.mainCompleted}" max="${summary.mainTotal}" aria-label="Main course completion">${summary.mainPercent}%</progress><p>Complete all main answers and check them; compare all six writing prompts with their models. Partial checks help you practise, but do not complete an activity. Accuracy and the five optional challenges are tracked separately.</p></div><div class="achievement-grid">${achievements.map(badge => `<article class="achievement-card ${badge.earned ? 'earned' : 'locked'} ${badge.id === 'progress-test-ready' ? 'final-achievement' : ''}"><img src="./${badge.asset}" alt="" width="100" height="100" loading="lazy" decoding="async"><div class="achievement-card-content"><span class="achievement-state">${badge.earned ? '✓ Earned' : 'Locked'}</span><h3 ${badge.id === 'progress-test-ready' ? 'lang="es"' : ''}>${esc(badge.title)}</h3><p>${esc(badge.description)}</p><span class="achievement-step">${Math.min(badge.current, badge.target)} / ${badge.target}</span></div></article>`).join('')}</div></section>`;
}
function persist() {
  checkpointAchievements();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { storageAvailable = false; }
  const notice = $('#storage-notice');
  if (notice && !storageAvailable) { notice.hidden = false; notice.textContent = 'Progress can only be kept for this visit: browser storage is unavailable.'; }
}
function announce(message) { $('#announcer').textContent = message; }
function levelClass(level) { return level.toLowerCase(); }
function progressBadge(id) {
  const saved = progress.activities[id];
  if (saved?.completed) return `<span class="completion">${icon('check', 14)} Completed${saved.first ? ' · First ' + saved.first.percent + '%' : ''}</span>`;
  if (saved?.first) return `<span class="in-progress">Checked · First ${saved.first.percent}%</span>`;
  if (Object.values(saved?.answers || {}).some(Boolean)) return '<span class="in-progress">In progress</span>';
  return '';
}
function tag(text, klass = '') { return `<span class="tag ${klass}">${esc(text)}</span>`; }
function rich(text, gaps = [], state = null, results = null) {
  const pattern = /\[\[([^|\]]+)\|([^\]]+)\]\]|\{\{([^}]+)\}\}/g;
  let output = ''; let from = 0;
  for (const match of text.matchAll(pattern)) {
    output += esc(text.slice(from, match.index));
    if (match[3]) {
      const gap = gaps.find(item => item.id === match[3]);
      output += gap ? gapField(gap, state, results?.[gap.id]) : '<span class="content-error">[missing answer]</span>';
    } else {
      const id = `gloss-${++glossNumber}`;
      output += `<span class="gloss"><button type="button" class="gloss-word" lang="es" aria-expanded="false" aria-describedby="${id}">${esc(match[1])}</button><span class="gloss-tip" lang="en" id="${id}" role="tooltip">${esc(match[2])}</span></span>`;
    }
    from = match.index + match[0].length;
  }
  return (output + esc(text.slice(from))).replace(/\n\n/g, '<span class="paragraph-break" aria-hidden="true"></span>').replace(/\n/g, '<br>');
}
function gapField(gap, state, result) {
  const value = state?.answers?.[gap.id] || '';
  const cue = esc(gap.cue || 'Complete the verb');
  const invalid = result && ['incorrect', 'empty'].includes(result.status);
  const description = `cue-${gap.id}${result ? ' feedback-' + gap.id : ''}`;
  let field;
  if (gap.options) {
    field = `<span class="choice-options" id="${gap.id}" role="radiogroup" tabindex="-1" ${invalid ? 'aria-invalid="true"' : ''} aria-label="${cue}" aria-describedby="${description}">${gap.options.map((option, i) => `<label class="choice-option"><input type="radio" name="${gap.id}" data-answer="${gap.id}" value="${esc(option)}" ${value === option ? 'checked' : ''}><span>${esc(option)}</span></label>`).join('')}</span>`;
  } else {
    const length = Math.max(9, Math.min(19, Math.max(...gap.answers.map(answer => answer.form.length)) + 2));
    field = `<input type="text" id="${gap.id}" data-answer="${gap.id}" lang="es" autocapitalize="off" spellcheck="false" autocomplete="off" aria-label="${cue}" aria-describedby="${description}" ${invalid ? 'aria-invalid="true"' : ''} value="${esc(value)}" style="--field-ch:${length}ch" maxlength="160">`;
  }
  return `<span class="gap ${gap.options ? 'choice-gap' : ''} ${result?.status || ''} ${result?.status === 'empty' ? 'incorrect' : ''}">${field}<span class="gap-cue" id="cue-${gap.id}" lang="en">${cue}${result ? `<span class="field-mark" aria-label="${esc(result.label)}">${result.status === 'correct' ? '✓' : result.status === 'accent' ? '½' : '!'}</span>` : ''}</span></span>`;
}
function guideLink(id, label = 'Revisit the explanation') { return `<a class="text-link" href="#/guide/${esc(id)}">${icon('book', 17)} ${esc(label)}</a>`; }
function pageHeading(eyebrow, title, body, extra = '') {
  return `<section class="page-heading wrap"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${body}</p></div>${extra}</section>`;
}
function exerciseCard(exercise, index) {
  return `<a class="exercise-card" href="#/practice/${exercise.id}"><div class="exercise-icon">${icon(exercise.kind === 'writing' ? 'pen' : index === 8 ? 'eye' : 'book', 26)}</div><div class="exercise-card-body"><div class="card-meta">${tag(exercise.level, levelClass(exercise.level))}<span>${exercise.kind === 'writing' ? '6 writing prompts' : activityGaps(exercise).length + ' answers'}</span></div><h3 lang="es">${esc(exercise.title)}</h3><p>${esc(exercise.description)}</p>${progressBadge(exercise.id)}</div><span class="card-chevron">${icon('chevron', 18)}</span></a>`;
}
function storyCard(story, index) {
  return `<a class="story-card" href="#/stories/${story.id}"><div class="story-art">${storyArt(index)}</div><div class="story-card-body"><div class="card-meta">${tag(story.level, levelClass(story.level))}<span>${story.gaps.length} verbs · ${story.readingMinutes || 2} min read</span></div><h3 lang="es">${esc(story.title)}</h3><p>${esc(story.description)}</p><div class="story-card-bottom"><span class="story-theme">${esc(story.theme || 'Past-tense practice')}</span>${progressBadge(story.id) || `<span>${icon('book', 16)}</span>`}</div></div></a>`;
}
function filters() {
  return `<div class="filter-bar" role="group" aria-label="Filter by difficulty">${['All', 'Start', 'Build', 'Stretch'].map(level => `<button type="button" data-filter="${level}" aria-pressed="${filter === level}" class="filter-button ${filter === level ? 'selected' : ''}">${level === 'All' ? 'All levels' : level}</button>`).join('')}</div>`;
}
function home() {
  return `<section class="course-overview wrap"><div class="course-banner"><div class="course-banner-copy"><div class="course-label"><b>SPAN2001</b><span>Spanish B1</span></div><h1 lang="es">Práctica de pasados</h1><p class="course-subtitle" lang="es">Imperfecto e indefinido</p><p class="course-banner-description" lang="es">Material de práctica del Departamento de Español de la Universidad de Hong Kong. Consulta la guía y completa ejercicios y relatos graduados con corrección individual.</p><div class="hero-actions"><a class="button primary" href="#/guide">Open guide ${icon('book', 18)}</a><a class="button secondary" href="#/practice">Practice exercises</a></div></div><div class="course-banner-art">${heroArt()}</div></div><div class="course-stats"><a class="course-stat" href="#/guide"><span>${icon('book')}</span><div><strong>8</strong><p>Grammar chapters</p></div></a><a class="course-stat" href="#/practice"><span>${icon('pen')}</span><div><strong>10</strong><p>Practice blocks</p></div></a><a class="course-stat" href="#/stories"><span>${icon('story')}</span><div><strong>15</strong><p>Graded stories</p></div></a></div></section>
  <section class="wrap course-section"><div class="section-heading"><div><h2>Grammar reference</h2><p>Explanations, conjugation tables and four interactive comparisons.</p></div><a class="text-link" href="#/guide">Open complete guide ${icon('chevron',16)}</a></div><div class="guide-grid">${guideSections.map((section,i) => `<a class="guide-tile" href="#/guide/${section.id}"><span class="guide-tile-icon">${icon(['eye','story','clock','book','restart','pen','spark','book'][i])} Chapter ${i+1}</span><h3>${esc(section.title)}</h3><p>${esc(section.subtitle)}</p></a>`).join('')}</div></section>
  <section class="wrap course-section"><div class="section-heading"><div><h2>Practice by topic</h2><p>Follow the numbered sequence or choose the grammar you want to practise.</p></div><a class="text-link" href="#/practice">Filter exercises ${icon('filter',16)}</a></div><div class="exercise-grid">${exercises.map(exerciseCard).join('')}</div></section>
  <section class="wrap course-section"><div class="section-heading"><div><h2>Graded stories</h2><p>Fifteen Spanish texts with 150 past-tense answers, from everyday anecdotes to historical accounts.</p></div><a class="text-link" href="#/stories">Filter stories ${icon('filter',16)}</a></div><div class="story-grid">${stories.map(storyCard).join('')}</div></section>
  <section class="wrap course-usage">${icon('info',23)}<div><h2>Using this resource</h2><p>You can check any number of answers. Blank answers count as incorrect (0 points). Each answer receives its own explanation, with accepted alternatives shown in full. Your first score and best review are saved on this device. ${guideLink('perspective','Read about the two past tenses')}</p></div></section>`;
}
function catalog(kind) {
  const isStory = kind === 'stories';
  const collection = isStory ? stories : exercises;
  const selected = collection.filter(item => filter === 'All' || item.level === filter);
  return pageHeading('SPAN2001', isStory ? 'Graded stories' : 'Practice exercises', isStory ? 'Fifteen original Spanish stories in order of difficulty, with individual feedback for every verb.' : 'Ten blocks covering interpretation, conjugation, narrative structure and guided writing.') + `<section class="wrap catalog"><div class="catalog-toolbar">${filters()}<span class="muted" role="status">${selected.length} ${isStory ? 'stories' : 'blocks'}</span></div>${!isStory ? '<div class="notice">'+ icon('info', 20) + '<p><b>How scoring works</b> One point per correct answer, half a point for an accent-only error. You may check incomplete activities; blank answers receive zero points. Your first score is kept; later attempts are guided review. Writing has a separate self-assessed score.</p></div>' : '<div class="notice">'+ icon('eye', 20) + '<p><b>Focus on the two past tenses.</b> The main stories use imperfecto and indefinido. The final five offer a short, separately scored challenge with other forms you know.</p></div>'}<div class="${isStory ? 'story-grid' : 'exercise-grid'}">${selected.map(item => isStory ? storyCard(item, stories.indexOf(item)) : exerciseCard(item, exercises.indexOf(item))).join('')}</div></section>`;
}
function diagram(type) {
  const data = diagramData[type];
  return `<div class="diagram" data-diagram="${type}"><div class="diagram-heading"><span class="eyebrow">Interactive comparison</span><h3>${data.title}</h3></div><div class="segmented" role="group" aria-label="Choose diagram perspective">${data.labels.map((label, i) => `<button type="button" data-mode="${i}" class="${i === 0 ? 'selected' : ''}" aria-pressed="${i === 0}">${label}</button>`).join('')}</div><div class="diagram-content"><div class="diagram-art">${diagramArt(type, 0)}</div><div class="diagram-caption" aria-live="polite"><p lang="es" class="diagram-spanish">${data.sentences[0]}</p><p class="diagram-explanation">${data.captions[0]}</p></div></div></div>`;
}
function guideArticle(section, standalone = false) {
  return `<article class="guide-article" id="chapter-${section.id}"><header><span class="eyebrow">${esc(section.subtitle)}</span><${standalone ? 'h1' : 'h2'}>${esc(section.title)}</${standalone ? 'h1' : 'h2'}><p class="article-lead">${esc(section.intro)}</p></header>${section.diagram ? diagram(section.diagram) : ''}${section.blocks.map(block => `<section class="guide-block"><h3>${esc(block.heading)}</h3><p>${rich(block.body)}</p>${block.table ? `<div class="table-scroll" tabindex="0" role="region" aria-label="${esc(block.heading)} conjugation table"><table><thead><tr>${block.table.headers.map(heading => `<th scope="col">${esc(heading)}</th>`).join('')}</tr></thead><tbody>${block.table.rows.map(row => `<tr>${row.map((cell, i) => i === 0 ? `<th scope="row">${esc(cell)}</th>` : `<td lang="es">${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : ''}${block.examples?.length ? `<div class="example-list">${block.examples.map(example => `<div class="example ${example.tense}"><span class="example-tense">${example.tense === 'mixed' ? 'IN CONTEXT' : (tenseNames[example.tense] || 'EXAMPLE').toUpperCase()}</span><p lang="es">${rich(example.spanish)}</p><span>${esc(example.english)}</span></div>`).join('')}</div>` : ''}${block.tip ? `<div class="teaching-tip">${icon('spark', 20)}<p>${esc(block.tip)}</p></div>` : ''}</section>`).join('')}<div class="practice-links"><span class="eyebrow">Related practice</span><div>${section.practice.map(id => { const exercise = exercises.find(item => item.id === id); return exercise ? `<a class="button secondary small" href="#/practice/${id}" lang="es">${esc(exercise.title)}</a>` : ''; }).join('')}</div><a class="text-link" href="#/stories">Try it in a story ${icon('story', 18)}</a></div>${section.sources?.length ? `<p class="source-note">Further reading: ${section.sources.map(source => `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a>`).join(' · ')}</p>` : ''}</article>`;
}
function guide(id) {
  const section = guideSections.find(item => item.id === id);
  const selected = section ? [section] : guideSections;
  return `<div class="guide-layout wrap"><aside class="guide-sidebar"><a class="sidebar-heading" href="#/guide">${icon('book', 20)} The complete guide</a><nav aria-label="Guide chapters">${guideSections.map(item => `<a href="#/guide/${item.id}" ${item.id === id ? 'aria-current="page"' : ''}>${esc(item.title)}</a>`).join('')}</nav><div class="sidebar-note"><span class="mini-heading">Choosing the tense</span><p>Am I looking inside the situation?<br>Or presenting a whole episode?</p></div></aside><div class="guide-main">${!section ? `<header class="guide-intro"><span class="eyebrow">SPAN2001</span><h1>Grammar guide</h1><p>Eight chapters with examples, conjugation tables, interactive diagrams and links to the relevant exercises.</p></header>` : '<a class="back-link" href="#/guide">The complete guide</a>'}${selected.map(item => guideArticle(item, Boolean(section))).join('')}${section ? `<div class="chapter-pagination">${guideSections.indexOf(section) > 0 ? `<a class="button secondary" href="#/guide/${guideSections[guideSections.indexOf(section) - 1].id}">Previous chapter</a>` : '<span></span>'}${guideSections.indexOf(section) < guideSections.length - 1 ? `<a class="button primary" href="#/guide/${guideSections[guideSections.indexOf(section) + 1].id}">Next chapter</a>` : '<a class="button primary" href="#/practice">Start practising</a>'}</div>` : ''}</div></div>`;
}
function scorePanel(state, grade, self = false) {
  if (self) return `<div class="score-panel self-score"><div><span class="mini-heading">SELF-ASSESSED SCORE</span><strong>${grade.points}<small> / ${grade.total}</small></strong></div><p>Two points per sentence: one for the form, one for the viewpoint.<br>Your wording can differ from the models.</p></div>`;
  if (!state.first) return '';
  return `<div class="score-panel"><div><span class="mini-heading">FIRST SCORE</span><strong>${state.first.points}<small> / ${state.first.total}</small></strong><span>${state.first.percent}%</span></div><div class="score-details"><p><b>Best review:</b> ${state.best?.points ?? state.first.points} / ${state.first.total}</p><p><b>Latest check:</b> ${state.latest?.points ?? state.first.points} / ${state.first.total}</p><p>${state.attempts === 1 ? 'Your first score is saved. You can now review and try again.' : `${state.attempts} checks · further attempts are guided review.`}${state.everRevealed ? ' Solutions have been viewed.' : ''}</p></div></div>`;
}
function feedbackList(activity, grade) {
  return `<section class="feedback-section" id="answer-feedback" tabindex="-1"><div class="section-heading"><div><span class="eyebrow">Answer feedback</span><h2>Feedback for every answer</h2><p>Your choice, the form, and the reason it fits this context.</p></div></div><div class="feedback-list">${activityGaps(activity).map((gap, i) => {
    const result = grade.results[gap.id];
    const submitted = entryFor(progress, activeId).answers[gap.id];
    const alternatives = gap.answers.filter(answer => answer !== result.answer);
    return `<article class="feedback-card ${result.status}" id="feedback-${gap.id}"><div class="feedback-status"><span>${result.status === 'correct' ? icon('check', 18) : result.status === 'accent' ? '½' : icon('info', 18)}</span><span>ANSWER ${i + 1} · ${esc(result.label)}</span><b>${result.points} / 1</b></div><div class="feedback-answer"><span lang="es">${normalize(submitted) ? esc(submitted) : '<span class="unanswered-label" lang="en">Not answered</span>'}</span>${result.status !== 'correct' ? `<span class="expected">Suggested: <b lang="es">${esc(result.answer.form)}</b></span>` : ''}${tag(tenseNames[result.answer.tense] || 'Interpretation', result.answer.tense)}</div><p>${esc(result.feedback)}</p>${alternatives.length ? `<section class="accepted-readings" aria-label="Other valid readings"><h3>Other valid ${alternatives.length === 1 ? 'reading' : 'readings'}</h3>${alternatives.map(answer => `<p><b lang="es">${esc(answer.form)}</b> · ${esc(answer.feedback)}</p>`).join('')}</section>` : ''}${guideLink(activity.guide)}</article>`;
  }).join('')}</div></section>`;
}
function solvedText(activity) {
  const renderText = text => rich(fillTokens(text, activityGaps(activity)));
  return `<section class="solution-panel"><span class="eyebrow">Model answer</span><h3>Completed text</h3><div class="solution-text" lang="es">${activity.text ? renderText(activity.text) : activity.items.map(item => `<p>${renderText(item.text)}</p>`).join('')}</div><p>Where another reading is accepted, its form and explanation appear in the individual feedback. The model above shows one consistent version.</p></section>`;
}
function accentBar() {
  return `<div class="accent-bar"><span>Spanish keyboard</span><div role="group" aria-label="Insert a Spanish character">${['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ', '¿', '¡'].map(letter => `<button type="button" data-character="${letter}" aria-label="Insert ${letter}">${letter}</button>`).join('')}</div></div>`;
}
function activityView(activity, isStory = false, isExtra = false) {
  active = activity;
  activeId = isExtra ? activity.id : activity.id;
  const state = entryFor(progress, activeId);
  const grade = gradeActivity(activity, state.answers);
  const isWriting = activity.kind === 'writing';
  const checked = state.checked && !state.dirty;
  const index = isStory ? stories.indexOf(activity) : exercises.indexOf(activity);
  return `<div class="wrap activity-wrap"><div class="activity-breadcrumb"><a href="#/${isStory || isExtra ? 'stories' : 'practice'}">${isStory || isExtra ? 'The story collection' : 'Practice collection'}</a><span>/</span><span>${isExtra ? 'Optional challenge' : isStory ? 'Story ' + (index + 1) : 'Block ' + (index + 1)}</span></div><header class="activity-heading"><div><div class="card-meta">${tag(activity.level || 'Stretch', levelClass(activity.level || 'Stretch'))}<span>${isWriting ? 'Guided writing · self-assessment' : activityGaps(activity).length + ' answers · individual feedback'}</span></div><h1 lang="${isExtra ? 'en' : 'es'}">${esc(activity.title)}</h1><p>${esc(activity.description || '')}</p></div>${isStory ? `<div class="activity-art">${storyArt(index)}</div>` : `<div class="activity-heading-icon">${icon(isWriting ? 'pen' : isExtra ? 'spark' : 'book', 38)}</div>`}</header><div class="activity-layout"><div class="activity-content"><div class="activity-instructions">${icon('info', 22)}<p>${esc(activity.instruction || 'Complete each blank with the imperfecto or indefinido of the verb in the cue. Read the whole story first. Where more than one reading fits, both receive full credit.')}</p></div>${state.contentUpdated ? '<div class="notice content-update"><p>This story now asks for the kitchen’s location with estar. Your other answers are saved; check this story again for an updated score.</p></div>' : ''}${activity.note ? `<div class="historical-note">${icon('book', 19)}<p>${esc(activity.note)}</p></div>` : ''}<form id="answer-form" novalidate data-activity="${activity.id}">${isWriting ? writingItems(activity, state) : `${activityGaps(activity).some(gap => !gap.options) ? accentBar() : ''}${activity.text ? `<div class="story-passage" lang="es">${rich(activity.text, activityGaps(activity), state, checked ? grade.results : null)}</div>` : `<div class="exercise-items">${activity.items.map((item, i) => `<div class="exercise-item"><span class="item-number" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><div class="item-text" lang="es">${rich(item.text, item.gaps, state, checked ? grade.results : null)}</div></div>`).join('')}</div>`}`}<div id="form-message" role="status" class="form-message"></div>${!isWriting ? `<div class="check-actions"><button class="button primary" type="submit">${icon('check', 20)} ${state.first ? 'Check again' : 'Check answers'}</button><button class="button secondary" type="button" data-action="solutions" ${!state.first ? 'disabled title="Check answers to unlock the model"' : ''}>${icon('eye', 20)} ${state.revealed ? 'Hide model' : 'Show model'}</button><span>1 point correct · ½ accent only · 0 for blanks</span></div>` : ''}</form>${isWriting ? scorePanel(state, assessWriting(activity.items, state.self), true) : scorePanel(state, grade)}${!isWriting && state.dirty && state.first ? '<p class="edited-notice">Your answers have changed. Check again to update the feedback; your first score stays the same.</p>' : ''}${!isWriting && checked ? feedbackList(activity, grade) : ''}${!isWriting && state.revealed ? solvedText(activity) : ''}${activity.sources?.length ? `<div class="source-note">Historical references: ${activity.sources.map(source => `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a>`).join(' · ')}</div>` : ''}${isStory && activity.extra ? `<aside class="extra-invitation"><span class="eyebrow">Optional practice</span><h3>${esc(activity.extra.title)}</h3><p>Try two more answers with other forms you know. This challenge has its own score and does not change your main story score.</p><a class="button secondary" href="#/stories/${activity.id}/extra">Try the optional challenge ${icon('spark', 18)}</a></aside>` : ''}${isExtra ? `<a class="text-link" href="#/stories/${activity.parentId}">Back to the main story</a>` : ''}<div class="activity-pagination">${index > 0 ? `<a class="button secondary" href="#/${isStory ? 'stories' : 'practice'}/${(isStory ? stories : exercises)[index - 1].id}">Previous ${isStory ? 'story' : 'block'}</a>` : '<span></span>'}${index >= 0 && index < (isStory ? stories : exercises).length - 1 ? `<a class="button secondary" href="#/${isStory ? 'stories' : 'practice'}/${(isStory ? stories : exercises)[index + 1].id}">Next ${isStory ? 'story' : 'block'}</a>` : ''}</div></div><aside class="activity-sidebar"><div class="sidebar-box"><span class="eyebrow">Grammar reference</span><h3>Choosing the tense</h3><p>Ask what the speaker is doing: showing a situation from within, or presenting a bounded episode?</p>${guideLink(activity.guide || 'forms', 'Open the relevant chapter')}</div><div class="sidebar-box small-print">${icon('clock', 20)}<p>Your work is saved automatically on this browser. Pause whenever you like.</p></div><p id="storage-notice" class="storage-notice" ${storageAvailable ? 'hidden' : ''}>Browser storage is unavailable. Work is kept for this visit only.</p></aside></div></div>`;
}
function writingItems(activity, state) {
  return `<div class="writing-items">${activity.items.map((item, i) => `<article class="writing-item"><div class="writing-prompt"><span class="item-number">${String(i + 1).padStart(2, '0')}</span><label for="${item.id}" lang="es">${esc(item.text)}</label></div><textarea id="${item.id}" data-answer="${item.id}" lang="es" rows="3" spellcheck="false" placeholder="Escribe tu frase…">${esc(state.answers[item.id] || '')}</textarea><button type="button" class="button secondary small" data-model="${item.id}" ${!normalize(state.answers[item.id]) ? 'disabled' : ''} aria-expanded="${state.self[item.id + ':open'] === true}">Compare with a model</button><div class="writing-model" id="model-${item.id}" ${state.self[item.id + ':open'] !== true ? 'hidden' : ''}><span class="eyebrow">Model answer</span><p class="model-sentence" lang="es">${esc(item.model)}</p><section class="accepted-readings"><h3>Different wording can work</h3>${item.variants.map(variant => `<p lang="es">${esc(variant)}</p>`).join('')}</section><p class="target-verb">Target verb: <b lang="es">${esc(item.target)}</b></p><label class="self-criterion"><input type="checkbox" data-self="${item.id}:form" ${state.self[item.id + ':form'] ? 'checked' : ''}><span><b>Form · 1 point</b>${esc(item.formFeedback)}</span></label><label class="self-criterion"><input type="checkbox" data-self="${item.id}:meaning" ${state.self[item.id + ':meaning'] ? 'checked' : ''}><span><b>Viewpoint · 1 point</b>${esc(item.meaningFeedback)}</span></label>${guideLink(item.guide || activity.guide)}</div></article>`).join('')}</div><p class="self-assessment-note">This score reflects your own comparison. The app does not automatically judge a complete sentence or its word order.</p>`;
}
function progressView() {
  const collection = calculateAchievements(progress);
  const checked = [...exercises, ...stories].filter(item => item.kind !== 'writing' && progress.activities[item.id]?.first);
  const totals = checked.reduce((result, item) => { const first = progress.activities[item.id].first; return { points: result.points + first.points, total: result.total + first.total }; }, { points: 0, total: 0 });
  return pageHeading('SPAN2001', 'Your practice record', 'Your activity completion, scores and achievement medals on this device.') + `<section class="wrap progress-page"><div class="progress-summary"><div><span class="eyebrow">Main activities completed</span><strong>${collection.summary.mainCompleted}<small> / 25</small></strong></div><div><span class="eyebrow">First-attempt points</span><strong>${totals.points}<small> / ${totals.total || '—'}</small></strong></div><div><span class="eyebrow">Medals earned</span><strong>${collection.summary.earnedCount}<small> / 20</small></strong></div></div><div class="notice">${icon('info', 20)}<p>Progress stays on this browser and device. First scores and best review scores are kept separately. A partial check records a score; an activity is completed when all its answers have been checked.</p></div>${achievementCollection(collection)}${['Practice blocks', 'Stories'].map((heading, index) => `<section class="progress-group"><h2>${heading}</h2><div class="progress-table">${(index === 0 ? exercises : stories).map(item => { const state = progress.activities[item.id]; const self = item.kind === 'writing' ? assessWriting(item.items, state?.self || {}) : null; const extra = progress.activities[item.id + '-extra']; const complete = item.kind === 'writing' ? isWritingComplete(item, state || {}) : state?.completed; return `<div class="progress-row"><a lang="es" href="#/${index === 0 ? 'practice' : 'stories'}/${item.id}">${esc(item.title)}<span>${item.level}${complete ? ' · Completed' : state?.first ? ' · Partial check' : ''}${state?.everRevealed ? ' · model viewed' : ''}</span></a><div>${self ? `<span class="score-label">Self-assessed</span><b>${self.points} / ${self.total}</b>` : state?.first ? `<span class="score-label">First ${state.first.percent}%</span><b>${state.first.points} / ${state.first.total}</b>` : `<span class="not-started">${Object.values(state?.answers || {}).some(Boolean) ? 'In progress' : 'Not started'}</span>`}</div><div>${state?.best ? `<span class="score-label">Best review</span><b>${state.best.points} / ${state.best.total}</b>` : ''}${extra?.first ? `<span class="extra-score">Extra: ${extra.first.points} / ${extra.first.total}</span>` : ''}</div></div>`; }).join('')}</div></section>`).join('')}<details class="device-reset"><summary>Start over on this device</summary><p>This clears saved answers, scores and achievement medals on this browser.</p><button type="button" class="button secondary" data-action="request-reset">Clear this browser’s progress</button></details><dialog id="reset-dialog"><h2>Clear your practice record?</h2><p>Your saved answers, scores and medals will be cleared on this browser.</p><div class="hero-actions"><button class="button secondary" data-action="cancel-reset">Keep my progress</button><button class="button primary" data-action="confirm-reset">Clear progress</button></div></dialog></section>`;
}
function render(keepPosition = false) {
  const position = scrollY;
  active = null; activeId = ''; focusedInput = null; glossNumber = 0;
  const [, page = '', id, extra] = location.hash.replace(/^#/, '').split('/');
  let html;
  if (!page) html = home();
  else if (page === 'guide') html = guide(id);
  else if (page === 'progress') html = progressView();
  else if (page === 'practice' && !id) html = catalog('practice');
  else if (page === 'stories' && !id) html = catalog('stories');
  else if (page === 'practice' || page === 'stories') {
    let item = (page === 'stories' ? stories : exercises).find(activity => activity.id === id);
    if (extra === 'extra' && item?.extra) item = { ...item.extra, id: item.id + '-extra', parentId: item.id, level: 'Stretch', guide: 'forms', description: 'A separately scored challenge with other forms you know.', instruction: 'Complete the two answers using the forms requested in the cues. These are optional; your main story score stays the same.' };
    if (item) html = activityView(item, page === 'stories' && extra !== 'extra', extra === 'extra');
  }
  $('#main').innerHTML = html || `<section class="wrap empty-page"><h1>Activity not found</h1><p>This activity could not be found.</p><a class="button primary" href="#/">Back to the collection</a></section>`;
  const title = active?.title || (page === 'guide' ? guideSections.find(section => section.id === id)?.title || 'The complete guide' : { practice: 'Practice', stories: 'Stories', progress: 'My progress' }[page]) || 'Práctica de pasados';
  document.title = `${title} · SPAN2001`;
  document.querySelectorAll('[data-nav]').forEach(link => link.setAttribute('aria-current', link.dataset.nav === page ? 'page' : 'false'));
  if (keepPosition) window.scrollTo({ top: position, behavior: 'instant' });
  else { window.scrollTo({ top: 0, behavior: 'instant' }); $('#main').focus({ preventScroll: true }); }
}

document.addEventListener('input', event => {
  const input = event.target.closest('[data-answer]');
  if (!input || !active) return;
  const state = entryFor(progress, activeId);
  state.answers[input.dataset.answer] = input.value;
  if (active.kind !== 'writing') {
    state.dirty = true;
    input.closest('.gap')?.classList.remove('correct', 'incorrect', 'accent', 'empty');
    input.removeAttribute('aria-invalid');
    const mark = input.closest('.gap')?.querySelector('.field-mark');
    if (mark) mark.remove();
    if (state.first && !$('.edited-notice')) {
      const note = document.createElement('p'); note.className = 'edited-notice'; note.textContent = 'Your answers have changed. Check again to update the feedback; your first score stays the same.';
      $('#answer-form').after(note);
    }
  } else {
    // Editing a sentence invalidates its self-assessment, so its points cannot silently survive a rewrite.
    for (const suffix of ['form', 'meaning']) { state.self[input.dataset.answer + ':' + suffix] = false; const check = document.querySelector(`[data-self="${input.dataset.answer}:${suffix}"]`); if (check) check.checked = false; }
    const button = document.querySelector(`[data-model="${input.dataset.answer}"]`); if (button) button.disabled = !normalize(input.value);
    const panel = $('.self-score'); if (panel) panel.outerHTML = scorePanel(state, assessWriting(active.items, state.self), true);
  }
  persist();
});
document.addEventListener('change', event => {
  if (event.target.matches('select[data-answer]')) event.target.dispatchEvent(new Event('input', { bubbles: true }));
  const checkbox = event.target.closest('[data-self]');
  if (!checkbox || !active) return;
  const state = entryFor(progress, activeId); state.self[checkbox.dataset.self] = checkbox.checked; persist();
  $('.self-score').outerHTML = scorePanel(state, assessWriting(active.items, state.self), true);
});
document.addEventListener('focusin', event => { if (event.target.matches('input[type="text"][data-answer], textarea[data-answer]')) focusedInput = event.target; });
document.addEventListener('pointerdown', event => { if (event.target.closest('[data-character]')) event.preventDefault(); });
document.addEventListener('submit', event => {
  if (event.target.id !== 'answer-form') return;
  event.preventDefault();
  if (!active || active.kind === 'writing') return;
  const state = entryFor(progress, activeId);
  const grade = gradeActivity(active, state.answers);
  progress.activities[activeId] = { ...recordAttempt(state, grade), dirty: false };
  persist(); render(true);
  announce(`Checked: ${grade.points} out of ${grade.total}. Feedback is available for every answer.`);
  $('#answer-feedback')?.focus({ preventScroll: true });
  $('#answer-feedback')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
});
document.addEventListener('click', event => {
  if (event.target.closest('.skip-link')) { event.preventDefault(); $('#main').focus(); $('#main').scrollIntoView({block:'start'}); return; }
  const character = event.target.closest('[data-character]');
  if (character) {
    if (!focusedInput || !document.body.contains(focusedInput)) { announce('Select a verb field first, then choose a character.'); return; }
    const start = focusedInput.selectionStart ?? focusedInput.value.length;
    const end = focusedInput.selectionEnd ?? start;
    focusedInput.setRangeText(character.dataset.character, start, end, 'end'); focusedInput.focus(); focusedInput.dispatchEvent(new Event('input', { bubbles: true })); return;
  }
  const gloss = event.target.closest('.gloss-word');
  if (gloss) {
    const open = gloss.getAttribute('aria-expanded') !== 'true';
    document.querySelectorAll('.gloss-word[aria-expanded="true"]').forEach(button => button.setAttribute('aria-expanded', 'false'));
    gloss.setAttribute('aria-expanded', String(open)); gloss.parentElement.classList.toggle('dismissed', !open); return;
  }
  document.querySelectorAll('.gloss-word[aria-expanded="true"]').forEach(button => button.setAttribute('aria-expanded', 'false'));
  const filterButton = event.target.closest('[data-filter]');
  if (filterButton) { filter = filterButton.dataset.filter; render(true); document.querySelector(`[data-filter="${filter}"]`)?.focus({ preventScroll: true }); return; }
  const mode = event.target.closest('[data-mode]');
  if (mode) {
    const container = mode.closest('[data-diagram]'); const type = container.dataset.diagram; const selected = Number(mode.dataset.mode); const data = diagramData[type];
    container.querySelectorAll('[data-mode]').forEach(button => { button.classList.toggle('selected', button === mode); button.setAttribute('aria-pressed', String(button === mode)); });
    container.querySelector('.diagram-art').innerHTML = diagramArt(type, selected);
    container.querySelector('.diagram-spanish').textContent = data.sentences[selected]; container.querySelector('.diagram-explanation').textContent = data.captions[selected]; return;
  }
  const model = event.target.closest('[data-model]');
  if (model && active) {
    const state = entryFor(progress, activeId); const id = model.dataset.model;
    state.self[id + ':open'] = !state.self[id + ':open'];
    document.getElementById('model-' + id).hidden = !state.self[id + ':open']; model.setAttribute('aria-expanded', String(state.self[id + ':open'])); persist(); return;
  }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'dismiss-achievement') { $('#achievement-toast').hidden = true; clearTimeout(badgeToastTimer); return; }
  if (action === 'solutions' && active) { const state = entryFor(progress, activeId); if (!state.first) return; state.revealed = !state.revealed; state.everRevealed ||= state.revealed; persist(); render(true); if (state.revealed) $('.solution-panel')?.scrollIntoView({ block: 'start' }); }
  if (action === 'request-reset') $('#reset-dialog').showModal();
  if (action === 'cancel-reset') $('#reset-dialog').close();
  if (action === 'confirm-reset') { const toast = $('#achievement-toast'); if (toast) toast.hidden = true; progress = parseProgress(null); persist(); render(true); announce('Your progress has been cleared.'); }
});
document.addEventListener('focusin', event => { if (event.target.matches('.gloss-word')) event.target.parentElement.classList.remove('dismissed'); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') document.querySelectorAll('.gloss-word').forEach(button => { button.setAttribute('aria-expanded', 'false'); button.parentElement.classList.add('dismissed'); }); });
window.addEventListener('hashchange', () => { if (location.hash === '#main') { $('#main').focus(); return; } render(); });
render();
persist();
