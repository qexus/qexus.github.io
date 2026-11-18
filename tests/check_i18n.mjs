import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('shared/site-i18n.js','utf8');
const window={QX_APP_I18N:{fr:{'Проверка':'Test local'}}};
const context={window,URLSearchParams,location:{search:'?lang=fr'},document:{documentElement:{lang:'ru'},readyState:'loading',addEventListener(){}}};
vm.runInNewContext(source.replace('function init(){','window.testPath=staticLocalizedPath;\nfunction init(){'),context);
assert.equal(window.qxTranslate(' Проверка '),' Test local ');
assert.equal(window.qxTranslate('Документы'),'Documents');
assert.equal(window.qxTranslate('user note'), 'user note');
for(const [path,lang,expected] of [
 ['/fr/work.html','uk','/uk/work.html'],
 ['/manac/uk/','fr','/manac/fr/'],
 ['/fisheries/fr/guides/lesson-01.html','uk','/fisheries/uk/guides/lesson-01.html'],
 ['/fisheries-ca/uk/guides/','ru','/fisheries-ca/guides/'],
 ['/uk/','ru','/'],
 ['/fr/status.html','fr','/fr/status.html'],
 ['/unknown.html','fr',null],
])assert.equal(window.testPath(path,lang),expected);
console.log('Passed: app dictionary, whitespace, stable localized URLs and language switching.');
