import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const localizedPages = ['index.html','work.html','site-map.html','status.html','privacy.html'];
let inspected = 0;
for (const language of ['fr','uk']) {
  for (const page of localizedPages) {
    const file = path.join(language, page);
    const html = fs.readFileSync(file, 'utf8');
    const nav = html.match(/<nav\b[^>]*class="[^"]*qx-language-switch[^"]*"[^>]*>[\s\S]*?<\/nav>/)?.[0];
    assert(nav, file + ': missing visible language selector');
    const ukrainian = [...nav.matchAll(/<a\b[^>]*hreflang="uk"[^>]*>([\s\S]*?)<\/a>/g)];
    assert.equal(ukrainian.length, 1, file + ': expected exactly one Ukrainian option');
    assert.equal(ukrainian[0][1].trim(), 'UA', file + ': Ukrainian visible label must be UA');
    assert.match(ukrainian[0][0], /\/uk\//, file + ': do not change language code or canonical paths');
    inspected++;
  }
}
// The original RU homepage is fully static: it must not load the 80 KB runtime dictionary.
const homepage = fs.readFileSync('index.html', 'utf8');
const homeNav = homepage.match(/<nav\\b[^>]*class="[^"]*qx-language-switch[^"]*"[^>]*>[\\s\\S]*?<\\/nav>/)?.[0];
assert(homeNav, 'RU homepage: missing static language selector');
assert.match(homeNav, /hreflang="ru"[^>]*aria-current="page"/, 'RU homepage active language must be marked');
assert.match(homeNav, /hreflang="uk"[^>]*>UA<\\/a>/, 'RU homepage: Ukrainian label must be UA');
assert(!homepage.includes('<script src="/shared/site-i18n.js"'), 'RU homepage must stay free of unnecessary runtime translations');

assert(fs.readFileSync('shared/site-i18n.js','utf8').includes("uk:'UA'"), 'Dynamically generated selector must also read UA');
console.log('Validated ' + inspected + ' FR/UK static site pages and the dynamic language selector.');
