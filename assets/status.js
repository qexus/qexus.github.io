(()=>{
"use strict";
const configs=[["norway","/fisheries/generated/registry.json","/fisheries/generated/jobs.json","vessels"],
               ["canada","/fisheries-ca/generated/registry.json","/fisheries-ca/generated/jobs.json","aquaculture"]];
const map={updated:"Обновлено",fresh:"Обновлено",partial:"Частичная выгрузка",stale:"Предыдущая копия",unavailable:"Источник недоступен",loading:"Загрузка…"};
const number=n=>Number.isInteger(n)?new Intl.NumberFormat("ru-RU").format(n):"—";
async function json(url){const r=await fetch(url,{cache:"no-store"});if(!r.ok)throw Error("HTTP "+r.status);return r.json()}
for(const [id,registryUrl,jobsUrl,otherKey] of configs){
 const root=document.getElementById(id);if(!root)continue;
 const put=(field,value)=>{const x=root.querySelector('[data-field="'+field+'"]');if(x)x.textContent=String(value)};
 const label=root.querySelector(".status-label");
 Promise.allSettled([json(registryUrl),json(jobsUrl)]).then(([registry,jobs])=>{
  if(registry.status==="fulfilled"){
   const d=registry.value;label.textContent=map[d.status]||"Статус: "+String(d.status||"неизвестно");
   put("companies",number(d.companies?.length));put("other",number(d[otherKey]?.length));
   const dt=String(d.generated_at||"");put("updated",dt.slice(0,10)||"—");
  }else label.textContent="Не удалось загрузить государственный реестр";
  if(jobs.status==="fulfilled"){
   const d=jobs.value;
   if(d.status==="not_connected")put("jobs","Нет подтверждённого подключения");
   else if(d.status==="verified")put("jobs",number(d.verified_live?.length)+" проверенных");
   else put("jobs",String(d.status||"Неизвестно"));
  }else put("jobs","Нет связи с источником");
 }).catch(()=>{label.textContent="Ошибка проверки";});
}
})();