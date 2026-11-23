import test from 'node:test';
import assert from 'node:assert/strict';
import { formatEnglish, plainText, spanishTerm } from '../dist/formatting.js';

test('Spanish mentions receive explicit language and emphasis within English', () => {
  assert.equal(formatEnglish('Use {es}una vez{/es} or {es}un día{/es}.'),
    'Use <em lang="es" class="spanish-term">una vez</em> or <em lang="es" class="spanish-term">un día</em>.');
  assert.equal(formatEnglish('It has limits; he may come back.'), 'It has limits; he may come back.');
});

test('HTML remains inert both outside and inside authored Spanish spans', () => {
  assert.equal(formatEnglish('<img src=x onerror="alert(1)"> {es}<script>bad()</script> & tú{/es}'),
    '&lt;img src=x onerror=&quot;alert(1)&quot;&gt; <em lang="es" class="spanish-term">&lt;script&gt;bad()&lt;/script&gt; &amp; tú</em>');
  assert.equal(spanishTerm('" onmouseover="bad()'), '<em lang="es" class="spanish-term">&quot; onmouseover=&quot;bad()</em>');
});

test('Unmatched or nested language markers are not treated as HTML', () => {
  assert.equal(formatEnglish('Use {es}tú <usted>'), 'Use {es}tú &lt;usted&gt;');
  assert.equal(formatEnglish('{es}a {es}b{/es} c{/es}'), '{es}a {es}b{/es} c{/es}');
});

test('Plain labels retain Spanish, accents, symbols and spacing without markers', () => {
  assert.equal(plainText('{es}Estar + gerundio{/es} in the past'), 'Estar + gerundio in the past');
  assert.equal(plainText('Use {es}tú{/es} & {es}usted{/es}'), 'Use tú & usted');
  assert.equal(formatEnglish(null), '');
  assert.equal(plainText(undefined), '');
});
