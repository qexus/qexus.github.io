/* Shared, privacy-first candidate journey for Fisheries Norway and Canada.
   Only coarse preferences and manually checked steps are stored in the browser. */
(() => {
  'use strict';
  const country = location.pathname.includes('/fisheries-ca/') ? 'canada' : 'norway';
  const storageKey = 'qexus-candidate-journey-' + country + '-v1';
  const languageHint = new URLSearchParams(location.search).get('lang') || document.documentElement.lang || 'ru';
  const lang = ['ru','fr','uk'].includes(languageHint) ? languageHint : 'ru';
  const idx = {ru:0,fr:1,uk:2}[lang];
  const labels = {
    nav:['Мой маршрут','Mon parcours','Мій маршрут'],
    title:['Мой маршрут к работе','Mon parcours vers l’emploi','Мій маршрут до роботи'],
    intro:['Пошаговый план подготовки под твою ситуацию. Отметки — только твои, не официальное подтверждение допуска или квалификации.','Un plan étape par étape pour préparer votre candidature. Les cases cochées ne constituent pas une validation officielle des qualifications ou du droit au travail.','Покроковий план підготовки відповідно до твоєї ситуації. Позначки не підтверджують офіційно кваліфікацію чи право на роботу.'],
    country:['Страна поиска','Pays ciblé','Країна пошуку'],
    norway:['Норвегия','Norvège','Норвегія'],
    canada:['Канада','Canada','Канада'],
    changeCountry:['Сменить страну','Changer de pays','Змінити країну'],
    track:['Направление работы','Domaine d’emploi','Напрям роботи'],
    shore:['Завод / берег','Usine / à terre','Завод / берег'],
    vessel:['Рыболовное судно','Navire de pêche','Риболовне судно'],
    aquaculture:['Аквакультура / ферма','Aquaculture / ferme','Аквакультура / ферма'],
    experience:['Опыт в отрасли','Expérience dans le secteur','Досвід у галузі'],
    new:['Начинаю с нуля','Je débute','Починаю з нуля'],
    experienced:['У меня уже есть опыт','J’ai déjà de l’expérience','Я вже маю досвід'],
    languages:['Я могу общаться на языках','Je peux communiquer en','Я можу спілкуватися мовами'],
    english:['Английский','Anglais','Англійська'],
    french:['Французский','Français','Французька'],
    norwegian:['Норвежский','Norvégien','Норвезька'],
    other:['Другой язык','Autre langue','Інша мова'],
    docs:['Что уже подготовлено (только отметки, без файлов)','Ce que j’ai déjà préparé (cases à cocher, sans fichiers)','Що вже підготовлено (лише позначки, без файлів)'],
    id:['Документ личности','Pièce d’identité','Документ, що посвідчує особу'],
    cv:['Резюме (CV)','CV','Резюме (CV)'],
    training:['Подтверждения обучения / опыта','Preuves de formation / d’expérience','Підтвердження навчання / досвіду'],
    work:['Я сам проверил требования к праву на работу','J’ai vérifié moi-même les conditions du droit au travail','Я сам перевірив вимоги до права на роботу'],
    safety:['Не вводи номер паспорта, SIN/NAS, дату рождения, адрес, медицинские сведения или данные разрешения. Это не юридическая проверка и не заявка работодателю.','Ne saisissez pas de numéro de passeport, NAS, date de naissance, adresse, renseignements médicaux ni détails de permis. Ce n’est ni un avis juridique ni une candidature.','Не вводь номер паспорта, SIN/NAS, дату народження, адресу, медичні дані чи реквізити дозволу. Це не юридична перевірка й не заявка роботодавцю.'],
    steps:['Твои следующие действия','Les prochaines étapes','Твої наступні дії'],
    progress:['Выполнено','Terminées','Виконано'],
    next:['Следующее действие','Prochaine action','Наступна дія'],
    proof:['Как проверить результат','Comment vérifier le résultat','Як перевірити результат'],
    mark:['Сделано мной','Fait par moi','Зроблено мною'],
    done:['Готово','Terminé','Готово'],
    open:['Открыть раздел или источник','Ouvrir la section ou la source','Відкрити розділ або джерело'],
    source:['Официальный источник','Source officielle','Офіційне джерело'],
    saved:['Сохранено на этом устройстве','Enregistré sur cet appareil','Збережено на цьому пристрої'],
    unavailable:['Браузер не сохранил план. Экспортируй резервную копию JSON в разделе источников.','Le navigateur n’a pas enregistré le plan. Exportez une sauvegarde JSON dans la section Sources.','Браузер не зберіг план. Експортуй резервну копію JSON у розділі джерел.'],
    reset:['Сбросить мой план','Réinitialiser mon plan','Скинути мій план'],
    resetConfirm:['Удалить местные настройки маршрута и все отметки?','Effacer les préférences et toutes les étapes terminées ?','Видалити локальні налаштування маршруту й усі позначки?'],
    resetDone:['Маршрут сброшен','Parcours réinitialisé','Маршрут скинуто'],
    resetOnTrack:['Направление изменено: отметки шагов сброшены, чтобы не считать новые требования выполненными.','Domaine modifié : les étapes ont été réinitialisées afin de revérifier les nouvelles exigences.','Напрям змінено: позначки скинуто, щоб перевірити нові вимоги.'],
    local:['Прогресс хранится только в браузере и включается в резервную копию JSON из раздела «Источники».','La progression reste dans ce navigateur et peut être sauvegardée en JSON dans « Sources ».','Прогрес зберігається лише в браузері та входить до резервної копії JSON у розділі «Джерела».'],
    allDone:['Все шаги отмечены. Перед откликом перепроверь актуальные условия и источники.','Toutes les étapes sont cochées. Vérifiez de nouveau les conditions et les sources avant de postuler.','Усі кроки позначені. Перед відгуком ще раз перевір актуальні умови та джерела.'],
    foundationTitle:['Разобраться в отрасли','Découvrir le secteur','Ознайомитися з галуззю'],
    foundationDesc:['Пройти вводные уроки о видах работы, рисках и базовых терминах.','Suivre les premières leçons sur les métiers, les risques et les termes essentiels.','Пройти вступні уроки про види роботи, ризики й основні терміни.'],
    foundationProof:['Могу объяснить разницу между выбранным направлением и другими видами работы.','Je sais expliquer les différences entre ce métier et les autres.','Можу пояснити різницю між обраним напрямом та іншими видами роботи.'],
    roleTitle:['Выбрать конкретную роль','Choisir un poste précis','Обрати конкретну посаду'],
    roleDesc:['Сопоставить задачи выбранного направления с профессиями и требованиями.','Comparer les tâches de ce domaine aux métiers et à leurs exigences.','Порівняти завдання обраного напряму з професіями та вимогами.'],
    roleProof:['Записал для себя название роли и нашёл её требования у работодателя или регулятора.','J’ai identifié le titre du poste et vérifié ses exigences auprès d’un employeur ou d’une autorité.','Знайшов назву посади та перевірив її вимоги в роботодавця чи регулятора.'],
    eligibilityTitle:['Лично проверить право на работу','Vérifier mon droit au travail','Особисто перевірити право на роботу'],
    eligibilityNo:['Открой требования UDI для своей ситуации. Профиль не определяет категорию ВНЖ, наличие права на работу или сроки.','Consultez les exigences de l’UDI pour votre situation. Ce profil ne détermine ni le permis de séjour ni le droit au travail.','Перевір вимоги UDI для своєї ситуації. Цей профіль не визначає тип дозволу на проживання чи право на роботу.'],
    eligibilityCa:['Открой требования IRCC и ограничения своего статуса или разрешения. Этот сайт не подтверждает право на работу.','Consultez les exigences d’IRCC et les conditions de votre statut ou permis. Ce site ne confirme pas le droit au travail.','Перевір вимоги IRCC та обмеження свого статусу чи дозволу. Цей сайт не підтверджує право на роботу.'],
    eligibilityProof:['Сверил действующий официальный источник и применимые условия, а не сделал вывод по этому чек-листу.','J’ai vérifié la source officielle et les conditions applicables, sans déduire une admissibilité de cette liste.','Перевірив чинне офіційне джерело та застосовні умови, а не зробив висновок із цього списку.'],
    languageTitle:['Проверить язык работы','Vérifier la langue de travail','Перевірити мову роботи'],
    languageDesc:['Уточни язык инструкций, собеседования и безопасности у конкретного работодателя. Выбранные языки здесь не означают подтверждённый уровень.','Confirmez la langue des consignes, de l’entretien et de la sécurité auprès de l’employeur. Les langues cochées ne prouvent aucun niveau.','Уточни мову інструкцій, співбесіди й безпеки у конкретного роботодавця. Позначені мови не підтверджують рівень.'],
    languageProof:['Могу понять ключевые команды по безопасности или знаю, какое обучение ещё требуется.','Je comprends les consignes essentielles de sécurité ou j’ai identifié la formation nécessaire.','Розумію основні команди з безпеки або знаю, яке навчання ще потрібне.'],
    qualificationTitle:['Уточнить обучение и допуски','Vérifier la formation et les certificats','Уточнити навчання й допуски'],
    qualificationVessel:['Судовая роль может требовать специальных курсов, морских документов и медосмотра. Проверь условия для типа судна и роли у регулятора и работодателя.','Un poste à bord peut exiger une formation, des documents maritimes et un examen médical. Vérifiez selon le navire et le poste.','Робота на судні може вимагати курсів, морських документів і медогляду. Перевір вимоги за типом судна й посадою.'],
    qualificationShore:['Для переработки проверь обучение по безопасности, гигиене и оборудованию у работодателя. Не покупай сертификаты без подтверждённой необходимости.','Pour l’usine, vérifiez les exigences de sécurité, d’hygiène et d’équipement auprès de l’employeur. N’achetez pas de certificats sans vérification.','Для переробки перевір вимоги з безпеки, гігієни й обладнання в роботодавця. Не купуй сертифікати без підтвердженої потреби.'],
    qualificationAqua:['Для аквакультуры проверь требования к работе на воде, биобезопасности, оборудованию и конкретным обязанностям.','En aquaculture, vérifiez les exigences liées au travail sur l’eau, à la biosécurité, à l’équipement et aux tâches réelles.','Для аквакультури перевір вимоги до роботи на воді, біобезпеки, обладнання й конкретних обов’язків.'],
    qualificationProof:['Есть список необходимых курсов со ссылкой на регулятора или объявление; необязательные курсы не выдаю за обязательные.','J’ai une liste des formations exigées avec une source officielle ou une offre, sans présenter les cours facultatifs comme obligatoires.','Маю перелік потрібних курсів із джерелом; не називаю необов’язкові курси обов’язковими.'],
    cvTitle:['Подготовить честный пакет кандидата','Préparer un dossier de candidature fidèle','Підготувати правдивий пакет кандидата'],
    cvDesc:['Проверь CV, подтверждения опыта и контактный способ отклика. Не указывай несуществующие навыки или сертификаты; не загружай личные документы на сайт.','Vérifiez votre CV, les preuves d’expérience et le canal de candidature. N’inventez ni compétences ni certificats et ne téléversez aucun document personnel.','Перевір CV, підтвердження досвіду й спосіб відгуку. Не вигадуй навички чи сертифікати й не завантажуй особисті документи.'],
    cvProof:['CV соответствует требованиям найденной вакансии, факты проверены мной.','Mon CV correspond à l’offre ciblée et toutes les informations ont été vérifiées.','CV відповідає знайденій вакансії, усі факти перевірено.'],
    employerTitle:['Найти работодателя и реальную вакансию','Trouver un employeur et une offre réelle','Знайти роботодавця та реальну вакансію'],
    employerDesc:['Сравни записи в реестре с официальными сайтами. Реестровая компания не означает, что она сейчас нанимает.','Comparez les registres aux sites officiels. Une entreprise inscrite au registre n’a pas nécessairement de postes ouverts.','Зістав реєстрові записи з офіційними сайтами. Реєстрова компанія не обов’язково наймає зараз.'],
    employerProof:['Нашёл страницу работодателя или официальное объявление с актуальными условиями и датой проверки.','J’ai trouvé une page d’emploi officielle et vérifié ses conditions ainsi que sa date.','Знайшов офіційне оголошення чи сторінку роботодавця й перевірив умови та дату.'],
    applyTitle:['Проверить условия и отправить отклик самому','Vérifier l’offre puis postuler soi-même','Перевірити умови та подати відгук самому'],
    applyDesc:['Проверь договор, оплату, жильё, график и законность контакта. Отправка CV происходит только на стороне работодателя — сайт ничего не отправляет.','Vérifiez contrat, rémunération, logement, horaires et contact. Le CV est envoyé uniquement par vous, sur le site de l’employeur.','Перевір договір, оплату, житло, графік і контакт. CV надсилаєш лише ти на стороні роботодавця.'],
    applyProof:['Я сам отправил заявку и сохранил у себя дату и ссылку.','J’ai postulé moi-même et conservé la date et le lien.','Я сам подав заявку та зберіг дату й посилання.'],
    followupTitle:['Запланировать следующий шаг','Planifier la suite','Спланувати наступний крок'],
    followupDesc:['Отметь дату личной проверки ответа, продолжай готовиться и не считай молчание работодателя подтверждением вакансии.','Notez quand revérifier une réponse, continuez à vous préparer et ne considérez pas un silence comme une confirmation.','Відзнач дату перевірки відповіді, продовжуй підготовку й не сприймай мовчання як підтвердження вакансії.'],
    followupProof:['У меня есть собственное напоминание и следующий конкретный шаг.','J’ai un rappel personnel et une prochaine action précise.','Маю власне нагадування та конкретний наступний крок.'],
    hintShore:['Фокус: переработка, упаковка, оборудование и санитария.','Priorité : transformation, emballage, machines et hygiène.','Фокус: переробка, пакування, обладнання та гігієна.'],
    hintVessel:['Фокус: обязанности на борту, тип судна и морские требования.','Priorité : tâches à bord, type de navire et exigences maritimes.','Фокус: обов’язки на борту, тип судна й морські вимоги.'],
    hintAqua:['Фокус: фермы, оборудование, работа на воде и биобезопасность.','Priorité : fermes, équipement, travail sur l’eau et biosécurité.','Фокус: ферми, обладнання, робота на воді й біобезпека.'],
    hintNoLanguage:['Языки не отмечены: начни с терминов безопасности и уточни язык вакансии.','Aucune langue cochée : commencez par le vocabulaire de sécurité et vérifiez la langue demandée.','Мови не позначені: почни з термінів безпеки й уточни мову вакансії.'],
    hintLanguageSelected:['Языки указаны: проверь, достаточно ли уровня для инструкций и собеседования.','Langues choisies : vérifiez votre niveau réel pour les consignes et l’entretien.','Мови вказані: перевір, чи вистачає рівня для інструкцій та співбесіди.'],
    hintCanadaLanguage:['Для канадской вакансии уточни требования к английскому или французскому.','Pour ce poste au Canada, vérifiez les exigences en anglais ou en français.','Для вакансії в Канаді уточни вимоги до англійської чи французької.'],
    hintNorwayLanguage:['Для норвежской вакансии уточни требования к норвежскому или английскому.','Pour ce poste en Norvège, vérifiez les exigences en norvégien ou en anglais.','Для вакансії в Норвегії уточни вимоги до норвезької чи англійської.'],
    hintWorkChecked:['Ты отметил проверку; для новой вакансии ещё раз сверяй действующие условия.','Vérification cochée : revérifiez les conditions en vigueur pour chaque nouvelle offre.','Перевірку позначено; для нової вакансії звіряй чинні умови знову.'],
    hintWorkUnchecked:['Проверка права на работу ещё не отмечена. Не делай вывод о допуске из анкеты.','Droit au travail non vérifié : ne déduisez aucune autorisation du questionnaire.','Право на роботу ще не перевірене. Не роби висновків про допуск з анкети.'],
    hintTrainingChecked:['Подтверждения отмечены: проверь, подходят ли они для выбранной роли.','Preuves cochées : vérifiez qu’elles conviennent au poste visé.','Підтвердження позначені: перевір, чи підходять вони для обраної посади.'],
    hintTrainingUnchecked:['Подтверждения не отмечены: сначала выясни, что действительно обязательно.','Aucune preuve cochée : vérifiez d’abord ce qui est réellement obligatoire.','Підтвердження не позначені: спочатку з’ясуй, що справді обов’язкове.'],
    hintCvChecked:['CV отмечено готовым: адаптируй его под конкретную вакансию.','CV indiqué prêt : adaptez-le à l’offre précise.','CV позначене готовим: адаптуй його до конкретної вакансії.'],
    hintCvUnchecked:['CV ещё не отмечено готовым: подготовь его до отклика.','CV non prêt : préparez-le avant de postuler.','CV ще не готове: підготуй його до відгуку.']
  };
  const tr = name => (labels[name] || [name,name,name])[idx];
  document.querySelectorAll('[data-qj-view="journey"] .qj-nav-label').forEach(el=>{el.textContent=tr('nav');});
  const safe = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tracks = ['shore','vessel','aquaculture'];
  const experiences = ['new','experienced'];
  const supportedLanguages = ['en','fr','no','other'];
  const documentFlags = ['id','cv','training','work'];
  const stepIds = ['foundation','role','eligibility','language','qualification','cv','employer','apply','followup'];
  const emptyState = () => ({version:1,country,profile:{track:'shore',experience:'new',languages:[],docs:{id:false,cv:false,training:false,work:false}},completed:{}});
  const plain = x => x !== null && typeof x === 'object' && !Array.isArray(x) && Object.getPrototypeOf(x) === Object.prototype;
  const only = (o,keys) => Object.keys(o).every(k => keys.includes(k));
  function validateSnapshot(x,expectedCountry) {
    if(!plain(x) || x.version !== 1 || x.country !== expectedCountry || !only(x,['version','country','profile','completed'])) return false;
    const p=x.profile, done=x.completed;
    if(!plain(p) || !only(p,['track','experience','languages','docs']) ||
       !tracks.includes(p.track) || !experiences.includes(p.experience) ||
       !Array.isArray(p.languages) || p.languages.length>4 ||
       new Set(p.languages).size!==p.languages.length ||
       !p.languages.every(x=>supportedLanguages.includes(x)))return false;
    if(!plain(p.docs)||!only(p.docs,documentFlags)||!documentFlags.every(k=>typeof p.docs[k]==='boolean'))return false;
    if(!plain(done)||!only(done,stepIds)||Object.values(done).some(x=>typeof x!=='boolean'))return false;
    return true;
  }
  function load() {
    try {
      const x=JSON.parse(localStorage.getItem(storageKey)||'null');
      return validateSnapshot(x,country)?x:emptyState();
    } catch { return emptyState(); }
  }
  let state = load();
  let feedback = '';
  function persist() {
    try{localStorage.setItem(storageKey,JSON.stringify(state));feedback=tr('saved');return true;}
    catch{feedback=tr('unavailable');return false;}
  }
  function localUrl(view) {
    const u=new URL(location.href);
    u.searchParams.set('view',view);
    u.searchParams.delete('lesson');
    u.hash='';
    return u.pathname+u.search;
  }
  function officialUrl() {
    return country==='canada'
      ? 'https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html'
      : 'https://www.udi.no/en/want-to-apply/work-immigration/';
  }
  function steps() {

  function contextual(id) {
    const p=state.profile;
    if(id==='role'){
      return tr(p.track==='vessel'?'hintVessel':p.track==='aquaculture'?'hintAqua':'hintShore');
    }
    if(id==='language'){
      if(p.languages.length===0)return tr('hintNoLanguage');
      const relevant=country==='canada'?['en','fr']:['en','no'];
      return p.languages.some(x=>relevant.includes(x))?tr('hintLanguageSelected'):tr(country==='canada'?'hintCanadaLanguage':'hintNorwayLanguage');
    }
    if(id==='eligibility')return tr(p.docs.work?'hintWorkChecked':'hintWorkUnchecked');
    if(id==='qualification')return tr(p.docs.training?'hintTrainingChecked':'hintTrainingUnchecked');
    if(id==='cv')return tr(p.docs.cv?'hintCvChecked':'hintCvUnchecked');
    return '';
  }
    const p=state.profile, course=localUrl('curriculum'), qualification=localUrl(p.track==='vessel'?'cert':'curriculum');
    const list=[];
    if(p.experience==='new')list.push({id:'foundation',title:'foundationTitle',desc:'foundationDesc',proof:'foundationProof',href:course});
    list.push({id:'role',title:'roleTitle',desc:'roleDesc',proof:'roleProof',href:localUrl('matrix')});
    list.push({id:'eligibility',title:'eligibilityTitle',desc:country==='canada'?'eligibilityCa':'eligibilityNo',proof:'eligibilityProof',href:officialUrl(),external:true});
    list.push({id:'language',title:'languageTitle',desc:'languageDesc',proof:'languageProof',href:localUrl('glossary')});
    list.push({id:'qualification',title:'qualificationTitle',desc:p.track==='vessel'?'qualificationVessel':p.track==='aquaculture'?'qualificationAqua':'qualificationShore',proof:'qualificationProof',href:qualification});
    list.push({id:'cv',title:'cvTitle',desc:'cvDesc',proof:'cvProof',href:localUrl('documents')});
    list.push({id:'employer',title:'employerTitle',desc:'employerDesc',proof:'employerProof',href:localUrl('employers')});
    list.push({id:'apply',title:'applyTitle',desc:'applyDesc',proof:'applyProof',href:localUrl('career')});
    list.push({id:'followup',title:'followupTitle',desc:'followupDesc',proof:'followupProof',href:localUrl('career')});
    return list;
  }
  const control = (id,name,options) => '<label class="qj-field" for="qj-'+id+'"><span>'+safe(tr(name))+'</span><select id="qj-'+id+'" data-qj-field="'+id+'">'+options.map(([key,label])=>'<option value="'+key+'"'+(state.profile[id]===key?' selected':'')+'>'+safe(tr(label))+'</option>').join('')+'</select></label>';
  const checkbox = (key,label,checked,attr) => '<label class="qj-check"><input type="checkbox" '+attr+'="'+key+'" '+(checked?'checked ':'')+'><span>'+safe(tr(label))+'</span></label>';
  function render() {
    const main=document.getElementById('main');
    if(!main)return;
    const list=steps(),count=list.filter(s=>state.completed[s.id]).length;
    const percent=Math.round(100*count/list.length),first=list.find(s=>!state.completed[s.id]);
    const countryName=tr(country);
    const profile=state.profile;
    const languages=[['en','english'],['fr','french'],['no','norwegian'],['other','other']];
    const docs=[['id','id'],['cv','cv'],['training','training'],['work','work']];
    main.innerHTML='<section class="qj-wrap" data-no-translate="true" aria-labelledby="qj-title">'+
      '<div class="qj-hero"><div class="qj-kicker">QEXUS FISHERIES · CANDIDATE JOURNEY</div>'+
      '<h1 id="qj-title" tabindex="-1">'+safe(tr('title'))+'</h1><p>'+safe(tr('intro'))+'</p>'+
      '<div class="qj-country"><strong>'+safe(tr('country'))+': '+safe(countryName)+'</strong>'+
      '<a href="'+(country==='canada'?'/fisheries/':'/fisheries-ca/')+'?view=journey'+(lang==='ru'?'':'&lang='+lang)+'">'+safe(tr('changeCountry'))+' ↗</a></div></div>'+
      '<form id="qj-profile" class="qj-panel" autocomplete="off">'+
      '<div class="qj-form-grid">'+
      control('track','track',[['shore','shore'],['vessel','vessel'],['aquaculture','aquaculture']])+
      control('experience','experience',[['new','new'],['experienced','experienced']])+'</div>'+
      '<fieldset class="qj-fieldset"><legend>'+safe(tr('languages'))+'</legend><div class="qj-options">'+
      languages.map(([key,label])=>checkbox(key,label,profile.languages.includes(key),'data-qj-language')).join('')+
      '</div></fieldset><fieldset class="qj-fieldset"><legend>'+safe(tr('docs'))+'</legend><div class="qj-options">'+
      docs.map(([key,label])=>checkbox(key,label,profile.docs[key],'data-qj-doc')).join('')+
      '</div></fieldset><p class="qj-privacy">'+safe(tr('safety'))+'</p></form>'+
      '<section class="qj-panel" aria-label="'+safe(tr('steps'))+'"><div class="qj-progress-top"><h2>'+safe(tr('steps'))+'</h2>'+
      '<span class="qj-count">'+safe(tr('progress'))+': <strong>'+count+' / '+list.length+'</strong></span></div>'+
      '<div class="qj-progress" role="progressbar" aria-label="'+safe(tr('progress'))+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+percent+'"><span style="width:'+percent+'%"></span></div>'+
      (first?'<p class="qj-next"><strong>'+safe(tr('next'))+':</strong> '+safe(tr(first.title))+'</p>':
        '<p class="qj-next">'+safe(tr('allDone'))+'</p>')+
      '<ol class="qj-steps">'+list.map((s,i)=>'<li class="qj-step'+(state.completed[s.id]?' is-complete':'')+(first===s?' is-next':'')+'">'+
      '<div class="qj-step-main"><span class="qj-number">'+(i+1)+'</span><div class="qj-step-copy">'+
      '<h3>'+safe(tr(s.title))+'</h3><p>'+safe(tr(s.desc))+'</p>'+
      (contextual(s.id)?'<p class="qj-context">'+safe(contextual(s.id))+'</p>':'')+
      '<p class="qj-proof"><strong>'+safe(tr('proof'))+':</strong> '+safe(tr(s.proof))+'</p>'+
      '<div class="qj-step-actions"><a href="'+safe(s.href)+'"'+(s.external?' target="_blank" rel="noopener noreferrer"':'')+'>'+safe(tr(s.external?'source':'open'))+' ↗</a>'+
      '<label class="qj-mark"><input type="checkbox" data-qj-complete="'+s.id+'"'+(state.completed[s.id]?' checked':'')+'><span>'+safe(tr('mark'))+'</span></label></div>'+
      '</div></div></li>').join('')+'</ol></section>'+
      '<div class="qj-bottom"><p>'+safe(tr('local'))+'</p><button type="button" class="qj-reset" data-qj-reset>'+safe(tr('reset'))+'</button></div>'+
      '<p id="qj-feedback" class="qj-feedback" role="status" aria-live="polite">'+safe(feedback)+'</p></section>';
    const toggler=document.getElementById('menuToggle'),sidebar=document.getElementById('sidebar');
    if(sidebar)sidebar.classList.remove('open');
    if(toggler)toggler.setAttribute('aria-expanded','false');
  }
  function handleChange(e) {
    if(!e.target.closest('.qj-wrap'))return;
    const el=e.target;
    if(el.dataset.qjField){
      const field=el.dataset.qjField,value=el.value;
      if(field==='track'&&tracks.includes(value)&&state.profile.track!==value){
        state.profile.track=value;state.completed={};feedback=tr('resetOnTrack');
      } else if(field==='experience'&&experiences.includes(value)&&state.profile.experience!==value){
        state.profile.experience=value;state.completed={};feedback=tr('resetOnTrack');
      } else return;
      const msg=feedback;persist();feedback=msg;render();return;
    }
    if(el.dataset.qjLanguage){
      const value=el.dataset.qjLanguage;
      if(!supportedLanguages.includes(value))return;
      state.profile.languages=el.checked?[...new Set([...state.profile.languages,value])]:state.profile.languages.filter(x=>x!==value);
    }else if(el.dataset.qjDoc){
      if(!documentFlags.includes(el.dataset.qjDoc))return;
      state.profile.docs[el.dataset.qjDoc]=el.checked;
    }else if(el.dataset.qjComplete){
      if(!stepIds.includes(el.dataset.qjComplete))return;
      state.completed[el.dataset.qjComplete]=el.checked;
    }else return;
    persist();render();
  }
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-qj-view="journey"]')){
      e.preventDefault();feedback='';render();
      if(!e.target.closest('#nav'))document.getElementById('qj-title')?.focus({preventScroll:true});
      return;
    }
    if(e.target.closest('[data-qj-reset]')&&e.target.closest('.qj-wrap')){
      if(typeof window.confirm==='function'&&!window.confirm(tr('resetConfirm')))return;
      state=emptyState();persist();feedback=tr('resetDone');render();
    }
  });
  document.addEventListener('change',handleChange);
  window.qxCandidateJourney={
    exportState(){return JSON.parse(JSON.stringify(state));},
    validateSnapshot,
    restoreState(snapshot){
      if(snapshot===undefined)return true; // Old backups must remain importable.
      if(!validateSnapshot(snapshot,country))return false;
      state=JSON.parse(JSON.stringify(snapshot));
      persist();
      if(document.querySelector('.qj-wrap'))render();
      return true;
    },
    steps, render
  };
})();
