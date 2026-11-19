/* qexus Candidate Desk — no account, uploads, network requests or automatic applications. */
(() => {
  'use strict';
  const country=location.pathname.includes('/fisheries-ca/')?'canada':'norway';
  const hint=new URLSearchParams(location.search).get('lang')||document.documentElement.lang||'ru';
  const lang=['ru','fr','uk'].includes(hint)?hint:'ru', col={ru:0,fr:1,uk:2}[lang];
  const key='qexus-candidate-desk-'+country+'-v1';
  const dict={
    nav:['Пакет и отклики','Dossier et candidatures','Пакет і відгуки'],
    title:['Пакет кандидата и доска откликов','Dossier de candidature et suivi','Пакет кандидата й дошка відгуків'],
    intro:['Подготовь собственное CV и письмо, затем отслеживай заявки. Ничего не отправляется работодателям автоматически.','Préparez votre CV et votre lettre, puis suivez vos candidatures. Aucun envoi automatique aux employeurs.','Підготуй CV і лист, потім відстежуй відгуки. Нічого не надсилається роботодавцям автоматично.'],
    privacy:['Все записи остаются в этом браузере и попадают только в скачиваемую тобой JSON-копию. Не вводи паспорт, SIN/NAS, дату рождения, медицинские сведения или номер разрешения. Вся переписка с работодателем — только вне этого сайта.','Les données restent dans ce navigateur et votre sauvegarde JSON locale. Ne saisissez pas de passeport, NAS, date de naissance, données médicales ni numéro de permis. Les candidatures sont envoyées ailleurs.','Дані залишаються в браузері й твоїй локальній JSON-копії. Не вводь паспорт, SIN/NAS, дату народження, медичні дані чи номер дозволу. Відгук надсилається поза сайтом.'],
    candidate:['Редактор CV','Éditeur de CV','Редактор CV'],
    variant:['Тип работы','Type de poste','Тип роботи'],
    shore:['Завод / берег','Usine / à terre','Завод / берег'],
    vessel:['Судно','Navire','Судно'],
    aquaculture:['Аквакультура','Aquaculture','Аквакультура'],
    name:['Имя (по желанию)','Nom (facultatif)','Ім’я (необов’язково)'],
    contact:['Email или способ связи','Courriel ou contact','Email або спосіб зв’язку'],
    location:['Город / регион','Ville / région','Місто / регіон'],
    position:['Желаемая должность','Poste visé','Бажана посада'],
    company:['Компания для письма (необязательно)','Entreprise pour la lettre (facultatif)','Компанія для листа (необов’язково)'],
    summary:['Кратко о себе','Profil professionnel','Коротко про себе'],
    experience:['Реальный опыт и обязанности','Expérience réelle et tâches','Реальний досвід та обов’язки'],
    skills:['Навыки, которые действительно есть','Compétences réelles','Навички, які справді є'],
    training:['Реальное обучение и сертификаты','Formations et certifications réelles','Реальне навчання та сертифікати'],
    coverNotes:['Что ещё хочешь честно сказать работодателю','Précisions véridiques pour votre lettre','Що ще хочеш правдиво сказати роботодавцю'],
    fieldsHint:['Заполняй только достоверные сведения. Пустые поля не включаются в печатный документ.','Indiquez uniquement des faits exacts. Les champs vides ne figurent pas dans le document imprimé.','Заповнюй лише достовірні дані. Порожні поля не потрапляють до друкованого документа.'],
    preview:['Предпросмотр для печати','Aperçu imprimable','Попередній перегляд для друку'],
    cv:['Резюме / CV','Curriculum vitæ','Резюме / CV'],
    letter:['Сопроводительное письмо','Lettre de motivation','Супровідний лист'],
    print:['Печать / сохранить в PDF','Imprimer / enregistrer en PDF','Друк / зберегти PDF'],
    printHint:['В окне печати выбери «Сохранить как PDF» (или Print to PDF).','Dans la fenêtre d’impression, choisissez « Enregistrer au format PDF ».','У вікні друку вибери «Зберегти як PDF».'],
    letterIntroShore:['Подаю заявку на работу на рыбоперерабатывающем предприятии. Хочу узнать требования к конкретной позиции, организации смен и обучению безопасности.','Je souhaite poser ma candidature à un poste dans une usine de transformation. Je souhaite connaître les exigences du poste, les quarts et la formation à la sécurité.','Хочу подати заявку на роботу на рибопереробному підприємстві. Прошу уточнити вимоги посади, зміни й навчання з безпеки.'],
    letterIntroVessel:['Интересуюсь работой на рыболовном судне. Хотелось бы уточнить обязанности, район плавания, обязательные документы и подготовку по безопасности.','Je suis intéressé par un emploi à bord d’un navire de pêche. Je souhaite vérifier les tâches, la zone de navigation, les documents requis et la formation en sécurité.','Цікавлюся роботою на риболовному судні. Хотів би уточнити обов’язки, район плавання, документи й підготовку з безпеки.'],
    letterIntroAqua:['Интересуюсь вакансией в аквакультуре. Хотелось бы уточнить условия работы, обязанности и требования по безопасности и биозащите.','Je souhaite travailler en aquaculture et vérifier les tâches, les conditions de travail et les exigences en sécurité et biosécurité.','Цікавлюся вакансією в аквакультурі. Хотів би уточнити умови роботи, обов’язки й вимоги з безпеки та біозахисту.'],
    letterExperience:['В моём CV указан следующий подтверждённый мной опыт:','Voici mon expérience réelle, également décrite dans mon CV :','У моєму CV зазначено такий перевірений мною досвід:'],
    letterEnd:['Буду рад(а) обсудить требования и возможность отклика через официальный канал компании.','Je serais ravi(e) de discuter des exigences et de la procédure officielle de candidature.','Буду радий(а) обговорити вимоги та подання заявки через офіційний канал компанії.'],
    dear:['Здравствуйте,','Bonjour,','Вітаю,'],
    board:['Доска откликов','Suivi des candidatures','Дошка відгуків'],
    boardInfo:['Отмечай реальный статус самостоятельно. Реестры компаний не подтверждают открытых вакансий.','Mettez à jour le statut vous-même. Les registres ne confirment pas les postes vacants.','Позначай реальний статус самостійно. Реєстри не підтверджують відкритих вакансій.'],
    employer:['Работодатель','Employeur','Роботодавець'],
    role:['Вакансия / роль','Offre / poste','Вакансія / посада'],
    source:['Официальная ссылка HTTPS (необязательно)','Lien officiel HTTPS (facultatif)','Офіційне посилання HTTPS (необов’язково)'],
    date:['Дата отклика','Date de candidature','Дата відгуку'],
    status:['Статус','Statut','Статус'],
    next:['Следующая проверка ответа','Date de relance','Наступна перевірка відповіді'],
    notes:['Заметка (без конфиденциальных данных)','Note (sans données sensibles)','Нотатка (без конфіденційних даних)'],
    save:['Сохранить запись','Enregistrer la candidature','Зберегти запис'],
    update:['Обновить запись','Modifier la candidature','Оновити запис'],
    cancel:['Отменить редактирование','Annuler','Скасувати редагування'],
    edit:['Изменить','Modifier','Змінити'],
    delete:['Удалить','Supprimer','Видалити'],
    deleteConfirm:['Удалить эту запись из браузера?','Supprimer cette candidature du navigateur ?','Видалити цей запис із браузера?'],
    filter:['Показать статусы','Filtrer les statuts','Показати статуси'],
    all:['Все','Tous','Усі'],
    empty:['Пока нет откликов. Добавь первый после проверки работодателя.','Aucune candidature pour le moment. Ajoutez-en une après vérification.','Відгуків поки немає. Додай перший після перевірки роботодавця.'],
    open:['Перейти к источнику','Ouvrir la source','Відкрити джерело'],
    draft:['Подготовка','Préparation','Підготовка'],
    applied:['Отправлено','Envoyée','Надіслано'],
    reply:['Получен ответ','Réponse reçue','Отримано відповідь'],
    interview:['Собеседование','Entretien','Співбесіда'],
    offer:['Получен оффер','Offre reçue','Отримано пропозицію'],
    closed:['Закрыто','Clôturée','Закрито'],
    errors:['Проверь компанию, дату и HTTPS-ссылку. Поля имеют ограничение длины.','Vérifiez l’entreprise, la date et le lien HTTPS. Respectez les limites de longueur.','Перевір компанію, дату й HTTPS-посилання. Поля мають обмеження довжини.'],
    full:['Достигнут лимит 100 записей. Удали старые, прежде чем добавлять новые.','Limite de 100 candidatures atteinte. Supprimez des entrées avant d’en ajouter.','Досягнуто межі 100 записів. Видали старі, перш ніж додавати нові.'],
    saved:['Сохранено на этом устройстве','Enregistré sur cet appareil','Збережено на пристрої'],
    blocked:['Браузер не сохранил данные. Попробуй экспортировать JSON-копию в разделе «Источники».','Le navigateur n’a pas enregistré les données. Exportez une sauvegarde JSON depuis « Sources ».','Браузер не зберіг дані. Експортуй JSON-копію в розділі «Джерела».'],
    reset:['Удалить мой пакет и все отклики','Effacer mon dossier et toutes les candidatures','Видалити мій пакет і всі відгуки'],
    resetConfirm:['Удалить CV, письмо и всю доску откликов из этого браузера?','Effacer le CV, la lettre et tout le suivi de ce navigateur ?','Видалити CV, лист та всю дошку відгуків із цього браузера?'],
    pdfOnly:['Печать выполняется в браузере: выбери сохранение PDF. Сайт не отправляет этот документ.','L’impression se fait dans le navigateur : choisissez PDF. Aucun document n’est transmis.','Друк відбувається в браузері: вибери PDF. Сайт не надсилає цей документ.']
  };
  const t=k=>(dict[k]||[k,k,k])[col];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  const br=s=>esc(s).replace(/\r?\n/g,'<br>');
  const fields={name:90,contact:160,location:120,position:120,company:120,summary:1100,experience:2400,skills:900,training:950,coverNotes:700};
  const statuses=['draft','applied','reply','interview','offer','closed'];
  const variants=['shore','vessel','aquaculture'];
  const blank=()=>({version:1,country,variant:'shore',cv:Object.fromEntries(Object.keys(fields).map(k=>[k,''])),applications:[]});
  const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
  function https(link){try{if(!link)return true;const u=new URL(link);return u.protocol==='https:'&&!u.username&&!u.password&&u.href.length<=550}catch{return false}}
  function validDate(value){if(value==='')return true;if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T12:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===value}
  function validApplication(a){
    return plain(a)&&Object.keys(a).every(k=>['id','company','role','link','date','status','next','notes'].includes(k))&&
      typeof a.id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(a.id)&&
      typeof a.company==='string'&&a.company.trim().length>0&&a.company.length<=120&&
      typeof a.role==='string'&&a.role.length<=120&&
      typeof a.link==='string'&&https(a.link)&&
      typeof a.date==='string'&&validDate(a.date)&&
      typeof a.next==='string'&&validDate(a.next)&&
      statuses.includes(a.status)&&typeof a.notes==='string'&&a.notes.length<=900;
  }
  function validateSnapshot(s,c){
    if(!plain(s)||s.version!==1||s.country!==c||!variants.includes(s.variant)||!plain(s.cv)||!Array.isArray(s.applications)||s.applications.length>100)return false;
    if(!Object.keys(s).every(k=>['version','country','variant','cv','applications'].includes(k)))return false;
    if(Object.keys(s.cv).length!==Object.keys(fields).length)return false;
    if(!Object.keys(fields).every(k=>typeof s.cv[k]==='string'&&s.cv[k].length<=fields[k]))return false;
    const ids=new Set();
    for(const a of s.applications){if(!validApplication(a)||ids.has(a.id))return false;ids.add(a.id);}
    return true;
  }
  function load(){try{const s=JSON.parse(localStorage.getItem(key)||'null');return validateSnapshot(s,country)?s:blank()}catch{return blank()}}
  let state=load();
  if(!localStorage.getItem(key)){
    try { const track=window.qxCandidateJourney?.exportState?.().profile.track;if(variants.includes(track))state.variant=track; }catch{}
  }
  let editing=null,filter='all',message='';
  function persist(){try{localStorage.setItem(key,JSON.stringify(state));message=t('saved');return true}catch{message=t('blocked');return false}}
  function row(label,value){return value.trim()?'<section><h3>'+esc(label)+'</h3><p>'+br(value)+'</p></section>':''}
  function coverText(){
    const c=state.cv;
    const intro=t('letterIntro'+({shore:'Shore',vessel:'Vessel',aquaculture:'Aqua'}[state.variant]));
    const target=c.position.trim()?c.position.trim()+'. ':'';
    const parts=[t('dear'),'',target+intro];
    if(c.experience.trim())parts.push('',t('letterExperience'),c.experience.trim());
    if(c.coverNotes.trim())parts.push('',c.coverNotes.trim());
    parts.push('',t('letterEnd'));
    if(c.name.trim())parts.push('',c.name.trim());
    return parts.join('\n');
  }
  function renderPreview(){
    const c=state.cv;
    return '<div class="qd-paper"><article class="qd-cv"><h2>'+esc(t('cv'))+'</h2>'+
      (c.name.trim()?'<h1>'+esc(c.name)+'</h1>':'')+
      (c.contact.trim()?'<p>'+esc(c.contact)+'</p>':'')+
      (c.location.trim()?'<p>'+esc(c.location)+'</p>':'')+
      row(t('position'),c.position)+row(t('summary'),c.summary)+
      row(t('experience'),c.experience)+row(t('skills'),c.skills)+row(t('training'),c.training)+
      '</article><article class="qd-letter"><h2>'+esc(t('letter'))+'</h2>'+
      (c.company.trim()?'<p><strong>'+esc(c.company)+'</strong></p>':'')+
      '<p>'+br(coverText())+'</p></article></div>';
  }
  const field=(id,textarea=false)=>'<label class="qd-field"><span>'+esc(t(id))+'</span>'+
    (textarea?'<textarea data-qd-field="'+id+'" maxlength="'+fields[id]+'" rows="'+(id==='experience'?5:3)+'">'+esc(state.cv[id])+'</textarea>':
      '<input data-qd-field="'+id+'" type="text" maxlength="'+fields[id]+'" value="'+esc(state.cv[id])+'">')+
    '</label>';
  const statusOptions=selected=>statuses.map(s=>'<option value="'+s+'"'+(selected===s?' selected':'')+'>'+esc(t(s))+'</option>').join('');
  function renderCards(){
    const list=state.applications.filter(a=>filter==='all'||a.status===filter);
    const host=document.getElementById('qd-cards');if(!host)return;
    host.innerHTML=list.length?list.slice().sort((a,b)=>(a.next||'9999').localeCompare(b.next||'9999')||b.date.localeCompare(a.date)).map(a=>
      '<article class="qd-card"><div class="qd-card-head"><div><h3>'+esc(a.company)+'</h3><p>'+esc(a.role)+'</p></div><span class="qd-status">'+esc(t(a.status))+'</span></div>'+
      '<div class="qd-dates">'+(a.date?esc(t('date'))+': '+esc(a.date)+' · ':'')+(a.next?esc(t('next'))+': '+esc(a.next):'')+'</div>'+
      (a.notes?'<p class="qd-notes">'+br(a.notes)+'</p>':'')+
      '<div class="qd-actions">'+(a.link?'<a href="'+esc(a.link)+'" target="_blank" rel="noopener noreferrer">'+esc(t('open'))+' ↗</a>':'')+
      '<button type="button" data-qd-edit="'+esc(a.id)+'">'+esc(t('edit'))+'</button>'+
      '<button type="button" data-qd-delete="'+esc(a.id)+'">'+esc(t('delete'))+'</button></div></article>'
    ).join(''):'<p class="qd-empty">'+esc(t('empty'))+'</p>';
  }
  function renderForm(){
    const a=state.applications.find(x=>x.id===editing)||{company:'',role:'',link:'',date:'',status:'draft',next:'',notes:''};
    const form=document.getElementById('qd-application-form');if(!form)return;
    const fieldsApp=[['company','text',120],['role','text',120],['link','url',550],['date','date',10],['next','date',10]];
    const option=(k,type,max)=>'<label class="qd-field"><span>'+esc(t(k))+'</span><input name="'+k+'" type="'+type+'"'+(type==='text'||type==='url'?' maxlength="'+max+'"':'')+' value="'+esc(a[k])+'"></label>';
    form.innerHTML='<div class="qd-form-grid">'+fieldsApp.map(x=>option(...x)).join('')+
      '<label class="qd-field"><span>'+esc(t('status'))+'</span><select name="status">'+statusOptions(a.status)+'</select></label></div>'+
      '<label class="qd-field"><span>'+esc(t('notes'))+'</span><textarea name="notes" maxlength="900" rows="3">'+esc(a.notes)+'</textarea></label>'+
      '<div class="qd-actions"><button type="submit" class="qd-primary">'+esc(t(editing?'update':'save'))+'</button>'+
      (editing?'<button type="button" data-qd-cancel>'+esc(t('cancel'))+'</button>':'')+'</div>';
  }
  function render(){
    const main=document.getElementById('main');if(!main)return;
    const options=variants.map(v=>'<option value="'+v+'"'+(state.variant===v?' selected':'')+'>'+esc(t(v))+'</option>').join('');
    main.innerHTML='<section class="qd-wrap" data-no-translate="true" aria-labelledby="qd-title">'+
      '<header class="qd-hero"><div class="qd-kicker">QEXUS FISHERIES · CANDIDATE DESK</div><h1 tabindex="-1" id="qd-title">'+esc(t('title'))+'</h1><p>'+esc(t('intro'))+'</p></header>'+
      '<p class="qd-privacy">'+esc(t('privacy'))+'</p>'+
      '<section class="qd-panel"><h2>'+esc(t('candidate'))+'</h2><p class="qd-muted">'+esc(t('fieldsHint'))+'</p>'+
      '<div class="qd-form-grid"><label class="qd-field"><span>'+esc(t('variant'))+'</span><select data-qd-variant>'+options+'</select></label>'+
      field('name')+field('contact')+field('location')+field('position')+field('company')+'</div>'+
      field('summary',true)+field('experience',true)+field('skills',true)+field('training',true)+field('coverNotes',true)+
      '<div class="qd-actions"><button type="button" class="qd-primary" data-qd-print>'+esc(t('print'))+'</button></div><p class="qd-muted">'+esc(t('printHint'))+'</p></section>'+
      '<section class="qd-panel"><h2>'+esc(t('preview'))+'</h2><div id="qd-print">'+renderPreview()+'</div></section>'+
      '<section class="qd-panel"><div class="qd-board-head"><div><h2>'+esc(t('board'))+'</h2><p class="qd-muted">'+esc(t('boardInfo'))+'</p></div>'+
      '<label class="qd-field"><span>'+esc(t('filter'))+'</span><select data-qd-filter><option value="all">'+esc(t('all'))+'</option>'+statusOptions(filter)+'</select></label></div>'+
      '<form id="qd-application-form" autocomplete="off"></form><div id="qd-cards" aria-live="polite"></div></section>'+
      '<div class="qd-bottom"><button type="button" data-qd-reset>'+esc(t('reset'))+'</button></div><p class="qd-feedback" id="qd-feedback" role="status" aria-live="polite">'+esc(message)+'</p></section>';
    renderForm();renderCards();
    if(filter!=='all'){const sel=main.querySelector('[data-qd-filter]');if(sel)sel.value=filter;}
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('menuToggle')?.setAttribute('aria-expanded','false');
  }
  function announce(){const el=document.getElementById('qd-feedback');if(el)el.textContent=message}
  function asEntry(form,id){
    const get=k=>String(form.elements.namedItem(k)?.value||'');
    const entry={id:id||('a'+Date.now().toString(36)+Math.random().toString(36).slice(2,8)),company:get('company').trim(),role:get('role').trim(),
      link:get('link').trim(),date:get('date'),status:get('status'),next:get('next'),notes:get('notes').trim()};
    return validApplication(entry)?entry:null;
  }
  document.addEventListener('input',e=>{
    const input=e.target;if(!input.closest('.qd-wrap')||!input.dataset.qdField)return;
    const id=input.dataset.qdField;if(!(id in fields))return;
    state.cv[id]=input.value.slice(0,fields[id]);persist();
    const preview=document.getElementById('qd-print');if(preview)preview.innerHTML=renderPreview();
    announce();
  });
  document.addEventListener('change',e=>{
    const input=e.target;if(!input.closest('.qd-wrap'))return;
    if(input.matches('[data-qd-variant]')&&variants.includes(input.value)){state.variant=input.value;persist();render();}
    if(input.matches('[data-qd-filter]')){filter=['all',...statuses].includes(input.value)?input.value:'all';renderCards();}
  });
  document.addEventListener('submit',e=>{
    if(e.target.id!=='qd-application-form')return;
    e.preventDefault();const entry=asEntry(e.target,editing);
    if(!entry){message=t('errors');announce();return;}
    const index=state.applications.findIndex(x=>x.id===editing);
    if(index>=0)state.applications[index]=entry;
    else{if(state.applications.length>=100){message=t('full');announce();return;}state.applications.push(entry);}
    editing=null;persist();render();
  });
  document.addEventListener('click',e=>{
    const btn=e.target.closest('[data-qd-view="desk"]');
    if(btn){e.preventDefault();render();return;}
    const target=e.target.closest('.qd-wrap');if(!target)return;
    const edit=e.target.closest('[data-qd-edit]');
    if(edit){editing=edit.dataset.qdEdit;renderForm();document.getElementById('qd-application-form')?.scrollIntoView({block:'center'});return;}
    const remove=e.target.closest('[data-qd-delete]');
    if(remove){if(!window.confirm(t('deleteConfirm')))return;state.applications=state.applications.filter(a=>a.id!==remove.dataset.qdDelete);if(editing===remove.dataset.qdDelete)editing=null;persist();render();return;}
    if(e.target.closest('[data-qd-cancel]')){editing=null;renderForm();return;}
    if(e.target.closest('[data-qd-print]')){message=t('pdfOnly');announce();window.print?.();return;}
    if(e.target.closest('[data-qd-reset]')){if(!window.confirm(t('resetConfirm')))return;state=blank();editing=null;filter='all';persist();render();}
  });
  document.querySelectorAll('[data-qd-view="desk"] .qd-nav-label').forEach(el=>el.textContent=t('nav'));
  window.qxCandidateDesk={
    render,validateSnapshot,
    exportState(){return JSON.parse(JSON.stringify(state));},
    restoreState(snapshot){if(snapshot===undefined)return true;if(!validateSnapshot(snapshot,country))return false;
      state=JSON.parse(JSON.stringify(snapshot));persist();if(document.querySelector('.qd-wrap'))render();return true;}
  };
})();
