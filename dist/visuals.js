const stroke = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
export function icon(name, size = 22) {
  const paths = {
    book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15"/>',
    pen: '<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14Z"/>',
    story: '<path d="M5 3h14v18H5zM9 7h6M9 11h6M9 15h3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    restart: '<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
    spark: '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    flag: '<path d="M5 21V3c5-3 9 3 14 0v11c-5 3-9-3-14 0"/>',
    cup: '<path d="M7 3h10v8a5 5 0 0 1-10 0ZM7 5H3v3a5 5 0 0 0 5 5M17 5h4v3a5 5 0 0 1-5 5M12 16v5M8 21h8"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    link: '<path d="m10 13 4-4M8 16l-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M14 8l2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 -1)"/>'
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" ${stroke}>${paths[name] || paths.book}</svg>`;
}
export function heroArt() {
  return '<img class="hero-illustration" src="./assets/illustrations/course-study.jpg" alt="Three university students studying Spanish together" width="627" height="627" fetchpriority="high">';
}
export function storyArt(index) {
  const number = String(Math.max(0, index) + 1).padStart(2,'0');
  return `<img class="story-illustration" src="./assets/illustrations/story-${number}.jpg" alt="" width="627" height="627" loading="lazy" decoding="async">`;
}
export const diagramData = {
  perspective: { title: 'Change your point of view', labels: ['Inside the scene', 'The whole episode'], sentences: ['A las ocho, llovía.', 'Llovió toda la tarde.'], captions: ['You look at the rain at a past moment. Its boundaries are outside your frame.', 'We sum up the rainy afternoon as a whole. The clear sky shows what happened afterwards; llovió does not itself mean “the rain stopped”.'] },
  scene: { title: 'The background and the event', labels: ['Set the scene', 'Move the story on'], sentences: ['Yo leía en el sofá…', '…cuando sonó el teléfono.'], captions: ['Reading is already in progress at the reference moment.', 'The ringing enters that scene as a new event. Both belong to the same story.'] },
  duration: { title: 'A moment within, or a whole period?', labels: ['A moment within', 'A complete period'], sentences: ['En 2020 trabajaba allí.', 'Trabajé allí de 2017 a 2022.'], captions: ['The reference moment falls inside the period of employment.', 'The timeline presents the complete employment period from 2017 to 2022. The farewell illustrates its endpoint; trabajé does not itself mean “left the job”.'] },
  habits: { title: 'A routine or a bounded series?', labels: ['A past routine', 'A bounded series'], sentences: ['Antes iba al cine los domingos.', 'Aquel mes fui al cine tres veces.'], captions: ['You describe what Sundays used to be like, without counting a complete series.', 'You count three visits within a particular month. Repetition also works with indefinido.'] }
};
export function diagramArt(type, mode = 0) {
  const active = mode === 1;
  const illustrations = {
    perspective: [
      { file: 'guide-rain-inside.jpg', alt: 'A woman watches rain through a window at a particular moment during the rain.' },
      { file: 'guide-rain-whole.jpg', alt: 'The rainy afternoon presented as a complete episode.' }
    ],
    scene: [
      { file: 'guide-reading-background.jpg', alt: 'A person is reading on a sofa before a telephone rings.' },
      { file: 'guide-phone-event.jpg', alt: 'The telephone rings while the person is reading on the sofa.' }
    ],
    duration: [
      { file: 'guide-work-inside.jpg', alt: 'An employee at work, seen at a moment within a longer period of employment.' },
      { file: 'guide-work-whole.jpg', alt: 'A period of employment viewed as a whole, from its beginning to its end.' }
    ]
  };
  if (illustrations[type]) {
    const illustration = illustrations[type][active ? 1 : 0];
    const timeline = type === 'duration' ? `<div class="guide-time-comparison ${active ? 'is-whole' : 'is-inside'}" role="img" aria-label="${active ? 'The whole employment period, from 2017 to 2022.' : 'The year 2020 is a moment inside the employment period from 2017 to 2022.'}"><div class="guide-time-heading">${active ? 'The whole period' : 'A moment inside the period'}</div><div class="guide-time-track"><span class="guide-time-boundary start" aria-hidden="true"></span><span class="guide-time-marker" aria-hidden="true"></span><span class="guide-time-boundary end" aria-hidden="true"></span></div><div class="guide-time-years" aria-hidden="true"><span>2017</span><span class="guide-time-reference">2020</span><span>2022</span></div></div>` : '';
    return `<div class="guide-illustration-panel"><img class="guide-illustration" src="./assets/illustrations/${illustration.file}" alt="${illustration.alt}" width="640" height="640" loading="lazy" decoding="async">${timeline}</div>`;
  }
  let body = '';
  {
    body = `<rect x="69" y="30" width="180" height="159" rx="9" fill="#fff" stroke="#a5bcb9" stroke-width="2"/><path d="M69 64h180" stroke="#a5bcb9" stroke-width="2"/><path d="M104 22v16m108-16v16" stroke="#345766" stroke-width="5" stroke-linecap="round"/>${Array.from({ length: 20 }, (_, i) => { const x = 87 + i % 5 * 36, y = 86 + Math.floor(i / 5) * 28; const selected = active ? [3, 8, 13].includes(i) : i % 5 === 3; return `<circle cx="${x}" cy="${y}" r="9" fill="${selected ? active ? '#cc8158' : '#4d8f7f' : '#e8efec'}"/>`; }).join('')} ${active ? '<path d="M80 181h158" stroke="#cc8158" stroke-width="3"/>' : '<path d="M264 78v100" stroke="#4d8f7f" stroke-width="3" stroke-dasharray="4 5"/>'}`;
  }
  return `<svg viewBox="0 0 320 220" role="img" aria-label="${diagramData[type].captions[mode]}">${body}</svg>`;
}
