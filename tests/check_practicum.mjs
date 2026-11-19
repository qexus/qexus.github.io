import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('shared/practicum.js','utf8');
const styles=fs.readFileSync('shared/practicum.css','utf8');
const router=fs.readFileSync('shared/fisheries-router.js','utf8');
assert(!/\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon)\s*\(/.test(source),'Practice must not send answers to the server');
assert(!source.includes('type="file"')&&!source.includes('type="text"'),'Practice must not collect personal data');
assert(styles.includes('@media(max-width:650px)')&&styles.includes(':focus-visible'),'Responsive and keyboard styles required');
assert(router.includes('data-qp-view="practice"')&&router.includes('practice: "Практикум"'),'Practice must be routable');
assert(router.includes('button.dataset.qpView'),'Router must recognize practice links');

function boot(country,lang) {
  const events={},store=new Map();
  const main={innerHTML:''};
  const status={textContent:''};
  const heading={focused:false,focus(){this.focused=true}};
  const navLabel={textContent:'Практикум'};
  let choice=null;
  const document={
    documentElement:{lang},
    getElementById(id){
      if(id==='main')return main;
      if(id==='qp-status')return status;
      if(id.startsWith('qp-heading-'))return heading;
      if(id==='sidebar')return {classList:{remove(){}}};
      if(id==='menuToggle')return {setAttribute(){}};
      return null;
    },
    querySelector(selector){
      if(selector.includes('input[name="qp-answer-'))return choice===null?null:{value:String(choice)};
      if(selector==='.qp-wrap')return {};
      return null;
    },
    querySelectorAll(selector){return selector.includes('qp-nav-label')?[navLabel]:[]},
    addEventListener(type,fn){events[type]=fn;}
  };
  const root='https://qexus.github.io/'+(country==='canada'?'fisheries-ca/':'fisheries/');
  const url=new URL(root+'?lang='+lang);
  const localStorage={getItem:k=>store.get(k)||null,setItem(k,v){store.set(k,String(v))}};
  const window={confirm:()=>true};
  const context=vm.createContext({window,document,location:{pathname:url.pathname,search:url.search,href:url.href},
    URL,URLSearchParams,localStorage});
  vm.runInContext(source,context,{filename:'practicum.js'});
  return {api:window.qxPracticum,main,heading,status,navLabel,events,store,context,select(n){choice=n}};
}
function submit(app,id){
  app.events.click({target:{closest(selector){
    if(selector==='[data-qp-view="practice"]')return null;
    if(selector==='.qp-wrap')return {};
    if(selector==='[data-qp-submit]')return {dataset:{qpSubmit:id}};
    return null;
  }}});
}
for(const country of ['norway','canada']){
  for(const lang of ['ru','fr','uk']){
    const app=boot(country,lang);
    app.api.render();
    const label=lang==='fr'?'Prendre les bonnes décisions au travail':lang==='uk'?'Рішення в реальній роботі':'Решения в реальной работе';
    assert(app.main.innerHTML.includes(label),'Correct translated heading: '+country+' '+lang);
    assert(app.main.innerHTML.includes('data-no-translate="true"'));
    assert(app.main.innerHTML.includes('role="progressbar"'));
    assert(app.main.innerHTML.includes('rel="noopener noreferrer"'));
    const cases=app.api.scenarios();
    assert.equal(cases.length,6,'Exactly six editorial scenarios for each country');
    assert.equal(new Set(cases.map(c=>c.id)).size,6,'Stable unique scenario IDs');
    assert(cases.every(c=>c.choices.length===3&&c.correct>=0&&c.correct<3&&c.source.startsWith('https://')));
    assert(cases.some(c=>c.id==='aqua-biosecurity')&&cases.some(c=>c.id==='vessel-command'));
    assert(cases.every(c=>c.source.includes(country==='canada'?'.ca/':'.no/')),'Each answer must link to country regulator');
    const start=app.api.exportState();
    assert(app.api.validateSnapshot(start,country));
    assert.equal(app.api.validateSnapshot(start,country==='canada'?'norway':'canada'),false);
    assert.equal(app.api.validateSnapshot(vm.runInContext('({version:1,country:"'+country+'",answers:{"new-unknown":0}})',app.context),country),false);
    assert.equal(app.api.validateSnapshot(vm.runInContext('({version:1,country:"'+country+'",answers:{"vessel-command":3}})',app.context),country),false);
    assert.equal(app.api.validateSnapshot(vm.runInContext('({version:1,country:"'+country+'",answers:{"vessel-command":"0"}})',app.context),country),false);
    assert.equal(app.api.validateSnapshot(vm.runInContext('JSON.parse('+JSON.stringify('{"version":1,"country":"'+country+'","answers":{"__proto__":0}}')+')',app.context),country),false);
    assert.equal(app.navLabel.textContent,lang==='fr'?'Exercices pratiques':lang==='uk'?'Практикум':'Практикум');
    submit(app,'vessel-command'); // No selected answer.
    assert(app.status.textContent.length>0,'Unanswered scenario prompts the visitor to select an option');
    app.select((cases[0].correct+1)%3);submit(app,cases[0].id);
    assert(app.main.innerHTML.includes('is-wrong'),'Incorrect answer must explain and invite retry');
    app.select(cases[0].correct);submit(app,cases[0].id);
    assert(app.main.innerHTML.includes('is-right'),'Correct answer must be acknowledged');
    for(const c of cases.slice(1)){app.select(c.correct);submit(app,c.id);}
    const result=app.api.exportState();
    assert.equal(Object.keys(result.answers).length,6);
    assert(app.main.innerHTML.includes('6 / 6'),'Score must update when all six are correct');
    assert(app.store.has('qexus-practice-'+country+'-v1'),'Responses must remain local');
    app.events.change({target:{value:'aqua',matches:sel=>sel==='[data-qp-filter]',closest:()=>({})}});
    assert(app.main.innerHTML.includes('qp-card-aqua-biosecurity'));
    assert(!app.main.innerHTML.includes('qp-card-vessel-command'),'Category filter must hide other scenarios');
    const stored=app.api.exportState();
    assert(app.api.restoreState(stored),'Valid same-country backup restores');
    assert.equal(Object.keys(app.api.exportState().answers).length,6);
    assert(app.api.restoreState(undefined),'Legacy backups without practicum must remain supported');
    const bad=vm.runInContext('({version:1,country:"other",answers:{}})',app.context);
    assert.equal(app.api.restoreState(bad),false,'Wrong-country backup rejected');
    assert.equal(Object.keys(app.api.exportState().answers).length,6,'Bad restore cannot mutate answers');
    app.events.click({target:{closest(selector){
      if(selector==='[data-qp-view="practice"]')return null;
      if(selector==='.qp-wrap')return {};
      if(selector==='[data-qp-reset]')return {};
      return null;
    }}});
    assert.equal(Object.keys(app.api.exportState().answers).length,0,'Reset erases saved answers');
  }
}
console.log('Passed: Norway and Canada × RU/FR/UK, 6 grounded scenarios, question feedback, filters, local scores and secure JSON backup.');
