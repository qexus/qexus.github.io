/* qexus lab: shared Fisheries source status, learner improvements (no tracking). */
(()=>{
"use strict";
if(!/^\/fisheries(?:-ca)?\/?$/.test(location.pathname))return;
const ca=location.pathname.startsWith("/fisheries-ca"), country=ca?"Canada":"Norway";
const searches=ca?[
 ["Job Bank: seafood processing","https://www.jobbank.gc.ca/jobsearch/jobsearch?searchstring=seafood%20processing&sort=D"],
 ["Job Bank: aquaculture","https://www.jobbank.gc.ca/jobsearch/jobsearch?searchstring=aquaculture&sort=D"]
]:[
 ["NAV: fisk","https://arbeidsplassen.nav.no/stillinger?q=fisk"],
 ["NAV: driftstekniker","https://arbeidsplassen.nav.no/stillinger?q=driftstekniker"]
];
const refs=ca?[
 ["Transport Canada","https://tc.canada.ca/en/marine-transportation"],
 ["CFIA","https://inspection.canada.ca/en"],
 ["Job Bank","https://www.jobbank.gc.ca/"]
]:[
 ["Sjøfartsdirektoratet","https://www.sdir.no/en/Seafarers/Certificates/requirements-for-working-on-fishing-vessels/"],
 ["Fiskeridirektoratet","https://www.fiskeridir.no/"],
 ["UDI","https://www.udi.no/en/want-to-apply/work-immigration/"]
];
const main=document.getElementById("main");if(!main)return;
let feed={status:"loading",verified_live:[]};
const make=(tag,cls,content)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(content!==undefined)x.textContent=String(content);return x};
const safeUrl=(url)=>{try{const v=new URL(url);return v.protocol==="https:"&&!v.username&&!v.password?v.href:null}catch{return null}};
const link=(name,url)=>{const a=make("a","qf-link",name);a.href=url;a.target="_blank";a.rel="noopener noreferrer";return a};
function activeJobs(){
 const now=Date.now();const max=(Number(feed.max_verification_age_hours)||36)*3600000;
 return (Array.isArray(feed.verified_live)?feed.verified_live:[]).filter(x=>{
  if(x.status!=="verified"||!safeUrl(x.url))return false;
  const checked=Date.parse(x.verified_at),expires=Date.parse(x.expires_at);
  return Number.isFinite(checked)&&Number.isFinite(expires)&&checked<=now+300000&&now-checked<=max&&expires>now
 }).slice(0,50);
}
function panel(){
 const root=make("section","qf-panel");root.id="qf-panel";root.setAttribute("aria-label","Статус текущих вакансий");
 const head=make("div","qf-panel-head");head.append(make("strong","","Вакансии с проверенным статусом"));
 const items=activeJobs(),badge=make("span","qf-badge",items.length?"Подтверждено: "+items.length:"Официальный поиск");head.append(badge);root.append(head);
 root.append(make("p","qf-desc",items.length?"Объявления из разрешённого источника, перепроверенные за последние 36 часов.":"Нажми на официальный поиск ниже, чтобы увидеть свежие вакансии прямо на NAV или Job Bank. Объявления, сохранённые на этой странице, — архив, их наличие нужно проверять."));
 if(items.length){
  const grid=make("div","qf-grid");
  for(const x of items){
   const card=make("article","qf-item");
   card.append(make("strong","",x.title),make("p","",x.employer+" · "+(x.location||"Регион не указан")));
   card.append(link("Открыть объявление ↗",safeUrl(x.url)));
   card.append(make("small","","Источник: "+(x.source||"проверенный")+" · проверено: "+new Date(x.verified_at).toLocaleString("ru-RU")));
   grid.append(card)
  }
  root.append(grid)
 }
 const urls=make("div","qf-links");urls.append(make("b","","Официальный поиск:"));
 for(const pair of searches)urls.append(link(pair[0]+" ↗",pair[1]));
 root.append(urls,make("small","qf-note","Государственная регистрация предприятия не означает открытую вакансию. Перед откликом перепроверяй источник."));
 return root;
}
function jobsActive(){return !!document.querySelector('#nav [data-view="jobs"].active')}
function studyActive(){return !!document.querySelector('#nav [data-qa-view="curriculum"].active')}
function matrixActive(){return !!document.querySelector('#nav [data-qx-view="matrix"].active')}

function decorate(){
 if(jobsActive()&&!main.querySelector("#qf-panel"))main.prepend(panel());
 if(studyActive()&&!main.querySelector(".qf-study")){
  const intro=main.querySelector(".qa-intro");
  if(intro){
   const p=make("section","qf-study"),btn=make("button","qf-next","Следующий незавершённый урок");btn.type="button";
   p.append(make("strong","","Как проходить курс"),make("p","","Изучи теорию, выполни задание и проверь ответы. Эти уроки бесплатны, но не выдают STCW или морские квалификации."));
   btn.addEventListener("click",()=>{
    let done={};try{done=JSON.parse(localStorage.getItem("qexus-academy-"+country+"-lessons")||"{}")||{}}catch{}
    const modules=[...main.querySelectorAll("details.qa-lesson")];
    const first=modules.find(e=>!done[e.id.replace("qa-lesson-","")])||modules[0];
    if(first){first.open=true;first.scrollIntoView({behavior:"auto",block:"start"})}
   });
   p.append(btn);
   const sources=make("div","qf-links");sources.append(make("span","","Официальные источники: "));
   for(const pair of refs)sources.append(link(pair[0]+" ↗",pair[1]));
   p.append(sources);
   intro.insertAdjacentElement("afterend",p);
  }
 }
 if(matrixActive()&&!main.querySelector(".qf-matrix-note")){
  const intro=main.querySelector(".qx-intro");
  if(intro)intro.insertAdjacentElement("afterend",make("p","qf-matrix-note","Перед оплатой курса перепроверь его признание, требования для конкретного судна и актуальный тариф на сайте учебного центра."));
 }
}
let scheduled=false;
function update(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;decorate()})}
new MutationObserver(update).observe(main,{childList:true,subtree:false});
fetch("./generated/jobs.json",{cache:"no-cache"}).then(r=>{if(!r.ok)throw Error("HTTP "+r.status);return r.json()}).then(v=>{
 feed=v&&typeof v==="object"?v:{status:"unavailable",verified_live:[]};
 main.querySelector("#qf-panel")?.remove();update();
}).catch(()=>{feed={status:"unavailable",verified_live:[]};main.querySelector("#qf-panel")?.remove();update()});
update();
})();