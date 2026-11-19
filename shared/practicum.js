/* qexus Fisheries practical scenarios: editorially sourced, browser-only and non-certifying. */
(() => {
  'use strict';
  const country = location.pathname.includes('/fisheries-ca/') ? 'canada' : 'norway';
  const param = new URLSearchParams(location.search);
  const requestedLang = param.get('lang') || document.documentElement.lang || 'ru';
  const lang = ['ru','fr','uk'].includes(requestedLang) ? requestedLang : 'ru';
  const localeIndex = {ru:0,fr:1,uk:2}[lang];
  const storeKey = 'qexus-practice-' + country + '-v1';
  const l = (...v) => v[localeIndex];
  const labels = {
    nav:l('Практикум','Exercices pratiques','Практикум'),
    heading:l('Решения в реальной работе','Prendre les bonnes décisions au travail','Рішення в реальній роботі'),
    sub:l('Шесть коротких ситуаций для подготовки к работе на судне, заводе и ферме, а также к проверке трудоустройства. Выбери действие и узнай почему.','Six mises en situation pour le navire, l’usine, la ferme et la recherche d’emploi. Choisissez une action et découvrez pourquoi.','Шість коротких ситуацій для судна, заводу, ферми та пошуку роботи. Обери дію і дізнайся чому.'),
    disclaimer:l('Это учебные примеры, а не обязательный инструктаж, морской сертификат, допуск к работе или юридическая консультация. В чрезвычайной ситуации выполняй инструкции обученного ответственного персонала и правила своего предприятия.','Exemples pédagogiques : ils ne remplacent pas la formation obligatoire, une certification maritime, une autorisation de travail ou un conseil juridique. En urgence, suivez les consignes de l’équipe compétente.','Це навчальні приклади, а не обов’язковий інструктаж, морський сертифікат, допуск до роботи чи юридична консультація. У надзвичайній ситуації дотримуйся вказівок відповідального персоналу.'),
    country:l('Страна','Pays','Країна'), countryName:l(country==='canada'?'Канада':'Норвегия',country==='canada'?'Canada':'Norvège',country==='canada'?'Канада':'Норвегія'),
    filter:l('Выбрать направление','Choisir un domaine','Обрати напрям'),
    all:l('Все ситуации','Toutes les situations','Усі ситуації'),
    vessel:l('Судно','Navire','Судно'), shore:l('Завод','Usine','Завод'), aqua:l('Аквакультура','Aquaculture','Аквакультура'), career:l('Работа и договор','Emploi et contrat','Робота і договір'),
    count:l('Правильных ответов','Réponses correctes','Правильних відповідей'),
    question:l('Что ты сделаешь?','Que faites-vous ?','Що ти зробиш?'),
    answer:l('Выбрать ответ','Valider la réponse','Перевірити відповідь'),
    correct:l('Верное решение','Bonne décision','Правильне рішення'),
    retry:l('Нужно пересмотреть решение','Décision à revoir','Рішення варто переглянути'),
    explanation:l('Почему','Pourquoi','Чому'),
    takeaway:l('Запомни','À retenir','Запам’ятай'),
    reference:l('Официальный источник','Source officielle','Офіційне джерело'),
    noAnswer:l('Сначала выбери вариант.','Choisissez d’abord une réponse.','Спочатку обери відповідь.'),
    complete:l('Этот сценарий успешно разобран.','Scénario correctement résolu.','Сценарій правильно розібрано.'),
    needsRetry:l('Выбери другой вариант и попробуй ещё раз.','Essayez une autre réponse.','Обери інший варіант і спробуй ще раз.'),
    reset:l('Очистить мои ответы','Effacer mes réponses','Очистити мої відповіді'),
    confirm:l('Удалить результаты всех упражнений на этом устройстве?','Effacer toutes les réponses sur cet appareil ?','Видалити всі відповіді на цьому пристрої?'),
    resetDone:l('Ответы очищены.','Réponses effacées.','Відповіді очищено.'),
    local:l('Результаты сохраняются только в браузере и входят в JSON-копию раздела «Источники».','Les réponses restent dans ce navigateur et sont incluses dans la sauvegarde JSON de « Sources ».','Відповіді зберігаються лише в браузері та входять до JSON-копії розділу «Джерела».'),
    failSave:l('Не удалось сохранить ответ в браузере.','Impossible d’enregistrer la réponse dans le navigateur.','Не вдалося зберегти відповідь у браузері.'),
    next:l('Подготовка → безопасное действие → проверка источника','Préparation → geste sûr → vérification de la source','Підготовка → безпечна дія → перевірка джерела'),
    reviewed:l('Содержание: 18 ноября 2026. Перед практикой перепроверь официальный источник.','Contenu : 18 novembre 2026. Revérifiez la source officielle avant d’appliquer les consignes.','Зміст: 18 листопада 2026. Перед практикою перевір офіційне джерело.')
  };
  const sourceUrls = {
    vessel: country==='canada'
      ? 'https://tc.canada.ca/en/marine-transportation/marine-safety/ship-safety-bulletins/fishing-vessels-safety-procedures-crew-familiarization-ssb-no-14-2024'
      : 'https://www.sdir.no/en/Seafarers/Certificates/requirements-for-working-on-fishing-vessels/',
    ppe: country==='canada'
      ? 'https://www.ccohs.ca/oshanswers/prevention/ppe/designin.html'
      : 'https://www.arbeidstilsynet.no/en/laws-and-regulations/laws/working-environment-act/',
    hygiene: country==='canada'
      ? 'https://inspection.canada.ca/en/food-safety-industry/preventive-control-plans/controls-food/fish'
      : 'https://www.mattilsynet.no/mat-og-drikke/matproduksjon/fisk-og-sjomat',
    scam: country==='canada'
      ? 'https://antifraudcentre-centreantifraude.ca/scams-fraudes/job-emploi-eng.htm'
      : 'https://www.udi.no/en/word-definitions/confirmation-of-a-job-offer/',
    contract: country==='canada'
      ? 'https://www.ircc.canada.ca/english/helpcentre/answer.asp?qnum=1200&top=17'
      : 'https://www.arbeidstilsynet.no/en/pay-and-engagement-of-employees/contract-of-employment/',
    aqua: country==='canada'
      ? 'https://inspection.canada.ca/en/animal-health/aquatic-animals/aquatic-animal-biosecurity'
      : 'https://mattilsynet.no/en/fish-and-aquaculture/health-status-of-approved-aquaculture-facilities'
  };
  const scenarios = [
    {
      id:'vessel-command', category:'vessel', icon:'⚓', source:sourceUrls.vessel,
      title:l('Непонятная команда на палубе','Une consigne mal comprise sur le pont','Незрозуміла команда на палубі'),
      scene:l('Ты впервые на рыболовном судне. Во время работы с снастями получаешь команду, но из-за шума и языка не понимаешь её.','C’est votre première sortie en mer. Durant la manipulation des engins de pêche, le bruit vous empêche de comprendre un ordre.','Ти вперше на риболовному судні. Під час роботи зі снастями через шум і мову не розумієш команду.'),
      choices:[
        l('Повторить действия соседа наугад, чтобы не задерживать работу.','Imiter un collègue sans être sûr pour ne pas retarder le travail.','Навмання повторити дії колеги, щоб не затримувати роботу.'),
        l('Не выполнять непонятное опасное действие, попросить повторить команду и показать безопасную процедуру.','Ne pas exécuter la manœuvre risquée ; demander la consigne à nouveau et une démonstration sûre.','Не виконувати незрозумілу небезпечну дію, попросити повторити команду й показати безпечний порядок.'),
        l('Продолжить работу молча и разобраться в следующую смену.','Continuer en silence et demander des explications au prochain quart.','Мовчки продовжити й розібратися наступної зміни.')
      ], correct:1,
      why:l('Перед работой экипажу необходимо понимать процедуры, свои обязанности и действия при опасности. Угадывание команды рядом с оборудованием может увеличить риск.','L’équipage doit comprendre les procédures et les consignes avant d’effectuer des manœuvres dangereuses. Deviner un ordre augmente les risques.','Екіпаж має розуміти процедури й інструкції до небезпечної роботи. Вгадування команди поруч з обладнанням підвищує ризик.'),
      takeaway:l('Проси инструктаж и подтверждение понимания до действий со снастями и механизмами.','Demandez des explications et confirmez votre compréhension avant de manipuler les équipements.','Проси інструктаж і підтвердження розуміння до роботи зі снастями та механізмами.')
    },
    {
      id:'factory-ppe', category:'shore', icon:'🦺', source:sourceUrls.ppe,
      title:l('Повреждённая защита','Équipement de protection endommagé','Пошкоджений захист'),
      scene:l('Перед запуском линии ты замечаешь, что нужные по инструкции средства защиты повреждены. Коллега предлагает «отработать одну смену и так».','Avant le démarrage, vous remarquez que l’équipement de protection requis est endommagé. Un collègue vous propose de continuer quand même.','Перед запуском лінії ти бачиш, що потрібний за інструкцією захист пошкоджено. Колега радить «відпрацювати так одну зміну».'),
      choices:[
        l('Сообщить руководителю о неисправности, не начинать опасный этап и запросить исправный комплект и указания.','Signaler le défaut, ne pas commencer la tâche dangereuse et demander un équipement conforme et des consignes.','Повідомити керівника, не починати небезпечний етап і попросити справне спорядження та вказівки.'),
        l('Самостоятельно сделать временный ремонт и продолжить без проверки.','Réparer rapidement le matériel soi-même et reprendre sans contrôle.','Самостійно тимчасово відремонтувати захист і продовжити без перевірки.'),
        l('Снять повреждённую защиту и работать без неё.','Retirer l’équipement abîmé et travailler sans protection.','Зняти пошкоджений захист і працювати без нього.')
      ], correct:0,
      why:l('Подбор, исправность и обучение использованию защиты должны учитывать реальные риски. Повреждённый PPE не следует считать пригодным без проверки.','La sélection, l’état et l’utilisation des EPI doivent correspondre aux risques. Un EPI endommagé ne doit pas être tenu pour sûr sans vérification.','Вибір, стан і використання захисту мають відповідати ризикам. Пошкоджені ЗІЗ не можна вважати безпечними без перевірки.'),
      takeaway:l('Откладывай опасную операцию до устранения риска и следуй процедурам работодателя.','Reportez une tâche risquée jusqu’à maîtrise du danger et suivez les procédures de l’employeur.','Відкладай небезпечну операцію до усунення ризику й дотримуйся процедур роботодавця.')
    },
    {
      id:'factory-hygiene', category:'shore', icon:'🐟', source:sourceUrls.hygiene,
      title:l('Загрязнение на линии','Risque de contamination sur la chaîne','Забруднення на лінії'),
      scene:l('Инструмент упал на грязный пол, затем его собираются вернуть к обработке пищевой рыбы без очистки.','Un outil tombe sur un sol sale et quelqu’un veut le remettre en contact avec le poisson sans nettoyage.','Інструмент упав на брудну підлогу, і його хочуть повернути до обробки харчової риби без очищення.'),
      choices:[
        l('Быстро сполоснуть водой на глаз и вернуть без уведомления.','Le rincer brièvement sans avertir qui que ce soit.','Швидко обполоснути водою й повернути без повідомлення.'),
        l('Продолжить, потому что продукт всё равно потом заморозят.','Continuer parce que le produit sera congelé plus tard.','Продовжити, бо продукт потім усе одно заморозять.'),
        l('Остановить использование инструмента и сообщить о возможном загрязнении; выполнить установленную процедуру очистки и контроля.','Écarter l’outil et signaler la contamination possible ; suivre les procédures prévues de nettoyage et de contrôle.','Припинити використовувати інструмент і повідомити про можливе забруднення; виконати процедуру очищення та контролю.')
      ], correct:2,
      why:l('Профилактические меры и санитарные процедуры нужны для контроля загрязнения рыбы и оборудования. Замораживание не делает нарушение гигиены допустимым.','Les contrôles préventifs et les procédures d’hygiène visent à réduire la contamination des aliments et des équipements. La congélation ne remplace pas l’hygiène.','Профілактичні заходи й гігієна потрібні для контролю забруднення продукту та обладнання. Заморожування не виправдовує порушення гігієни.'),
      takeaway:l('Соблюдай план санитарного контроля конкретного предприятия, а не универсальные догадки.','Suivez le plan de contrôle sanitaire de votre établissement et non des suppositions.','Дотримуйся плану санітарного контролю конкретного підприємства, а не припущень.')
    },
    {
      id:'offer-check', category:'career', icon:'🔎', source:sourceUrls.scam,
      title:l('Подозрительное приглашение','Invitation de recrutement douteuse','Підозріле запрошення'),
      scene:l('В мессенджере незнакомец использует логотип настоящей компании. За «гарантированное место» он просит плату и фото паспорта до интервью.','Une personne inconnue utilise le logo d’une vraie entreprise dans un message et demande de l’argent et une photo de passeport pour « garantir » un poste.','Незнайомець використовує логотип справжньої компанії та просить гроші й фото паспорта за «гарантовану вакансію».'),
      choices:[
        l('Сразу отправить деньги и документы, чтобы место не заняли.','Envoyer tout de suite l’argent et les documents pour réserver le poste.','Одразу надіслати гроші й документи, щоб не втратити місце.'),
        l('Ничего не отправлять; найти официальный сайт и самостоятельно проверить контакт, вакансию и условия.','Ne rien envoyer ; retrouver le site officiel et vérifier soi-même le contact, le poste et les conditions.','Нічого не надсилати; знайти офіційний сайт і самому перевірити контакт, вакансію та умови.'),
        l('Попросить скидку на «оформление», но согласиться.','Négocier une réduction des frais de « dossier » puis accepter.','Попросити знижку за «оформлення», але погодитися.')
      ], correct:1,
      why:l('Использование настоящего бренда не доказывает подлинности сообщения. Запрос денег и чувствительных документов до проверки — серьёзные предупреждающие признаки.','L’usage d’une véritable marque ne garantit pas l’authenticité du message. Le paiement et la demande de documents sensibles avant vérification sont des signaux d’alerte.','Справжній логотип не підтверджує справжність повідомлення. Вимога грошей і чутливих документів до перевірки — серйозні ознаки ризику.'),
      takeaway:l('Проверяй предложение через независимый официальный канал, не через ссылку неизвестного отправителя.','Vérifiez l’offre par un canal officiel indépendant du message reçu.','Перевіряй пропозицію незалежним офіційним каналом, а не через посилання від незнайомця.')
    },
    {
      id:'contract-terms', category:'career', icon:'📝', source:sourceUrls.contract,
      title:l('Неполные условия договора','Conditions de travail incomplètes','Неповні умови договору'),
      scene:l('Тебя зовут на сезонную работу. Письмо говорит «хорошая зарплата и жильё», но не указывает ставку, удержания, график и условия проживания.','On vous propose un emploi saisonnier avec « bon salaire et logement », sans taux horaire, retenues, horaires ni conditions d’hébergement.','Тобі пропонують сезонну роботу з «гарною зарплатою й житлом», але без ставки, утримань, графіка й умов проживання.'),
      choices:[
        l('Попросить письменные конкретные условия и проверить их у работодателя до решения.','Demander les conditions détaillées par écrit et les vérifier auprès de l’employeur avant de décider.','Попросити конкретні письмові умови й перевірити їх у роботодавця перед рішенням.'),
        l('Согласиться сразу: подробности обычно узнают по приезде.','Accepter aussitôt : on verra les détails après l’arrivée.','Одразу погодитися: деталі можна дізнатися після приїзду.'),
        l('Поверить только обещанной сумме в рекламе.','Se fier uniquement au montant annoncé dans la publicité.','Повірити лише сумі з реклами.')
      ], correct:0,
      why:l('Официальные материалы по трудоустройству рекомендуют проверять условия найма, оплату и другие важные положения в письменном виде. Применимые нормы различаются по стране и ситуации.','Les ressources officielles invitent à vérifier par écrit la rémunération et les conditions d’emploi. Les règles applicables varient selon le pays et la situation.','Офіційні матеріали рекомендують перевіряти письмово оплату та умови найму. Застосовні правила різняться за країною й обставинами.'),
      takeaway:l('Не делай выводов о доходе «на руки» или правах по краткой рекламе.','Ne déduisez pas votre salaire net ou vos droits d’une annonce vague.','Не роби висновків про зарплату «на руки» чи права з нечіткої реклами.')
    },
    {
      id:'aqua-biosecurity', category:'aqua', icon:'🌊', source:sourceUrls.aqua,
      title:l('Оборудование между фермами','Déplacement d’équipements entre fermes','Обладнання між фермами'),
      scene:l('Сетку и инструменты хотят перевезти с другой рыбной фермы. Тебе неизвестны статус здоровья животных и требования по очистке между площадками.','Des filets et outils arrivent d’une autre ferme. Leur état sanitaire et les règles de nettoyage entre sites ne sont pas connus.','Сітки й інструменти везуть з іншої ферми. Стан здоров’я риби та правила очищення між об’єктами невідомі.'),
      choices:[
        l('Применять без проверки, ведь оборудование выглядит чистым.','Les utiliser sans vérifier, puisqu’ils semblent propres.','Використати без перевірки, бо обладнання виглядає чистим.'),
        l('Только высушить на воздухе и сразу переместить.','Les laisser sécher puis les déplacer aussitôt.','Лише висушити й одразу перевезти.'),
        l('Проверить статус и протокол биобезопасности, согласовать необходимую очистку и дезинфекцию с ответственным специалистом.','Vérifier le statut sanitaire et le protocole de biosécurité, puis faire valider nettoyage et désinfection par le responsable.','Перевірити санітарний статус і протокол біобезпеки, погодити очищення та дезінфекцію з відповідальним фахівцем.')
      ], correct:2,
      why:l('Биобезопасность учитывает перенос патогенов с оборудованием, животными и людьми между площадками. Конкретные действия определяются планом хозяйства и требованиями регулятора.','La biosécurité vise notamment les agents pathogènes transportés par l’équipement, les animaux et les personnes. Le plan du site et l’autorité compétente fixent les mesures.','Біобезпека враховує перенесення збудників з обладнанням, тваринами та людьми. Дії визначаються планом господарства й вимогами регулятора.'),
      takeaway:l('Внешне чистый инвентарь не гарантирует биологическую безопасность.','Un équipement visiblement propre n’est pas nécessairement sûr sur le plan biologique.','Зовні чистий інвентар не гарантує біологічну безпеку.')
    }
  ];
  const categories=['all','vessel','shore','aqua','career'];
  const ids=scenarios.map(s=>s.id);
  const plain=o=>o!==null&&typeof o==='object'&&!Array.isArray(o)&&Object.getPrototypeOf(o)===Object.prototype;
  function validateSnapshot(s,expectedCountry) {
    if(!plain(s)||s.version!==1||s.country!==expectedCountry||!plain(s.answers)||
       !Object.keys(s).every(k=>['version','country','answers'].includes(k)))return false;
    return Object.keys(s.answers).every(id=>ids.includes(id)&&Number.isInteger(s.answers[id])&&s.answers[id]>=0&&s.answers[id]<3);
  }
  function fresh(){return {version:1,country,answers:{}}}
  function load(){
    try{const data=JSON.parse(localStorage.getItem(storeKey)||'null');return validateSnapshot(data,country)?data:fresh()}catch{return fresh();}
  }
  let state=load(),category='all',feedback='';
  function save(){
    try{localStorage.setItem(storeKey,JSON.stringify(state));return true;}
    catch {feedback=labels.failSave;return false;}
  }
  function safe(v){return String(v??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));}
  function correctCount(){return scenarios.filter(s=>state.answers[s.id]===s.correct).length;}
  function render() {
    const main=document.getElementById('main');if(!main)return;
    const shown=scenarios.filter(s=>category==='all'||s.category===category);
    const completed=correctCount();
    main.innerHTML='<section class="qp-wrap" data-no-translate="true" aria-labelledby="qp-title">'+
      '<header class="qp-hero"><div class="qp-kicker">QEXUS FISHERIES · SAFETY PRACTICE</div><h1 id="qp-title" tabindex="-1">'+safe(labels.heading)+'</h1>'+
      '<p>'+safe(labels.sub)+'</p><div class="qp-meta">'+safe(labels.country)+': '+safe(labels.countryName)+'</div></header>'+
      '<div class="qp-disclaimer">'+safe(labels.disclaimer)+'</div>'+
      '<div class="qp-toolbar"><label for="qp-category">'+safe(labels.filter)+
      ' <select id="qp-category" data-qp-filter>'+categories.map(k=>'<option value="'+k+'"'+(category===k?' selected':'')+'>'+safe(labels[k])+'</option>').join('')+'</select></label>'+
      '<div class="qp-score"><strong>'+completed+' / '+scenarios.length+'</strong> '+safe(labels.count)+'</div></div>'+
      '<div class="qp-progress" role="progressbar" aria-label="'+safe(labels.count)+'" aria-valuemin="0" aria-valuemax="'+scenarios.length+'" aria-valuenow="'+completed+'"><span style="width:'+(100*completed/scenarios.length)+'%"></span></div>'+
      '<div class="qp-flow" aria-label="'+safe(labels.next)+'"><span>'+safe(labels.next)+'</span></div>'+
      '<div class="qp-exercises">'+shown.map((s,i)=>{
        const chosen=state.answers[s.id];
        const answered=Number.isInteger(chosen);
        const right=answered&&chosen===s.correct;
        return '<article class="qp-card" id="qp-card-'+safe(s.id)+'"><div class="qp-card-top"><span class="qp-icon" aria-hidden="true">'+s.icon+'</span><span class="qp-area">'+safe(labels[s.category])+'</span>'+
          (right?'<span class="qp-pass">✓ '+safe(labels.correct)+'</span>':'')+'</div>'+
          '<h2 id="qp-heading-'+safe(s.id)+'" tabindex="-1">'+safe(s.title)+'</h2><p class="qp-situation">'+safe(s.scene)+'</p>'+
          '<fieldset class="qp-answers"><legend>'+safe(labels.question)+'</legend>'+
          s.choices.map((choice,k)=>'<label class="qp-choice'+(chosen===k?' is-chosen':'')+'"><input type="radio" name="qp-answer-'+safe(s.id)+'" value="'+k+'" data-qp-option="'+safe(s.id)+'"'+(chosen===k?' checked':'')+'><span>'+safe(choice)+'</span></label>').join('')+
          '</fieldset><button type="button" class="qp-submit" data-qp-submit="'+safe(s.id)+'">'+safe(labels.answer)+'</button>'+
          '<div class="qp-feedback" id="qp-feedback-'+safe(s.id)+'" aria-live="polite">'+(answered?
          '<div class="qp-result '+(right?'is-right':'is-wrong')+'"><strong>'+(right?safe(labels.correct):safe(labels.retry))+'</strong>'+
          '<p>'+safe(s.why)+'</p><p class="qp-takeaway"><b>'+safe(labels.takeaway)+':</b> '+safe(s.takeaway)+'</p>'+
          (!right?'<p>'+safe(labels.needsRetry)+'</p>':'')+'</div>':'')+'</div>'+
          '<p class="qp-reference"><a href="'+safe(s.source)+'" target="_blank" rel="noopener noreferrer">'+safe(labels.reference)+' ↗</a></p></article>';
      }).join('')+'</div><footer class="qp-footer"><p>'+safe(labels.local)+'</p><p>'+safe(labels.reviewed)+'</p>'+
      '<button type="button" data-qp-reset>'+safe(labels.reset)+'</button></footer><p class="qp-status" id="qp-status" role="status" aria-live="polite">'+safe(feedback)+'</p></section>';
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('menuToggle')?.setAttribute('aria-expanded','false');
  }
  document.addEventListener('click',e=>{
    const nav=e.target.closest('[data-qp-view="practice"]');
    if(nav){e.preventDefault();render();return;}
    if(!e.target.closest('.qp-wrap'))return;
    const submit=e.target.closest('[data-qp-submit]');
    if(submit){
      const id=submit.dataset.qpSubmit,s=scenarios.find(x=>x.id===id);
      if(!s)return;
      const chosen=document.querySelector('input[name="qp-answer-'+id+'"]:checked');
      if(!chosen){feedback=labels.noAnswer;const status=document.getElementById('qp-status');if(status)status.textContent=feedback;return;}
      const answer=Number(chosen.value);
      if(!Number.isInteger(answer)||answer<0||answer>2)return;
      state.answers[id]=answer;feedback='';save();render();
      document.getElementById('qp-heading-'+id)?.focus({preventScroll:true});
      return;
    }
    if(e.target.closest('[data-qp-reset]')){
      if(!window.confirm(labels.confirm))return;
      state=fresh();feedback=labels.resetDone;save();render();
    }
  });
  document.addEventListener('change',e=>{
    if(!e.target.closest('.qp-wrap'))return;
    if(e.target.matches('[data-qp-filter]')){
      category=categories.includes(e.target.value)?e.target.value:'all';render();
    }
  });
  document.querySelectorAll('[data-qp-view="practice"] .qp-nav-label').forEach(el=>el.textContent=labels.nav);
  window.qxPracticum={
    validateSnapshot,
    exportState(){return JSON.parse(JSON.stringify(state));},
    restoreState(snapshot){
      if(snapshot===undefined)return true; // Backwards-compatible backups.
      if(!validateSnapshot(snapshot,country))return false;
      state=JSON.parse(JSON.stringify(snapshot));save();
      if(document.querySelector('.qp-wrap'))render();
      return true;
    },
    render,
    scenarios:()=>scenarios.map(s=>({id:s.id,category:s.category,source:s.source,correct:s.correct,choices:s.choices.slice(),title:s.title}))
  };
})();
