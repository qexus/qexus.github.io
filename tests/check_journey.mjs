import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('shared/candidate-journey.js','utf8');
const css=fs.readFileSync('shared/candidate-journey.css','utf8');
const router=fs.readFileSync('shared/fisheries-router.js','utf8');
assert(!/\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/.test(source),'Private journey must not send data to a server');
assert(!/input[^>]+type="(?:file|text|date|number)"/.test(source),'No personal document or identifier upload field');
assert(css.includes('.qj-wrap')&&css.includes('@media(max-width:680px)'),'Mobile stylesheet required');
assert(router.includes('data-qj-view="journey"')&&router.includes('journey: "Мой маршрут"'),'Journey must integrate into browser history');

function boot(country, lang) {
  const url='https://qexus.github.io/'+(country==='canada'?'fisheries-ca':'fisheries')+'/?lang='+lang;
  const listeners={};
  const store=new Map();
  const main={innerHTML:''};
  const navLabel={textContent:'Мой маршрут'};
  const doc={
    documentElement:{lang},
    querySelectorAll(selector){return selector.includes('qj-nav-label')?[navLabel]:[];},
    getElementById(id){
      if(id==='main')return main;
      if(id==='sidebar')return {classList:{remove(){}}};
      if(id==='menuToggle')return {setAttribute(){}};
      return null;
    },
    querySelector(){return null;},
    addEventListener(name,callback){listeners[name]=callback;}
  };
  const context=vm.createContext({
    window:{confirm:()=>true},document:doc,
    location:{pathname:new URL(url).pathname,href:url,search:new URL(url).search},
    URL,URLSearchParams,
    localStorage:{
      getItem(key){return store.get(key)||null;},
      setItem(key,value){store.set(key,String(value));}
    }
  });
  vm.runInContext(source,context,{filename:'candidate-journey.js'});
  const app=context.window.qxCandidateJourney;
  return {app,main,context,store,listeners,navLabel};
}
const norway=boot('norway','ru');
assert.equal(norway.app.steps().length,9,'Beginner path has orientation step');
norway.app.render();
assert(norway.main.innerHTML.includes('Мой маршрут к работе'));
assert(norway.main.innerHTML.includes('Языки не отмечены'));
assert(norway.main.innerHTML.includes('https://www.udi.no/en/want-to-apply/work-immigration/'));
assert(!norway.main.innerHTML.includes('type="text"'));
assert(norway.main.innerHTML.includes('qj-privacy'));
assert(!norway.main.innerHTML.includes('<input type="file"'));
const snapshot=norway.app.exportState();
assert.equal(snapshot.country,'norway');
assert.equal(norway.app.validateSnapshot(snapshot,'norway'),true);
assert.equal(norway.app.validateSnapshot(snapshot,'canada'),false);
assert.equal(norway.app.validateSnapshot({...snapshot,profile:{...snapshot.profile,docs:{...snapshot.profile.docs,id:'passport-number'}}},'norway'),false);
assert.equal(norway.app.validateSnapshot({...snapshot,completed:{evil:true}},'norway'),false);
assert.equal(norway.app.validateSnapshot({...snapshot,profile:{...snapshot.profile,languages:['en','en']}},'norway'),false);
assert.equal(norway.app.validateSnapshot({...snapshot,profile:{...snapshot.profile,track:'other'}},'norway'),false);
assert.equal(norway.app.validateSnapshot({...snapshot,prototype:{private:'x'}},'norway'),false);

const change=(app,field,value,checked)=>app.listeners.change({
  target:{dataset:{[field]:value},value,checked,closest(){return true;}}
});
change(norway,'qjLanguage','en',true);
assert(norway.main.innerHTML.includes('Языки указаны'));
change(norway,'qjDoc','cv',true);
assert(norway.main.innerHTML.includes('CV отмечено готовым'));
change(norway,'qjComplete','eligibility',true);
assert.equal(norway.app.exportState().completed.eligibility,true);
assert(norway.store.has('qexus-candidate-journey-norway-v1'),'Manual progress persisted on device');
change(norway,'qjField','vessel',false);
assert.equal(norway.app.exportState().profile.track,'vessel');
assert.equal(Object.keys(norway.app.exportState().completed).length,0,'Changing track resets stale completion');
assert(norway.main.innerHTML.includes('обязанности на борту'));
assert(norway.main.innerHTML.includes('view=cert'));

const experienced=boot('canada','fr');
assert.equal(experienced.navLabel.textContent,'Mon parcours');
change(experienced,'qjField','experienced',false);
assert.equal(experienced.app.steps().length,8,'Experienced candidate skips orientation');
experienced.app.render();
assert(experienced.main.innerHTML.includes('Mon parcours vers l’emploi'));
assert(experienced.main.innerHTML.includes('https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html'));
assert(experienced.main.innerHTML.includes('view=employers'));
change(experienced,'qjDoc','training',true);
change(experienced,'qjComplete','role',true);
const saved=experienced.app.exportState();
assert(experienced.app.restoreState(saved),'Valid local snapshot restores');
assert.equal(experienced.app.exportState().completed.role,true,'Completed step survives backup round-trip');
assert.equal(experienced.app.restoreState({version:1,country:'norway',profile:saved.profile,completed:saved.completed}),false);
assert.equal(experienced.app.exportState().completed.role,true,'Invalid restore does not mutate progress');
assert(experienced.app.restoreState(undefined),'Old backups without journey should remain valid');

const ukrainian=boot('canada','uk');
ukrainian.app.render();
assert(ukrainian.main.innerHTML.includes('Мій маршрут до роботи'));
assert(ukrainian.main.innerHTML.includes('view=curriculum'));
console.log('Passed: 3 locales, both countries, novice/experienced routes, personalized steps, local persistence, strict backup validation and privacy.');
