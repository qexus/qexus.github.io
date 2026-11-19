import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const src=fs.readFileSync('shared/candidate-desk.js','utf8');
const css=fs.readFileSync('shared/candidate-desk.css','utf8');
const router=fs.readFileSync('shared/fisheries-router.js','utf8');
assert(!/\b(?:fetch|XMLHttpRequest|sendBeacon|WebSocket)\s*\(/.test(src),'Candidate data must never leave the browser');
assert(!src.includes('type="file"'),'No private file uploads');
assert(css.includes('@media print')&&css.includes('page-break-before:always'),'Two-section PDF print view required');
assert(css.includes('@media(max-width:740px)'),'Mobile layout required');
assert(router.includes('data-qd-view="desk"')&&router.includes('desk: "Пакет и отклики"'),'Desk must be a route');

function boot(country,lang){
  const events={},records=new Map(),preview={innerHTML:''},board={innerHTML:''},form={innerHTML:''},main={innerHTML:''};
  const label={textContent:'Пакет и отклики'};
  const document={
    documentElement:{lang},
    querySelectorAll(selector){return selector.includes('qd-nav-label')?[label]:[];},
    getElementById(id){
      if(id==='main')return main;
      if(id==='qd-print')return preview;
      if(id==='qd-cards')return board;
      if(id==='qd-application-form')return form;
      if(id==='sidebar')return {classList:{remove(){}}};
      if(id==='menuToggle')return {setAttribute(){}};
      return null;
    },
    querySelector(){return null;},
    addEventListener(type,fn){events[type]=fn;}
  };
  const url='https://qexus.github.io/'+(country==='canada'?'fisheries-ca':'fisheries')+'/?lang='+lang;
  const store={getItem(k){return records.get(k)||null},setItem(k,value){records.set(k,String(value));}};
  let prints=0;
  const window={confirm:()=>true,print:()=>prints++};
  const context=vm.createContext({window,document,URL,URLSearchParams,location:{href:url,pathname:new URL(url).pathname,search:'?lang='+lang},localStorage:store});
  vm.runInContext(src,context,{filename:'candidate-desk.js'});
  return {api:window.qxCandidateDesk,events,records,main,preview,form,board,label,context,get prints(){return prints}};
}
function editField(h,key,value){h.events.input({target:{dataset:{qdField:key},value,closest:()=>true}})}
function submit(h,values){
  const form={id:'qd-application-form',elements:{namedItem(key){return{value:values[key]??''}}}};
  let prevented=false;
  h.events.submit({target:form,preventDefault(){prevented=true;}});
  assert(prevented,'No application is sent to a server');
}
const sample={company:'Harbor Test Company',role:'Production operator',link:'https://example.org/careers',date:'2026-11-18',next:'2026-11-25',status:'applied',notes:'Waiting for reply'};
for(const country of ['norway','canada']){
  for(const lang of ['ru','fr','uk']){
    const h=boot(country,lang);
    h.api.render();
    assert(h.main.innerHTML.includes(lang==='fr'?'Dossier de candidature':lang==='uk'?'Пакет кандидата':'Пакет кандидата'));
    assert(h.main.innerHTML.includes('data-qd-print')&&h.main.innerHTML.includes('qd-application-form'));
    assert(h.main.innerHTML.includes('data-no-translate="true"'),'Local text must not be auto-translated');
    assert.equal(h.api.exportState().country,country);
    assert.equal(h.api.validateSnapshot(h.api.exportState(),country),true);
    editField(h,'name','<img src=x onerror=alert(1)>');
    assert(h.api.exportState().cv.name.includes('<img'),'Save literal user text without altering it');
    assert(!h.preview.innerHTML.includes('<img'),'HTML must be escaped in printable preview');
    assert(h.preview.innerHTML.includes('&lt;img'),'Preview must display escaped literal text');
    editField(h,'experience','Actual experience only');
    h.api.render();
    assert(h.main.innerHTML.includes('Actual experience only'));
    submit(h,sample);
    assert.equal(h.api.exportState().applications.length,1);
    assert(h.records.size>0,'Local storage must persist the tracker');
    assert(h.board.innerHTML.includes('Harbor Test Company'));
    submit(h,{...sample,company:'Unsafe company',link:'javascript:alert(1)'});
    assert.equal(h.api.exportState().applications.length,1,'Reject non-HTTPS URL');
    submit(h,{...sample,company:'Bad date',date:'2026-02-30'});
    assert.equal(h.api.exportState().applications.length,1,'Reject impossible calendar dates');
    // Editing must update the existing application, not create a duplicate.
    const existingId=h.api.exportState().applications[0].id;
    h.events.click({target:{closest(selector){
      if(selector==='[data-qd-view="desk"]')return null;
      if(selector==='.qd-wrap')return {};
      if(selector==='[data-qd-edit]')return {dataset:{qdEdit:existingId}};
      return null;
    }}});
    assert(h.form.innerHTML.includes('Harbor Test Company'),'Edit form is filled from existing entry');
    submit(h,{...sample,company:'Updated Company',status:'interview'});
    assert.equal(h.api.exportState().applications.length,1,'Editing cannot duplicate entries');
    assert.equal(h.api.exportState().applications[0].status,'interview');
    assert.equal(h.api.exportState().applications[0].company,'Updated Company');
    const exported=h.api.exportState();
    assert(h.api.restoreState(exported),'Valid JSON snapshot restores');
    assert.equal(h.api.exportState().applications.length,1);
    assert(h.api.restoreState(undefined),'Legacy backup without desk remains supported');
    const broken=vm.runInContext('JSON.parse('+JSON.stringify(JSON.stringify({...exported,country:'wrong'}))+')',h.context);
    assert.equal(h.api.restoreState(broken),false,'Wrong-country snapshot rejected');
    assert.equal(h.api.exportState().applications.length,1,'Invalid backup must not mutate state');
    const prototypePayload=vm.runInContext('JSON.parse('+JSON.stringify('{"version":1,"country":"'+country+'","variant":"shore","cv":{"__proto__":"bad"},"applications":[]}')+')',h.context);
    assert.equal(h.api.validateSnapshot(prototypePayload,country),false,'Prototype key must be rejected');
    const button=(selector)=>selector==='[data-qd-print]'?{}:null;
    h.events.click({target:{closest(selector){if(selector==='[data-qd-view="desk"]')return null;if(selector==='.qd-wrap')return {};return button(selector);}}});
    assert.equal(h.prints,1,'User print action triggers browser PDF/print dialog');
    const id=h.api.exportState().applications[0].id;
    h.events.click({target:{closest(selector){
      if(selector==='[data-qd-view="desk"]')return null;
      if(selector==='.qd-wrap')return {};
      if(selector==='[data-qd-delete]')return {dataset:{qdDelete:id}};
      return null;
    }}});
    assert.equal(h.api.exportState().applications.length,0,'Deleting a record is local and immediate');
  }
}
console.log('Passed: six country/language combinations, safe CV and letter preview, local tracker, date and URL validation, strict backup, no auto-send and print.');
