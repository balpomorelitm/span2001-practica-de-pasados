// Only this small, authored language marker produces HTML. Content and answers
// are escaped before insertion; arbitrary HTML is never trusted.
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

export function spanishTerm(value) {
  return `<em lang="es" class="spanish-term">${escapeHtml(value)}</em>`;
}

export function formatEnglish(value) {
  const text = String(value ?? '');
  const marker = /\{es\}([\s\S]*?)\{\/es\}/g;
  let html = '';
  let from = 0;
  for (const match of text.matchAll(marker)) {
    html += escapeHtml(text.slice(from, match.index));
    // Treat malformed nested markup literally rather than guessing a language.
    html += match[1].includes('{es}') ? escapeHtml(match[0]) : spanishTerm(match[1]);
    from = match.index + match[0].length;
  }
  return html + escapeHtml(text.slice(from));
}

// Attribute values must still be escaped by the caller. Browser titles and
// accessible names get plain text, without exposing authoring syntax.
export function plainText(value) {
  return String(value ?? '').replace(/\{\/?es\}/g, '');
}
