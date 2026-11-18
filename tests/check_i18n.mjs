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

// Root pages must share the same footer tokens as Norway, Canada and Manac.
const footerCss=fs.readFileSync('shared/qx-footer.css','utf8');
const selectorCss=fs.readFileSync('shared/site-i18n.css','utf8');
assert(selectorCss.startsWith("@import url('/shared/qx-footer.css');"),'Global language stylesheet must import the common footer');
for(const token of ['.qx-footer__inner','.qx-footer__meta','.qx-footer__links','.page>footer']){
 assert(footerCss.includes(token),'Shared footer token missing: '+token);
}
for(const path of ['index.html','work.html','fr/index.html','fr/work.html','uk/index.html','uk/work.html']){
 const page=fs.readFileSync(path,'utf8');
 assert(page.includes('site-i18n.css'),'Root locale page must load common stylesheet: '+path);
 assert(page.includes('<footer>'),'Missing footer in '+path);
}
console.log('Root RU/FR/UK pages load unified footer stylesheet.');
